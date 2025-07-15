"use client";
import { useState, useRef, useEffect } from "react";
import Swal from "sweetalert2";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { 
  FaCloudUploadAlt, 
  FaFile, 
  FaCheckCircle, 
  FaTimes,
  FaSpinner,
  FaImage,
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileVideo,
  FaFileAudio,
  FaFileCode,
  FaFileArchive,
  FaExclamationTriangle
} from "react-icons/fa";

interface UploadProps {
  onUploadSuccess?: () => void;
  onUploadError?: (error: string) => void;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  storageLimit?: number;
  currentStorageUsed?: number;
}

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const iconClass = "text-4xl mb-2";
  
  switch (ext) {
    case "pdf":
      return <FaFilePdf className={`${iconClass} text-red-500`} />;
    case "doc":
    case "docx":
      return <FaFileWord className={`${iconClass} text-blue-500`} />;
    case "xls":
    case "xlsx":
      return <FaFileExcel className={`${iconClass} text-emerald-500`} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "svg":
      return <FaImage className={`${iconClass} text-amber-500`} />;
    case "mp4":
    case "mkv":
    case "mov":
      return <FaFileVideo className={`${iconClass} text-purple-500`} />;
    case "mp3":
    case "wav":
    case "ogg":
      return <FaFileAudio className={`${iconClass} text-indigo-500`} />;
    case "js":
    case "ts":
    case "html":
    case "css":
    case "json":
      return <FaFileCode className={`${iconClass} text-green-500`} />;
    case "zip":
    case "rar":
    case "7z":
      return <FaFileArchive className={`${iconClass} text-slate-500`} />;
    default:
      return <FaFile className={`${iconClass} text-slate-400`} />;
  }
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function Upload({ 
  onUploadSuccess, 
  onUploadError,
  maxFileSize = 100 * 1024 * 1024, // 100MB default
  allowedTypes = [],
  storageLimit = 2 * 1024 * 1024 * 1024, // 2GB default
  currentStorageUsed = 0
}: UploadProps) {
  const { user } = useCurrentUser();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  // Reset validation error when file changes
  useEffect(() => {
    if (file) {
      setValidationError(null);
    }
  }, [file]);

  const validateFile = (selectedFile: File): string | null => {
    // Check file size
    if (selectedFile.size > maxFileSize) {
      return `File size exceeds ${formatFileSize(maxFileSize)} limit`;
    }

    // Check storage limit
    if (currentStorageUsed + selectedFile.size > storageLimit) {
      const remainingStorage = storageLimit - currentStorageUsed;
      return `Not enough storage space. Available: ${formatFileSize(remainingStorage)}`;
    }

    // Check file type if restrictions exist
    if (allowedTypes.length > 0) {
      const fileExtension = selectedFile.name.split('.').pop()?.toLowerCase();
      if (!fileExtension || !allowedTypes.includes(fileExtension)) {
        return `File type not allowed. Supported types: ${allowedTypes.join(', ')}`;
      }
    }

    return null;
  };

  const handleFileSelection = (selectedFile: File) => {
    const error = validateFile(selectedFile);
    if (error) {
      setValidationError(error);
      setFile(null);
      return;
    }
    
    setFile(selectedFile);
    setValidationError(null);
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    // Final validation before upload
    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || "",
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Upload failed");
      }

      const result = await response.json();
      
      // Success handling
      await Swal.fire({
        icon: "success",
        title: "🎉 Upload Successful!",
        text: "Your file has been uploaded successfully.",
        background: '#f8fafc',
        color: '#1e293b',
        confirmButtonColor: '#3b82f6',
        showClass: {
          popup: 'animate__animated animate__fadeInUp animate__faster'
        },
        hideClass: {
          popup: 'animate__animated animate__fadeOutDown animate__faster'
        }
      });

      // Reset form
      setFile(null);
      setUploadProgress(0);
      setValidationError(null);

      // Notify parent component
      if (onUploadSuccess) {
        onUploadSuccess();
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Upload failed";
      
      await Swal.fire({
        icon: "error",
        title: "❌ Upload Failed",
        text: errorMessage,
        background: '#fef2f2',
        color: '#7f1d1d',
        confirmButtonColor: '#dc2626',
      });

      if (onUploadError) {
        onUploadError(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  // Enhanced XMLHttpRequest upload with progress tracking
  const handleUploadWithProgress = () => {
    if (!file || !user) return;

    const error = validateFile(file);
    if (error) {
      setValidationError(error);
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id);

    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/upload");
    xhr.setRequestHeader("x-api-key", process.env.NEXT_PUBLIC_API_KEY || "");

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentComplete = Math.round((event.loaded / event.total) * 100);
        setUploadProgress(percentComplete);
      }
    };

    xhr.onload = () => {
      setIsUploading(false);
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const json = JSON.parse(xhr.responseText);
          Swal.fire({
            icon: "success",
            title: "🎉 Upload Successful!",
            text: "Your file has been uploaded successfully.",
            background: '#f8fafc',
            color: '#1e293b',
            confirmButtonColor: '#3b82f6',
            showClass: {
              popup: 'animate__animated animate__fadeInUp animate__faster'
            },
            hideClass: {
              popup: 'animate__animated animate__fadeOutDown animate__faster'
            }
          });
          
          setFile(null);
          setUploadProgress(0);
          setValidationError(null);
          
          if (onUploadSuccess) {
            onUploadSuccess();
          }
        } catch {
          Swal.fire({
            icon: "success",
            title: "🎉 Upload Successful!",
            text: "Your file has been uploaded successfully.",
            background: '#f8fafc',
            color: '#1e293b',
            confirmButtonColor: '#3b82f6',
          });
          
          setFile(null);
          setUploadProgress(0);
          setValidationError(null);
          
          if (onUploadSuccess) {
            onUploadSuccess();
          }
        }
      } else {
        let errMsg = xhr.responseText || "Upload failed";
        Swal.fire({
          icon: "error",
          title: "❌ Upload Failed",
          text: errMsg,
          background: '#fef2f2',
          color: '#7f1d1d',
          confirmButtonColor: '#dc2626',
        });
        
        if (onUploadError) {
          onUploadError(errMsg);
        }
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      const errorMsg = "An error occurred during the upload.";
      Swal.fire({
        icon: "error",
        title: "❌ Upload Error",
        text: errorMsg,
        background: '#fef2f2',
        color: '#7f1d1d',
        confirmButtonColor: '#dc2626',
      });
      setUploadProgress(0);
      
      if (onUploadError) {
        onUploadError(errorMsg);
      }
    };

    xhr.send(formData);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelection(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleClickDropArea = () => {
    if (!isUploading) {
      inputFileRef.current?.click();
    }
  };

  const removeFile = () => {
    setFile(null);
    setUploadProgress(0);
    setValidationError(null);
  };

  const remainingStorage = storageLimit - currentStorageUsed;
  const storagePercentage = (currentStorageUsed / storageLimit) * 100;

  return (
    <div className="w-full">
      {/* Header */}
      <div className="text-center mb-6">
        <p className="text-slate-600 font-medium">
          Drag and drop your files or click to browse
        </p>
        {/* Storage info */}
        <div className="mt-2 text-sm text-slate-500">
          <span>Available: {formatFileSize(remainingStorage)}</span>
          <span className="mx-2">•</span>
          <span>Max file size: {formatFileSize(maxFileSize)}</span>
        </div>
      </div>

      {/* Validation Error */}
      {validationError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
          <FaExclamationTriangle className="text-red-500 flex-shrink-0" />
          <p className="text-red-700 font-medium text-sm">{validationError}</p>
          <button
            onClick={() => setValidationError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`relative mb-6 w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[250px]
          ${isUploading 
            ? "border-slate-300 bg-slate-50/50 cursor-not-allowed" 
            : isDragOver
            ? "border-blue-500 bg-blue-50/50 scale-105 shadow-xl shadow-blue-500/25"
            : file
            ? validationError
              ? "border-red-400 bg-red-50/50"
              : "border-emerald-400 bg-emerald-50/50 hover:border-emerald-500"
            : "border-slate-300 bg-slate-50/50 hover:border-blue-400 hover:bg-blue-50/50 hover:scale-105"
          } backdrop-blur-sm`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onClick={handleClickDropArea}
        aria-label="File upload dropzone"
      >
        <input
          type="file"
          onChange={(e) => e.target.files?.[0] && handleFileSelection(e.target.files[0])}
          className="hidden"
          ref={inputFileRef}
          aria-label="File upload input"
          disabled={isUploading}
          accept={allowedTypes.length > 0 ? allowedTypes.map(type => `.${type}`).join(',') : undefined}
        />

        {isUploading ? (
          <div className="text-center">
            <div className="relative mb-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <FaSpinner className="text-blue-600 text-2xl animate-spin" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-blue-600 font-bold text-xs">{uploadProgress}%</span>
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">Uploading...</h3>
            <p className="text-slate-600 mb-3 text-sm truncate max-w-xs">{file?.name}</p>
            
            {/* Progress Bar */}
            <div className="w-full max-w-xs mx-auto bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full rounded-full transition-all duration-300 ease-out"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        ) : file ? (
          <div className="text-center">
            <div className="relative mb-4">
              <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                validationError ? 'bg-red-100' : 'bg-emerald-100'
              }`}>
                {getFileIcon(file.name)}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile();
                }}
                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-lg text-xs"
              >
                <FaTimes />
              </button>
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-1 truncate max-w-xs">
              {file.name}
            </h3>
            <p className="text-slate-600 mb-3 text-sm">
              {formatFileSize(file.size)}
            </p>
            <div className={`flex items-center justify-center gap-2 ${
              validationError ? 'text-red-600' : 'text-emerald-600'
            }`}>
              {validationError ? (
                <FaExclamationTriangle className="text-sm" />
              ) : (
                <FaCheckCircle className="text-sm" />
              )}
              <span className="font-medium text-sm">
                {validationError ? 'Invalid file' : 'Ready to upload'}
              </span>
            </div>
          </div>
        ) : isDragOver ? (
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
              <FaCloudUploadAlt className="text-blue-600 text-2xl" />
            </div>
            <h3 className="text-xl font-bold text-blue-600 mb-2">Drop it here!</h3>
            <p className="text-blue-500 font-medium text-sm">
              Release to select your file
            </p>
          </div>
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors">
              <FaCloudUploadAlt className="text-slate-400 text-2xl group-hover:text-blue-500 transition-colors" />
            </div>
            <h3 className="text-lg font-semibold text-slate-800 mb-2">
              Choose files to upload
            </h3>
            <p className="text-slate-600 mb-3 text-sm">
              Drag and drop files here, or click to browse
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs text-slate-600">
              <span>
                {allowedTypes.length > 0 
                  ? allowedTypes.join(', ').toUpperCase() 
                  : 'Images, Documents, Archives'
                }
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <button
        onClick={handleUploadWithProgress}
        disabled={isUploading || !file || !!validationError}
        className={`w-full py-3 px-6 rounded-xl font-bold text-base transition-all duration-300 transform ${
          isUploading || !file || validationError
            ? "bg-slate-200 text-slate-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25 hover:from-blue-700 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5 active:scale-95"
        }`}
        aria-live="polite"
      >
        {isUploading ? (
          <div className="flex items-center justify-center gap-2">
            <FaSpinner className="animate-spin text-sm" />
            <span>Uploading... {uploadProgress}%</span>
          </div>
        ) : file && !validationError ? (
          <div className="flex items-center justify-center gap-2">
            <FaCloudUploadAlt />
            <span>Upload File</span>
          </div>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <FaCloudUploadAlt />
            <span>
              {validationError ? 'Fix errors to upload' : 'Select a file first'}
            </span>
          </span>
        )}
      </button>

      {/* File Info */}
      {file && !isUploading && (
        <div className={`mt-4 border rounded-xl p-4 ${
          validationError 
            ? 'bg-red-50/50 border-red-200/60' 
            : 'bg-slate-50/50 border-slate-200/60'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <div className="scale-50">
                  {getFileIcon(file.name)}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-slate-800 truncate text-sm">
                  {file.name}
                </h4>
                <p className="text-slate-500 text-xs">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
            <button
              onClick={removeFile}
              className="w-8 h-8 flex items-center justify-center text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-300"
            >
              <FaTimes className="text-xs" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
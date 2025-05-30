"use client";
import { useState, useRef, useEffect, use } from "react";
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
  FaFileArchive
} from "react-icons/fa";

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

export default function Upload() {
  const {user} = useCurrentUser();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const inputFileRef = useRef<HTMLInputElement | null>(null);
  



  const handleUpload = () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user?.id);

    const xhr = new XMLHttpRequest();

    xhr.open("POST", "/api/upload");

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
      }
    };

    xhr.onerror = () => {
      setIsUploading(false);
      Swal.fire({
        icon: "error",
        title: "❌ Upload Error",
        text: "An error occurred during the upload.",
        background: '#fef2f2',
        color: '#7f1d1d',
        confirmButtonColor: '#dc2626',
      });
      setUploadProgress(0);
    };

    xhr.send(formData);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
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
  };

  return (
    <div className="w-full">
      {/* Compact Header for Modal */}
      <div className="text-center mb-6">
        <p className="text-slate-600 font-medium">
          Drag and drop your files or click to browse
        </p>
      </div>

      {/* Upload Area - Optimized for Modal */}
      <div
        className={`relative mb-6 w-full border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[250px]
          ${isUploading 
            ? "border-slate-300 bg-slate-50/50 cursor-not-allowed" 
            : isDragOver
            ? "border-blue-500 bg-blue-50/50 scale-105 shadow-xl shadow-blue-500/25"
            : file
            ? "border-emerald-400 bg-emerald-50/50 hover:border-emerald-500"
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
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          ref={inputFileRef}
          aria-label="File upload input"
          disabled={isUploading}
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
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
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
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <FaCheckCircle className="text-sm" />
              <span className="font-medium text-sm">Ready to upload</span>
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
              <span>Images, Documents, Archives</span>
            </div>
          </div>
        )}
      </div>

      {/* Upload Button - Optimized for Modal */}
      <button
        onClick={handleUpload}
        disabled={isUploading || !file}
        className={`w-full py-3 px-6 rounded-xl font-bold text-base transition-all duration-300 transform ${
          isUploading || !file
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
        ) : file ? (
          <div className="flex items-center justify-center gap-2">
            <FaCloudUploadAlt />
            <span>Upload File</span>
          </div>
        ) : (
          <span className="flex items-center justify-center gap-2">
            <FaCloudUploadAlt />
            <span>Select a file first</span>
          </span>
        )}
      </button>

      {/* Compact File Info for Modal */}
      {file && !isUploading && (
        <div className="mt-4 bg-slate-50/50 border border-slate-200/60 rounded-xl p-4">
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
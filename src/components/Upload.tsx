"use client";
import { useState, useRef } from "react";
import Swal from "sweetalert2";

export default function Upload() {
  const [file, setFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string>("test-user");
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const inputFileRef = useRef<HTMLInputElement | null>(null);

  const handleUpload = () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

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
            title: "Upload Successful",
            text: JSON.stringify(json, null, 2),
            customClass: {
              popup: "text-left",
            },
          });
        } catch {
          Swal.fire({
            icon: "success",
            title: "Upload Successful",
            text: "Upload completed successfully.",
          });
        }
      } else {
        let errMsg = xhr.responseText || "Upload failed";
        Swal.fire({
          icon: "error",
          title: "Upload Failed",
          text: errMsg,
        });
      }
      setUploadProgress(0);
    };

    xhr.onerror = () => {
      setIsUploading(false);
      Swal.fire({
        icon: "error",
        title: "Upload Error",
        text: "An error occurred during the upload.",
      });
      setUploadProgress(0);
    };

    xhr.send(formData);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleClickDropArea = () => {
    inputFileRef.current?.click();
  };

  return (
    <main className="flex flex-col items-center p-8 bg-gray-100 rounded-lg shadow-lg max-w-md mx-auto">
      <h1 className="text-4xl font-bold text-gray-800 mb-6 text-center">Upload a File to FleekFiles</h1>
      <div
        className={`mb-6 w-full border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors duration-300
          ${isUploading ? "border-gray-400 bg-gray-50" : "border-violet-400 hover:border-violet-600 bg-white"}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={handleClickDropArea}
        aria-label="File upload dropzone"
      >
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="hidden"
          ref={inputFileRef}
          aria-label="File upload input"
        />
        <p className="text-gray-600 select-none">
          Drag and drop a file here, or click to select one
        </p>
      </div>
      <button
        onClick={handleUpload}
        disabled={isUploading || !file}
        className={`px-6 py-3 rounded-lg font-semibold text-lg transition duration-300 text-white w-full ${
          isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
        aria-live="polite"
      >
        {isUploading ? `Uploading... ${uploadProgress}%` : "Upload"}
      </button>
      {file && (
        <p className="mt-4 text-gray-600 text-center">
          Selected file: <strong>{file.name}</strong>
        </p>
      )}
    </main>
  );
}


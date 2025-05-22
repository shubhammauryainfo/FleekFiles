"use client";
import { useState } from "react";
import Swal from "sweetalert2";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [userId, setUserId] = useState<string>("test-user"); 
  const [isUploading, setIsUploading] = useState<boolean>(false);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", userId);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();
      Swal.fire({
        icon: res.ok ? "success" : "error",
        title: res.ok ? "Upload Successful" : "Upload Failed",
        text: JSON.stringify(json, null, 2),
        customClass: {
          popup: 'text-left'
        }
      });
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Upload Error",
        text: String(err),
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <main className="flex flex-col items-center p-8 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Upload a File to FleekFiles</h1>
      <div className="mb-6 w-full max-w-md">
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="file:mr-4 file:py-2 file:px-4
                     file:rounded-full file:border-0
                     file:text-sm file:font-semibold
                     file:bg-violet-50 file:text-violet-700
                     hover:file:bg-violet-100 w-full"
          aria-label="File upload"
        />
      </div>
      <button
        onClick={handleUpload}
        disabled={isUploading}
        className={`px-6 py-3 rounded-lg font-semibold text-lg transition duration-300 text-white ${
          isUploading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"
        }`}
        aria-live="polite"
      >
        {isUploading ? "Uploading..." : "Upload"}
      </button>
      {file && (
        <p className="mt-4 text-gray-600">
          Selected file: <strong>{file.name}</strong>
        </p>
      )}
    </main>
  );
}

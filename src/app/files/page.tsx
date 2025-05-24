"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import Upload from "@/components/Upload";
import { AuthNav } from "@/components/User";
import {
  FaFilePdf,
  FaFileWord,
  FaFileExcel,
  FaFileImage,
  FaFileArchive,
  FaFileAlt,
  FaFileCode,
  FaFileVideo,
  FaFileAudio,
  FaFilePowerpoint,
  FaFile,
} from "react-icons/fa";

type FileMeta = {
  _id: string;
  filename: string;
  path: string;
  userId: string;
  uploadedAt: string;
  size: number;
};

function getFileIcon(filename: string) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  switch (ext) {
    case "pdf":
      return <FaFilePdf className="text-red-600 mr-2" size={20} />;
    case "doc":
    case "docx":
      return <FaFileWord className="text-blue-600 mr-2" size={20} />;
    case "xls":
    case "xlsx":
      return <FaFileExcel className="text-green-600 mr-2" size={20} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "svg":
      return <FaFileImage className="text-yellow-600 mr-2" size={20} />;
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return <FaFileArchive className="text-gray-600 mr-2" size={20} />;
    case "txt":
      return <FaFileAlt className="text-gray-800 mr-2" size={20} />;
    case "js":
    case "ts":
    case "html":
    case "css":
    case "json":
      return <FaFileCode className="text-green-500 mr-2" size={20} />;
    case "mp4":
    case "mkv":
    case "mov":
      return <FaFileVideo className="text-purple-600 mr-2" size={20} />;
    case "mp3":
    case "wav":
    case "ogg":
      return <FaFileAudio className="text-indigo-600 mr-2" size={20} />;
    case "ppt":
    case "pptx":
      return <FaFilePowerpoint className="text-red-500 mr-2" size={20} />;
    default:
      return <FaFile className="text-gray-400 mr-2" size={20} />;
  }
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch("/api/files");
        if (!res.ok) throw new Error("Failed to fetch files");
        const data = await res.json();
        setFiles(data);
      } catch (err: any) {
        setError(err.message || "Unknown error");
      } finally {
        setLoading(false);
      }
    };
    fetchFiles();
  }, []);

  return (
    <div>
    <AuthNav />
    <main className="p-8 max-w-7xl mx-auto">
     
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Uploaded Files</h1>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Upload
        </button>
      </div>

      {loading && <p className="text-gray-500">Loading files..</p>}
      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {files.map((file) => (
          <div
            key={file._id}
            className="border rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300"
          >
            <h2 className="text-md font-semibold flex items-center">
              {getFileIcon(file.filename)}
              {file.filename}
            </h2>
            <p className="text-gray-600">User ID: {file.userId}</p>
            <p className="text-gray-600">Size: {(file.size / 1024).toFixed(2)} KB</p>
            <p className="text-gray-600">
              Uploaded: {new Date(file.uploadedAt).toLocaleString()}
            </p>
            <a
              href={`/api/files${file.path}`}
              target="_blank"
              className="mt-4 inline-flex items-center text-blue-600 hover:underline"
              rel="noopener noreferrer"
            >
              Download
            </a>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-filter backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-black"
            >
              <FaTimes size={18} />
            </button>
            <h2 className="text-xl font-semibold mb-4">Upload a File</h2>
            <Upload />
          </div>
        </div>
      )}
    </main>
    </div>
  );
}

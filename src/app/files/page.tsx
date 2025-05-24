"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import Upload from "@/components/Upload";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaSignInAlt, FaSignOutAlt, FaUserCircle } from "react-icons/fa";
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
  const { data: session } = useSession();
  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await fetch(`/api/files?userId=${session?.user.id}`);
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
    <nav className="flex items-center justify-between bg-gradient-to-r from-slate-50 to-slate-100 backdrop-blur-sm border border-slate-200/60 px-6 py-3 rounded-2xl shadow-lg shadow-slate-200/50">
      {session ? (
        <>
          {/* User Info Section */}
          <div className="flex items-center gap-3">
            <div className="relative">
              {session.user?.image ? (
                <img
                  src={session.user.image}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full ring-2 ring-blue-500/20 shadow-md"
                />
              ) : (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-md">
                  <FaUserCircle className="text-white text-lg" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
            </div>
            
            <div className="flex flex-col">
              <span className="text-slate-800 font-medium text-sm leading-tight">
                Welcome back,
              </span>
              <span className="text-slate-900 font-semibold text-base leading-tight truncate max-w-32">
                {session.user?.name || "User"}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => signOut()}
            className="group flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium text-white 
            bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg shadow-red-500/25
            hover:from-red-600 hover:to-red-700 hover:shadow-xl hover:shadow-red-500/30 
            hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-slate-50"
            aria-label="Logout"
          >
            <FaSignOutAlt className="group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-medium">Sign Out</span>
          </button>
        </>
      ) : (
        <>
          {/* Welcome Message for Non-Authenticated */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center shadow-md">
              <FaUserCircle className="text-slate-600 text-lg" />
            </div>
            <div className="flex flex-col">
              <span className="text-slate-600 font-medium text-sm leading-tight">
                Welcome!
              </span>
              <span className="text-slate-800 font-semibold text-base leading-tight">
                Please sign in
              </span>
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={() => signIn()}
            className="group flex items-center gap-2.5 px-6 py-2.5 text-sm font-medium text-white 
            bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg shadow-blue-500/25
            hover:from-blue-600 hover:to-blue-700 hover:shadow-xl hover:shadow-blue-500/30 
            hover:-translate-y-0.5 active:scale-95 transition-all duration-300 ease-out
            focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-50"
            aria-label="Login"
          >
            <FaSignInAlt className="group-hover:translate-x-0.5 transition-transform duration-300" />
            <span className="font-medium">Sign In</span>
          </button>
        </>
      )}
    </nav>
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

"use client";

import { useEffect, useState } from "react";
import { FaTimes, FaSearch, FaFilter, FaDownload, FaEye, FaTrash, FaSort } from "react-icons/fa";
import Upload from "@/components/Upload";
import { useSession, signIn, signOut } from "next-auth/react";
import { FaSignInAlt, FaSignOutAlt, FaUserCircle, FaPlus } from "react-icons/fa";
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
      return <FaFilePdf className="text-red-500 mr-3" size={24} />;
    case "doc":
    case "docx":
      return <FaFileWord className="text-blue-500 mr-3" size={24} />;
    case "xls":
    case "xlsx":
      return <FaFileExcel className="text-emerald-500 mr-3" size={24} />;
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
    case "bmp":
    case "svg":
      return <FaFileImage className="text-amber-500 mr-3" size={24} />;
    case "zip":
    case "rar":
    case "7z":
    case "tar":
    case "gz":
      return <FaFileArchive className="text-slate-500 mr-3" size={24} />;
    case "txt":
      return <FaFileAlt className="text-slate-700 mr-3" size={24} />;
    case "js":
    case "ts":
    case "html":
    case "css":
    case "json":
      return <FaFileCode className="text-green-500 mr-3" size={24} />;
    case "mp4":
    case "mkv":
    case "mov":
      return <FaFileVideo className="text-purple-500 mr-3" size={24} />;
    case "mp3":
    case "wav":
    case "ogg":
      return <FaFileAudio className="text-indigo-500 mr-3" size={24} />;
    case "ppt":
    case "pptx":
      return <FaFilePowerpoint className="text-orange-500 mr-3" size={24} />;
    default:
      return <FaFile className="text-slate-400 mr-3" size={24} />;
  }
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { data: session } = useSession();

  const filteredFiles = files.filter(file => 
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Enhanced Navigation */}
      <nav className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {session ? (
              <>
                <div className="flex items-center gap-4">
                  <div className="relative group">
                    {session.user?.image ? (
                      <img
                        src={session.user.image}
                        alt="User Avatar"
                        className="w-12 h-12 rounded-full ring-2 ring-blue-500/30 shadow-lg transition-all duration-300 group-hover:ring-blue-500/50"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                        <FaUserCircle className="text-white text-xl" />
                      </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                  </div>
                  
                  <div className="flex flex-col">
                    <span className="text-slate-600 font-medium text-sm">
                      Welcome back,
                    </span>
                    <span className="text-slate-900 font-bold text-lg leading-tight truncate max-w-40">
                      {session.user?.name || "User"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => signOut()}
                  className="group flex items-center gap-3 px-6 py-3 text-sm font-semibold text-white 
                  bg-gradient-to-r from-red-500 to-rose-600 rounded-2xl shadow-lg shadow-red-500/25
                  hover:from-red-600 hover:to-rose-700 hover:shadow-xl hover:shadow-red-500/30 
                  hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 ease-out
                  focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:ring-offset-2 focus:ring-offset-white"
                >
                  <FaSignOutAlt className="group-hover:rotate-12 transition-transform duration-300" />
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-300 to-slate-400 rounded-full flex items-center justify-center shadow-lg">
                    <FaUserCircle className="text-slate-600 text-xl" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-600 font-medium text-sm">
                      Welcome!
                    </span>
                    <span className="text-slate-800 font-bold text-lg">
                      Please sign in
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => signIn()}
                  className="group flex items-center gap-3 px-8 py-3 text-sm font-semibold text-white 
                  bg-gradient-to-r from-blue-500 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/25
                  hover:from-blue-600 hover:to-indigo-700 hover:shadow-xl hover:shadow-blue-500/30 
                  hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 ease-out
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-white"
                >
                  <FaSignInAlt className="group-hover:translate-x-1 transition-transform duration-300" />
                  Sign In
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-2">
                My Files
              </h1>
              <p className="text-slate-600 font-medium">
                Manage and organize your uploaded documents
              </p>
            </div>
            
            <button
              onClick={() => setShowModal(true)}
              className="group flex items-center gap-3 px-8 py-4 text-white font-semibold
              bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl shadow-xl shadow-blue-500/25
              hover:from-blue-700 hover:to-indigo-700 hover:shadow-2xl hover:shadow-blue-500/30
              hover:-translate-y-1 hover:scale-105 active:scale-95 transition-all duration-300 ease-out
              focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-50"
            >
              <FaPlus className="group-hover:rotate-90 transition-transform duration-300" />
              Upload Files
            </button>
          </div>
        </div>

        {/* Enhanced Search and Filter Bar */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6 mb-8">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50/50 border border-slate-200 rounded-xl
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500
                transition-all duration-300 font-medium placeholder-slate-400"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all duration-300
                focus:outline-none focus:ring-2 focus:ring-slate-500/50"
              >
                <FaFilter className="text-slate-600" />
              </button>
              
              <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'grid' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-3 py-2 rounded-lg transition-all duration-300 ${
                    viewMode === 'list' 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-slate-600 hover:text-slate-800'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 font-medium">Loading your files...</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <p className="text-red-700 font-medium">⚠️ {error}</p>
          </div>
        )}

        {/* Enhanced Files Display */}
        {!loading && !error && (
          <>
            {filteredFiles.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaFile className="text-slate-400 text-3xl" />
                </div>
                <h3 className="text-xl font-semibold text-slate-800 mb-2">No files found</h3>
                <p className="text-slate-600 mb-6">
                  {searchTerm ? "Try adjusting your search terms" : "Upload your first file to get started"}
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => setShowModal(true)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                  >
                    Upload Files
                  </button>
                )}
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                  : "space-y-4"
              }>
                {filteredFiles.map((file) => (
                  <div
                    key={file._id}
                    className={`group bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-200/50
                    hover:shadow-xl hover:shadow-slate-300/50 hover:-translate-y-1 transition-all duration-300
                    ${viewMode === 'list' ? 'flex items-center p-6' : 'p-6'}`}
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center flex-1 min-w-0">
                            {getFileIcon(file.filename)}
                            <h3 className="font-semibold text-slate-800 truncate text-lg">
                              {file.filename}
                            </h3>
                          </div>
                        </div>
                        
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 font-medium">Size</span>
                            <span className="text-slate-700 font-semibold">{formatFileSize(file.size)}</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-slate-500 font-medium">Uploaded</span>
                            <span className="text-slate-700 font-semibold">
                              {new Date(file.uploadedAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <a
                            href={`/api/files${file.path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                            bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 
                            transition-all duration-300 font-medium group-hover:bg-blue-600 group-hover:text-white"
                          >
                            <FaDownload className="text-sm" />
                            Download
                          </a>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center flex-1 min-w-0 mr-6">
                          {getFileIcon(file.filename)}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-slate-800 truncate text-lg mb-1">
                              {file.filename}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-slate-500">
                              <span>{formatFileSize(file.size)}</span>
                              <span>•</span>
                              <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <a
                          href={`/api/files${file.path}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-6 py-3 
                          bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-600 hover:text-white
                          transition-all duration-300 font-medium"
                        >
                          <FaDownload />
                          Download
                        </a>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* Enhanced Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowModal(false)}
            ></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-2xl transform transition-all duration-300 scale-100">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-6 right-6 w-10 h-10 flex items-center justify-center
                text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full
                transition-all duration-300"
              >
                <FaTimes size={18} />
              </button>
              
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Upload Files</h2>
                <p className="text-slate-600 font-medium">
                  Select files from your device to upload to your library
                </p>
              </div>
              
              <Upload />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
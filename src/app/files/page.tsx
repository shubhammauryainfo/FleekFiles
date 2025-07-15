"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { FaTimes, FaSearch, FaFilter, FaDownload, FaEye, FaTrash, FaSort, FaHdd } from "react-icons/fa";
import Upload from "@/components/Upload";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { FaPlus } from "react-icons/fa";
import Layout from "@/components/Layout";
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
  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());
  const [downloadingFiles, setDownloadingFiles] = useState<Set<string>>(new Set());
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const { user } = useCurrentUser();

  const filteredFiles = files.filter(file => 
    file.filename.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate storage usage
  const totalStorageUsed = files.reduce((total, file) => total + file.size, 0);
  const storageLimit = 2 * 1024 * 1024 * 1024; // 2GB in bytes
  const storagePercentage = Math.min((totalStorageUsed / storageLimit) * 100, 100);
  const remainingStorage = Math.max(storageLimit - totalStorageUsed, 0);

  // Fetch files function
  const fetchFiles = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const res = await fetch(`/api/files?userId=${user.id}`, {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || ""
        }
      });
      if (!res.ok) throw new Error("Failed to fetch files");
      const data = await res.json();
      setFiles(data);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user]);

  // Handle upload success - refresh files and close modal
  const handleUploadSuccess = () => {
    fetchFiles(); // Refresh the files list
    setShowModal(false); // Close the modal
  };

  const handleDownloadFile = async (file: FileMeta) => {
    setDownloadingFiles(prev => new Set(prev).add(file._id));
    
    try {
      const response = await fetch(`/api/files${file.path}`, {
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || ""
        }
      });
      
      if (!response.ok) {
        throw new Error('Download failed');
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.filename;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      // Remove downloading state after a delay for visual feedback
      setTimeout(() => {
        setDownloadingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(file._id);
          return newSet;
        });
      }, 1000);
      
    } catch (err: any) {
      setDownloadingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(file._id);
        return newSet;
      });
      setError(`Download failed: ${err.message}`);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    setDeletingFiles(prev => new Set(prev).add(fileId));
    setShowDeleteConfirm(null);
    
    try {
      const res = await fetch(`/api/files/delete/${fileId}`, {
        method: 'DELETE',
        headers: {
          "x-api-key": process.env.NEXT_PUBLIC_API_KEY || ""
        }
      });
      
      if (!res.ok) {
        throw new Error('Failed to delete file');
      }
      // Wait for animation to show
      setTimeout(() => {
        setFiles(prev => prev.filter(file => file._id !== fileId));
        setDeletingFiles(prev => {
          const newSet = new Set(prev);
          newSet.delete(fileId);
          return newSet;
        });
      }, 500);
      
    } catch (err: any) {
      setError(err.message || "Failed to delete file");
      setDeletingFiles(prev => {
        const newSet = new Set(prev);
        newSet.delete(fileId);
        return newSet;
      });
    }
  };

  const confirmDelete = (fileId: string) => {
    setShowDeleteConfirm(fileId);
  };
  
  return (
    <Layout>
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

        {/* Storage Usage Progress Bar */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-slate-200/50 border border-slate-200/60 p-6 mb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg">
                <FaHdd className="text-white text-xl" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-800">Storage Usage</h3>
                <p className="text-sm text-slate-600">
                  {formatFileSize(totalStorageUsed)} of {formatFileSize(storageLimit)} used
                </p>
              </div>
            </div>
            <div className="ml-auto text-right">
              <div className="text-2xl font-bold text-slate-800">
                {storagePercentage.toFixed(1)}%
              </div>
              <div className="text-sm text-slate-600">
                {formatFileSize(remainingStorage)} remaining
              </div>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="relative">
            <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden shadow-inner">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-out ${
                  storagePercentage >= 90 
                    ? 'bg-gradient-to-r from-red-500 to-red-600' 
                    : storagePercentage >= 75 
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                }`}
                style={{ width: `${storagePercentage}%` }}
              ></div>
            </div>
            
            {/* Storage Milestones */}
            <div className="flex justify-between mt-2 text-xs text-slate-500">
              <span>0 GB</span>
              <span>1 GB</span>
              <span>2 GB</span>
            </div>
          </div>
          
          {/* Storage Warning */}
          {storagePercentage >= 90 && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                <p className="text-red-700 font-semibold text-sm">
                  Storage Almost Full! Only {formatFileSize(remainingStorage)} remaining.
                </p>
              </div>
            </div>
          )}
          
          {storagePercentage >= 75 && storagePercentage < 90 && (
            <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                <p className="text-amber-700 font-semibold text-sm">
                  Storage Warning: {formatFileSize(remainingStorage)} remaining.
                </p>
              </div>
            </div>
          )}
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
              <div className="px-4 py-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-600">
                {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
              </div>
              
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
            <div className="flex items-center justify-between">
              <p className="text-red-700 font-medium">⚠️ {error}</p>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <FaTimes />
              </button>
            </div>
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
                {filteredFiles.map((file) => {
                  const isDeleting = deletingFiles.has(file._id);
                  const isDownloading = downloadingFiles.has(file._id);
                  
                  return (
                    <div
                      key={file._id}
                      className={`group bg-white/70 backdrop-blur-sm border border-slate-200/60 rounded-2xl shadow-lg shadow-slate-200/50
                      hover:shadow-xl hover:shadow-slate-300/50 hover:-translate-y-1 transition-all duration-300
                      ${viewMode === 'list' ? 'flex items-center p-6' : 'p-6'}
                      ${isDeleting ? 'animate-pulse opacity-50 scale-95' : ''}`}
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
                            <button
                              onClick={() => handleDownloadFile(file)}
                              disabled={isDownloading}
                              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 
                              bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 
                              transition-all duration-300 font-medium group-hover:bg-blue-600 group-hover:text-white
                              disabled:opacity-75 disabled:cursor-not-allowed disabled:hover:bg-blue-50 disabled:hover:text-blue-700"
                            >
                              {isDownloading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <FaDownload className="text-sm" />
                                  Download
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => confirmDelete(file._id)}
                              disabled={isDeleting}
                              className="flex items-center justify-center p-3 
                              bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:text-red-700
                              transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed
                              group-hover:bg-red-600 group-hover:text-white"
                            >
                              {isDeleting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : (
                                <FaTrash className="text-sm" />
                              )}
                            </button>
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

                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleDownloadFile(file)}
                              disabled={isDownloading}
                              className="flex items-center gap-2 px-6 py-3 
                              bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-600 hover:text-white
                              transition-all duration-300 font-medium disabled:opacity-75 disabled:cursor-not-allowed
                              disabled:hover:bg-blue-50 disabled:hover:text-blue-700"
                            >
                              {isDownloading ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                                  Downloading...
                                </>
                              ) : (
                                <>
                                  <FaDownload />
                                  Download
                                </>
                              )}
                            </button>
                            
                            <button
                              onClick={() => confirmDelete(file._id)}
                              disabled={isDeleting}
                              className="flex items-center gap-2 px-4 py-3 
                              bg-red-50 text-red-600 rounded-xl hover:bg-red-600 hover:text-white
                              transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isDeleting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                              ) : (
                                <FaTrash />
                              )}
                              {!isDeleting && <span>Delete</span>}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
        
        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowDeleteConfirm(null)}
            ></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md transform transition-all duration-300 scale-100">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaTrash className="text-red-600 text-2xl" />
                </div>
                
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Delete File</h3>
                <p className="text-slate-600 mb-2">
                  Are you sure you want to delete this file?
                </p>
                <p className="text-sm text-slate-500 mb-8">
                  {files.find(f => f._id === showDeleteConfirm)?.filename}
                </p>
                
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl 
                    hover:bg-slate-200 transition-all duration-300 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteFile(showDeleteConfirm)}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl 
                    hover:bg-red-700 transition-all duration-300 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Upload Modal */}
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
                <p className="text-slate-600 font-medium mb-4">
                  Select files from your device to upload to your library
                </p>
                {/* Storage info in modal */}
                <div className="bg-slate-50 rounded-xl p-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Available storage:</span>
                    <span className="font-semibold text-slate-800">
                      {formatFileSize(remainingStorage)} remaining
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      style={{ width: `${storagePercentage}%` }}
                    ></div>
                  </div>
                </div>
              </div>
              
              <Upload onUploadSuccess={handleUploadSuccess} />
            </div>
          </div>
        )}
   </Layout>
  );
}
'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { 
  MdDownload, 
  MdInsertDriveFile, 
  MdCalendarToday, 
  MdStorage, 
  MdSecurity, 
  MdCheckCircle, 
  MdError,
  MdRefresh
} from 'react-icons/md';
import { AiOutlineLoading3Quarters } from 'react-icons/ai';


const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'your-api-key';
const LIVE_URL = process.env.NEXT_PUBLIC_LIVE_URL || 'https://your-domain.com/files';

interface FileData {
  _id: string;
  filename: string;
  path: string;
  userId: string;
  uploadedAt: string;
  size: number;
  __v: number;
}

interface ApiResponse {
  file: FileData;
}

export default function FileDownloadPage() {
  const [file, setFile] = useState<FileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  
  const params = useParams();
  const fileId = params?.id as string;

  useEffect(() => {
    if (fileId) {
      fetchFileData();
    } else {
      setError('No file ID provided');
      setLoading(false);
    }
  }, [fileId]);

  const fetchFileData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/share/${fileId}`, {
        headers: {
          'x-api-key': API_KEY,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('File not found');
      }

      const data: ApiResponse = await response.json();
      setFile(data.file);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load file');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getFileExtension = (filename: string): string => {
    return filename.split('.').pop()?.toLowerCase() || '';
  };

  const handleDownload = async () => {
    if (!file) return;
    
    setDownloading(true);
    try {
      const downloadUrl = `${LIVE_URL}${file.filename}`;
      
      // Create a temporary anchor element to trigger download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Simulate download delay for demo
      setTimeout(() => {
        setDownloading(false);
      }, 2000);
    } catch (err) {
      setDownloading(false);
      setError('Download failed');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <AiOutlineLoading3Quarters className="mx-auto h-12 w-12 animate-spin text-blue-600 mb-4" />
          <p className="text-gray-600">Loading file...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-pink-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center bg-white rounded-2xl shadow-xl p-8">
          <MdError className="mx-auto h-16 w-16 text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">File Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
          >
            <MdRefresh className="h-4 w-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  if (!file) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <MdInsertDriveFile className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Secure File Download</h1>
          <p className="text-gray-600">Your file is ready for download</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          {/* Card Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <MdInsertDriveFile className="h-6 w-6" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg">File Ready</h2>
                  <p className="text-blue-100 text-sm">Click to download</p>
                </div>
              </div>
              <MdCheckCircle className="h-8 w-8 text-green-300" />
            </div>
          </div>

          {/* File Details */}
          <div className="px-8 py-6">
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2 break-all">
                {file.filename}
              </h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {getFileExtension(file.filename).toUpperCase()} File
              </span>
            </div>

            {/* File Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <MdStorage className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Size</p>
                  <p className="font-semibold text-gray-900">{formatFileSize(file.size)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <MdCalendarToday className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Uploaded</p>
                  <p className="font-semibold text-gray-900 text-sm">{formatDate(file.uploadedAt)}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                <MdSecurity className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">Status</p>
                  <p className="font-semibold text-green-600">Secure</p>
                </div>
              </div>
            </div>

            {/* Download Section */}
            <div className="text-center">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
              >
                {downloading ? (
                  <>
                    <AiOutlineLoading3Quarters className="h-5 w-5 animate-spin" />
                    <span>Downloading...</span>
                  </>
                ) : (
                  <>
                    <MdDownload className="h-5 w-5" />
                    <span>Download File</span>
                  </>
                )}
              </button>
              
              <p className="text-xs text-gray-500 mt-3">
                File will be downloaded from: {LIVE_URL}
              </p>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <div className="flex items-start space-x-3">
            <MdSecurity className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Secure Download</h4>
              <p className="text-sm text-blue-700">
                This file is served through our secure content delivery network. 
                Your download is encrypted and monitored for safety.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
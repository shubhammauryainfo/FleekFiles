'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import Layout from '@/components/Dashlayout';
import Header from '@/components/Header';
import Table from '@/components/Table';
import axios from 'axios';

// Enhanced type definitions
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
    count: number;
    files: FileData[];
    message?: string;
}

interface Column {
    key: keyof FileData | 'actions';
    label: string;
    render?: (row: FileData) => React.ReactNode;
    width?: string;
}

// Loading and error states
interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

const FilesPage: React.FC = () => {
    const [data, setData] = useState<FileData[]>([]);
    const [filteredData, setFilteredData] = useState<FileData[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null
    });

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    // Helper function to format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Helper function to get file extension
    const getFileExtension = (filename: string): string => {
        return filename.split('.').pop()?.toLowerCase() || '';
    };

    // Helper function to get file type icon/color
    const getFileTypeInfo = (filename: string) => {
        const extension = getFileExtension(filename);
        const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
        const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'rtf'];
        const videoTypes = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
        const audioTypes = ['mp3', 'wav', 'flac', 'aac', 'ogg'];

        if (imageTypes.includes(extension)) {
            return { type: 'image', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' };
        } else if (documentTypes.includes(extension)) {
            return { type: 'document', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' };
        } else if (videoTypes.includes(extension)) {
            return { type: 'video', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300' };
        } else if (audioTypes.includes(extension)) {
            return { type: 'audio', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' };
        }
        return { type: 'other', color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300' };
    };

    // Enhanced columns with better rendering and sorting
    const columns: Column[] = useMemo(() => [
        { 
            key: 'filename', 
            label: 'File Name',
            render: (row: FileData) => {
                const fileInfo = getFileTypeInfo(row.filename);
                return (
                    <div className="flex items-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium mr-2 ${fileInfo.color}`}>
                            {getFileExtension(row.filename).toUpperCase() || 'FILE'}
                        </span>
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                            {row.filename}
                        </span>
                    </div>
                );
            }
        },
        { 
            key: 'userId', 
            label: 'User ID',
        },
        { 
            key: 'size', 
            label: 'File Size',
            width:'140px',
            render: (row: FileData) => (
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {formatFileSize(row.size)}
                </span>
            )
        },
        { 
            key: 'path', 
            label: 'Path',
        },
        {
            key: 'uploadedAt',
            label: 'Upload Time',
            width:'130px',
            render: (row: FileData) => {
                const date = new Date(row.uploadedAt);
                const isToday = new Date().toDateString() === date.toDateString();
                
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {format(date, 'MMM dd, yyyy')}
                        </span>
                        <span className={`text-xs ${isToday ? 'text-green-600 dark:text-green-400' : 'text-gray-500 dark:text-gray-400'}`}>
                            {format(date, 'hh:mm:ss a')}
                        </span>
                    </div>
                );
            }
        }
    ], []);

    // Enhanced data fetching with proper error handling
    const fetchData = useCallback(async (): Promise<void> => {
        if (!apiKey) {
            setLoadingState({
                isLoading: false,
                error: 'API key is missing. Please check your environment variables.'
            });
            return;
        }

        setLoadingState({ isLoading: true, error: null });

        try {
            const response = await axios.get<ApiResponse>('/api/filemeta', {
                headers: {
                    'x-api-key': apiKey,
                },
                timeout: 10000, // 10 second timeout
            });

            const responseData = response.data;
            
            if (Array.isArray(responseData.files)) {
                const fileData = responseData.files;
                
                // Sort by upload time (newest first)
                const sortedData = fileData.sort((a, b) => 
                    new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
                );
                
                setData(sortedData);
                setFilteredData(sortedData);
                setLoadingState({ isLoading: false, error: null });
            } else {
                throw new Error(responseData.message || 'Invalid response format');
            }
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'An unexpected error occurred';

            console.error('Error fetching files:', error);
            setLoadingState({ isLoading: false, error: errorMessage });
            setData([]);
            setFilteredData([]);
        }
    }, [apiKey]);

    // Refresh data
    const handleRefresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    // Effects
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Statistics
    const stats = useMemo(() => {
        const total = data.length;
        const totalSize = data.reduce((sum, file) => sum + file.size, 0);
        const today = data.filter(file => {
            const fileDate = new Date(file.uploadedAt);
            const today = new Date();
            return fileDate.toDateString() === today.toDateString();
        }).length;

        // Group files by type
        const fileTypes = data.reduce((acc, file) => {
            const type = getFileTypeInfo(file.filename).type;
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return { total, totalSize, today, fileTypes };
    }, [data]);

    if (loadingState.isLoading) {
        return (
            <Layout>
                <Header title="Files Meta Data" />
                <div className="flex items-center justify-center min-h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading files...</span>
                </div>
            </Layout>
        );
    }

    if (loadingState.error) {
        return (
            <Layout>
                <Header title="Files Meta Data" />
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                Error loading files
                            </h3>
                            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                {loadingState.error}
                            </p>
                            <button
                                onClick={handleRefresh}
                                className="mt-2 text-sm text-red-600 dark:text-red-400 hover:underline"
                            >
                                Try again
                            </button>
                        </div>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Header title="Files Meta Data" />
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 my-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Files</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Uploads</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.today}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Storage</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{formatFileSize(stats.totalSize)}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">File Types</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{Object.keys(stats.fileTypes).length}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Table
                columns={columns}
                data={filteredData}
                searchable={true} 
                exportable={true}
                emptyMessage="No files found"
            />
        </Layout>
    );
};

export default FilesPage;
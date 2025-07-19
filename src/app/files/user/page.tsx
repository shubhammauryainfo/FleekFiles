'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format, formatDistanceToNow, isToday, isThisWeek, isThisMonth } from 'date-fns';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import Layout from '@/components/Layout';
import Header from '@/components/Header';
import axios from 'axios';

// Type definitions
interface User {
    _id: string;
    name?: string;
    email: string;
    password?: string;
    phone?: string;
    provider?: string;
}

interface FileMeta {
    _id: string;
    filename: string;
    path: string;
    userId: string;
    uploadedAt: string;
    size: number;
}

interface LoginLog {
    _id: string;
    email: string;
    userId: string;
    provider: string;
    ip: string;
    device: string;
    timestamp: string;
}

interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

interface UserAnalytics {
    user: User | null;
    files: FileMeta[];
    loginLogs: LoginLog[];
}

const UserAnalyticsPage: React.FC = () => {
    const { user } = useCurrentUser();
    const id = user?._id ?? user?.id; // Handle possible null and both _id/id

    const [analytics, setAnalytics] = useState<UserAnalytics>({
        user: null,
        files: [],
        loginLogs: []
    });
    
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null
    });

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;
    const STORAGE_LIMIT_GB = 2;
    const STORAGE_LIMIT_BYTES = STORAGE_LIMIT_GB * 1024 * 1024 * 1024; // 2GB in bytes

    // Fetch user data from all three APIs
    const fetchUserAnalytics = useCallback(async (userId: string) => {
        if (!apiKey) {
            setLoadingState({
                isLoading: false,
                error: 'API key is missing. Please check your environment variables.'
            });
            return;
        }

        setLoadingState({ isLoading: true, error: null });

        try {
            const [userResponse, filesResponse, logsResponse] = await Promise.all([
                axios.get(`/api/users/${userId}`, {
                    headers: { 'x-api-key': apiKey },
                    timeout: 10000
                }),
                axios.get(`/api/filemeta/${userId}`, {
                    headers: { 'x-api-key': apiKey },
                    timeout: 10000
                }),
                axios.get(`/api/loginlog/${userId}`, {
                    headers: { 'x-api-key': apiKey },
                    timeout: 10000
                })
            ]);

            setAnalytics({
                user: userResponse.data.user || userResponse.data,
                files: filesResponse.data.files || filesResponse.data || [],
                loginLogs: logsResponse.data.logs || logsResponse.data || []
            });

            setLoadingState({ isLoading: false, error: null });
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'An unexpected error occurred';

            console.error('Error fetching user analytics:', error);
            setLoadingState({ isLoading: false, error: errorMessage });
        }
    }, [apiKey]);

    // Effect to fetch data when ID changes
    useEffect(() => {
        if (id) {
            fetchUserAnalytics(id);
        }
    }, [id, fetchUserAnalytics]);

    // Computed analytics
    const computedStats = useMemo(() => {
        const { files, loginLogs } = analytics;

        // File statistics
        const totalFiles = files.length;
        const totalFileSize = files.reduce((sum, file) => sum + file.size, 0);
        const storageUsagePercentage = (totalFileSize / STORAGE_LIMIT_BYTES) * 100;
        const remainingStorage = STORAGE_LIMIT_BYTES - totalFileSize;
        const filesThisMonth = files.filter(file => isThisMonth(new Date(file.uploadedAt))).length;
        const filesThisWeek = files.filter(file => isThisWeek(new Date(file.uploadedAt))).length;
        const filesToday = files.filter(file => isToday(new Date(file.uploadedAt))).length;

        // Login statistics
        const totalLogins = loginLogs.length;
        const loginsThisMonth = loginLogs.filter(log => isThisMonth(new Date(log.timestamp))).length;
        const loginsThisWeek = loginLogs.filter(log => isThisWeek(new Date(log.timestamp))).length;
        const loginsToday = loginLogs.filter(log => isToday(new Date(log.timestamp))).length;

        // Recent activity
        const recentFiles = files
            .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
            .slice(0, 5);

        const recentLogins = loginLogs
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 5);

        // Device and IP analysis
        const deviceStats = loginLogs.reduce((acc, log) => {
            acc[log.device] = (acc[log.device] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const ipStats = loginLogs.reduce((acc, log) => {
            const ip = log.ip === '::1' ? 'localhost' : log.ip;
            acc[ip] = (acc[ip] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Provider analysis
        const providerStats = loginLogs.reduce((acc, log) => {
            acc[log.provider] = (acc[log.provider] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Last activity
        const lastLogin = loginLogs.length > 0 ? loginLogs[0] : null;
        const lastFileUpload = files.length > 0 ? files[0] : null;

        return {
            files: {
                total: totalFiles,
                thisMonth: filesThisMonth,
                thisWeek: filesThisWeek,
                today: filesToday,
                totalSize: totalFileSize,
                storageUsagePercentage,
                remainingStorage,
                recent: recentFiles
            },
            logins: {
                total: totalLogins,
                thisMonth: loginsThisMonth,
                thisWeek: loginsThisWeek,
                today: loginsToday,
                recent: recentLogins,
                deviceStats,
                ipStats,
                providerStats
            },
            lastActivity: {
                lastLogin,
                lastFileUpload
            }
        };
    }, [analytics]);

    // Utility functions
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'PPP p'); // e.g., "January 1, 2024 at 10:30 AM"
    };

    const formatDateShort = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'MMM dd, yyyy');
    };

    const formatDateWithTime = (dateString: string) => {
        const date = new Date(dateString);
        return format(date, 'MMM dd, yyyy \'at\' hh:mm a');
    };

    const getStorageColor = (percentage: number) => {
        if (percentage >= 90) return 'bg-red-500';
        if (percentage >= 75) return 'bg-orange-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-green-500';
    };

    const getStorageTextColor = (percentage: number) => {
        if (percentage >= 90) return 'text-red-600 dark:text-red-400';
        if (percentage >= 75) return 'text-orange-600 dark:text-orange-400';
        if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-green-600 dark:text-green-400';
    };

    const getProviderColor = (provider: string) => {
        switch (provider.toLowerCase()) {
            case 'google':
                return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
            case 'credentials':
                return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
            default:
                return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
        }
    };

    const getUserInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0))
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    if (loadingState.isLoading) {
        return (
            <Layout>
               
                <div className="flex items-center justify-center min-h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading user analytics...</span>
                </div>
            </Layout>
        );
    }

    if (loadingState.error) {
        return (
            <Layout>
               
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                Error loading user analytics
                            </h3>
                            <p className="mt-1 text-sm text-red-700 dark:text-red-300">
                                {loadingState.error}
                            </p>
                            <button
                                onClick={() => id && fetchUserAnalytics(id)}
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

    if (!analytics.user) {
        return (
            <Layout>
                
                <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">User not found</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
           <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 mb-5">
    <div className="flex flex-col md:flex-row justify-between ">
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Email Address</p>
            <p className="text-lg font-semibold text-gray-900 dark:text-white truncate">{analytics.user.email}</p>
        </div>
        <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">User ID</p>
            <p className="text-xs font-mono text-gray-600 dark:text-gray-300 break-all">{analytics.user._id}</p>
        </div>
    </div>
</div>

            {/* Storage Usage Card */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Storage Usage</h3>
                    <span className={`text-sm font-medium ${getStorageTextColor(computedStats.files.storageUsagePercentage)}`}>
                        {computedStats.files.storageUsagePercentage.toFixed(1)}% used
                    </span>
                </div>
                <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
                        <span>{formatFileSize(computedStats.files.totalSize)} used</span>
                        <span>{formatFileSize(STORAGE_LIMIT_BYTES)} total</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                        <div 
                            className={`h-3 rounded-full transition-all duration-300 ${getStorageColor(computedStats.files.storageUsagePercentage)}`}
                            style={{ width: `${Math.min(computedStats.files.storageUsagePercentage, 100)}%` }}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Remaining</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {formatFileSize(computedStats.files.remainingStorage)}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 dark:text-gray-400">Files</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {computedStats.files.total} files
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                {/* Total Files */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4 min-w-0">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Files</p>
                            <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{computedStats.files.total}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{formatFileSize(computedStats.files.totalSize)}</p>
                        </div>
                    </div>
                </div>

                {/* Total Logins */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4 min-w-0">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logins</p>
                            <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{computedStats.logins.total}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">All time</p>
                        </div>
                    </div>
                </div>

                {/* This Month Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4 min-w-0">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month login</p>
                            <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{computedStats.logins.thisMonth}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{computedStats.files.thisMonth} files uploaded</p>
                        </div>
                    </div>
                </div>

                {/* Today's Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4 min-w-0">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Todays login</p>
                            <p className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white">{computedStats.logins.today}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{computedStats.files.today} files uploaded</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Files */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Files</h3>
                    </div>
                    <div className="p-4 max-h-80 overflow-y-auto">
                        {computedStats.files.recent.length > 0 ? (
                            <div className="space-y-4">
                                {computedStats.files.recent.map((file) => (
                                    <div key={file._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{file.filename}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    {formatFileSize(file.size)} • {formatDateShort(file.uploadedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No files uploaded yet</p>
                        )}
                    </div>
                </div>

                {/* Recent Logins */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Logins</h3>
                    </div>
                    <div className="p-4 max-h-80 overflow-y-auto">
                        {computedStats.logins.recent.length > 0 ? (
                            <div className="space-y-4">
                                {computedStats.logins.recent.map((login) => (
                                    <div key={login._id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                        <div className="flex items-center space-x-3 min-w-0 flex-1">
                                            <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center flex-shrink-0">
                                                <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                                </svg>
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{login.device}</p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {login.ip === '::1' ? 'localhost' : login.ip} • {formatDateShort(login.timestamp)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0 ml-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getProviderColor(login.provider)}`}>
                                                {login.provider}
                                            </span>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                                {formatDistanceToNow(new Date(login.timestamp), { addSuffix: true })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No login history found</p>
                        )}
                    </div>
                </div>

                {/* Device Statistics */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Device Usage</h3>
                    </div>
                    <div className="p-4 sm:p-6">
                        {Object.keys(computedStats.logins.deviceStats).length > 0 ? (
                            <div className="space-y-3">
                                {Object.entries(computedStats.logins.deviceStats)
                                    .sort(([,a], [,b]) => b - a)
                                    .map(([device, count]) => (
                                        <div key={device} className="flex items-center justify-between">
                                            <span className="text-sm text-gray-600 dark:text-gray-400 truncate flex-1 pr-2">{device}</span>
                                            <div className="flex items-center space-x-2 flex-shrink-0">
                                                <div className="w-16 sm:w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                                    <div 
                                                        className="bg-blue-500 h-2 rounded-full" 
                                                        style={{ width: `${(count / computedStats.logins.total) * 100}%` }}
                                                    />
                                                </div>
                                                <span className="text-sm font-medium text-gray-900 dark:text-white min-w-[2rem] text-right">{count}</span>
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        ) : (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No device data available</p>
                        )}
                    </div>
                </div>

                {/* Last Activity */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
                    <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Last Activity</h3>
                    </div>
                    <div className="p-4 sm:p-6 space-y-4">
                        {computedStats.lastActivity.lastLogin && (
                            <div className="flex items-center space-x-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Last Login</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {format(new Date(computedStats.lastActivity.lastLogin.timestamp), 'MMM dd, yyyy  hh:mm a')}
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {computedStats.lastActivity.lastFileUpload && (
                            <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white">Last File Upload</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {format(new Date(computedStats.lastActivity.lastFileUpload.uploadedAt), 'MMM dd, yyyy  hh:mm a')}
                                    </p>
                                </div>
                            </div>
                        )}
                        
                        {!computedStats.lastActivity.lastLogin && !computedStats.lastActivity.lastFileUpload && (
                            <p className="text-gray-500 dark:text-gray-400 text-center py-8">No recent activity</p>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default UserAnalyticsPage;

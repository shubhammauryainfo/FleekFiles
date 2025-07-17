'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import Layout from '@/components/Dashlayout';
import Table from '@/components/Table';
import axios from 'axios';

interface User {
    _id: string;
    name: string;
    email: string;
    phone?: string;
    provider: 'google' | 'credentials';
    __v: number;
}

interface UsersResponse {
    success: boolean;
    users: User[];
}

interface LoginLog {
    _id: string;
    email: string;
    userId: string;
    provider: 'google' | 'credentials';
    ip: string;
    device: string;
    timestamp: string;
    __v: number;
}

interface LoginLogsResponse {
    success: boolean;
    logs: LoginLog[];
}

interface FileMetadata {
    _id: string;
    filename: string;
    path: string;
    userId: string;
    uploadedAt: string;
    size: number;
    __v: number;
}

interface FileMetaResponse {
    count: number;
    files: FileMetadata[];
}

interface Feedback {
    _id: string;
    name: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
    __v: number;
}

interface DashboardData {
    users: User[];
    loginLogs: LoginLog[];
    files: FileMetadata[];
    feedback: Feedback[];
}

interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

const DashboardHomePage: React.FC = () => {
    const [data, setData] = useState<DashboardData>({
        users: [],
        loginLogs: [],
        files: [],
        feedback: []
    });
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null
    });

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    const fetchAllData = useCallback(async (): Promise<void> => {
        if (!apiKey) {
            setLoadingState({
                isLoading: false,
                error: 'API key is missing. Please check your environment variables.'
            });
            return;
        }

        setLoadingState({ isLoading: true, error: null });

        try {
            const headers = { 'x-api-key': apiKey };
            const timeout = 10000;

            const [usersRes, logsRes, filesRes, feedbackRes] = await Promise.all([
                axios.get<UsersResponse>('/api/users', { headers, timeout }),
                axios.get<LoginLogsResponse>('/api/loginlog', { headers, timeout }),
                axios.get<FileMetaResponse>('/api/filemeta', { headers, timeout }),
                axios.get<Feedback[]>('/api/feedback', { headers, timeout })
            ]);

            setData({
                users: usersRes.data.success ? usersRes.data.users : [],
                loginLogs: logsRes.data.success ? logsRes.data.logs : [],
                files: filesRes.data.files || [],
                feedback: Array.isArray(feedbackRes.data) ? feedbackRes.data : []
            });

            setLoadingState({ isLoading: false, error: null });
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'An unexpected error occurred';

            console.error('Error fetching dashboard data:', error);
            setLoadingState({ isLoading: false, error: errorMessage });
        }
    }, [apiKey]);

    const stats = useMemo(() => {
        const now = new Date();
        const today = now.toDateString();
        const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const totalUsers = data.users.length;
        const googleUsers = data.users.filter(user => user.provider === 'google').length;
        const credentialUsers = data.users.filter(user => user.provider === 'credentials').length;

        const totalLogins = data.loginLogs.length;
        const todayLogins = data.loginLogs.filter(log => 
            new Date(log.timestamp).toDateString() === today
        ).length;
        const weeklyLogins = data.loginLogs.filter(log => 
            new Date(log.timestamp) >= thisWeek
        ).length;
        const monthlyLogins = data.loginLogs.filter(log => 
            new Date(log.timestamp) >= thisMonth
        ).length;

        const totalFiles = data.files.length;
        const totalStorageSize = data.files.reduce((sum, file) => sum + file.size, 0);
        const todayFiles = data.files.filter(file => 
            new Date(file.uploadedAt).toDateString() === today
        ).length;
        const weeklyFiles = data.files.filter(file => 
            new Date(file.uploadedAt) >= thisWeek
        ).length;

        const totalFeedback = data.feedback.length;
        const todayFeedback = data.feedback.filter(fb => 
            new Date(fb.createdAt).toDateString() === today
        ).length;
        const weeklyFeedback = data.feedback.filter(fb => 
            new Date(fb.createdAt) >= thisWeek
        ).length;

        const recentLogins = data.loginLogs
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);

        const recentFiles = data.files
            .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
            .slice(0, 10);

        const recentFeedback = data.feedback
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);

        const userActivityMap = data.loginLogs.reduce((acc, log) => {
            acc[log.userId] = (acc[log.userId] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostActiveUsers = Object.entries(userActivityMap)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([userId, count]) => ({
                user: data.users.find(u => u._id === userId),
                loginCount: count
            }))
            .filter(item => item.user);

        return {
            totalUsers,
            googleUsers,
            credentialUsers,
            totalLogins,
            todayLogins,
            weeklyLogins,
            monthlyLogins,
            totalFiles,
            totalStorageSize,
            todayFiles,
            weeklyFiles,
            totalFeedback,
            todayFeedback,
            weeklyFeedback,
            recentLogins,
            recentFiles,
            recentFeedback,
            mostActiveUsers
        };
    }, [data]);

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const feedbackTableData = useMemo(() => {
        return stats.recentFeedback.map(feedback => ({
            id: feedback._id,
            name: feedback.name,
            email: feedback.email,
            subject: feedback.subject,
            message: feedback.message.length > 50 
                ? `${feedback.message.substring(0, 50)}...` 
                : feedback.message,
            createdAt: format(new Date(feedback.createdAt), 'MMM dd, yyyy HH:mm'),
            phone: feedback.phone || 'N/A'
        }));
    }, [stats.recentFeedback]);

    const feedbackTableColumns = [
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'subject', label: 'Subject' },
        { key: 'message', label: 'Message' },
        { key: 'createdAt', label: 'Date' }
    ];

    const handleRefresh = useCallback(() => {
        fetchAllData();
    }, [fetchAllData]);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    if (loadingState.isLoading) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading dashboard...</span>
                </div>
            </Layout>
        );
    }

    if (loadingState.error) {
        return (
            <Layout>
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Error loading dashboard
                            </h3>
                            <p className="mt-1 text-sm text-red-700">
                                {loadingState.error}
                            </p>
                            <button
                                onClick={handleRefresh}
                                className="mt-2 text-sm text-red-600 hover:underline"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-.5a4 4 0 110 5.292M9 12l2 2 4-4" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Users</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</p>
                            <p className="text-xs text-gray-500">
                                {stats.googleUsers} Google • {stats.credentialUsers} Email
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Logins</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalLogins}</p>
                            <p className="text-xs text-gray-500">
                                {stats.todayLogins} today • {stats.weeklyLogins} this week
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Files</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalFiles}</p>
                            <p className="text-xs text-gray-500">
                                {formatFileSize(stats.totalStorageSize)} • {stats.todayFiles} today
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.totalFeedback}</p>
                            <p className="text-xs text-gray-500">
                                {stats.todayFeedback} today • {stats.weeklyFeedback} this week
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Recent Logins</h3>
                    </div>
                    <div className="p-4 sm:p-6 max-h-80 overflow-y-auto">
                        <div className="space-y-4">
                            {stats.recentLogins.map((login) => (
                                <div key={login._id} className="flex items-center space-x-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                                        login.provider === 'google' ? 'bg-red-500' : 'bg-blue-500'
                                    }`}>
                                        {login.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {login.email}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {format(new Date(login.timestamp), 'MMM dd, HH:mm')} • {login.provider}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {stats.recentLogins.length === 0 && (
                                <p className="text-sm text-gray-500">No recent logins</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Recent Files</h3>
                    </div>
                    <div className="p-4 sm:p-6 max-h-80 overflow-y-auto">
                        <div className="space-y-4">
                            {stats.recentFiles.map((file) => (
                                <div key={file._id} className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                        <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {file.filename}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {formatFileSize(file.size)} • {format(new Date(file.uploadedAt), 'MMM dd, HH:mm')}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {stats.recentFiles.length === 0 && (
                                <p className="text-sm text-gray-500">No recent files</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow">
                    <div className="p-4 sm:p-6 border-b border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900">Most Active Users</h3>
                    </div>
                    <div className="p-4 sm:p-6 max-h-80 overflow-y-auto">
                        <div className="space-y-4">
                            {stats.mostActiveUsers.map((item, index) => (
                                <div key={item.user?._id} className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                                        {item.user?.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {item.user?.name}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {item.loginCount} logins • {item.user?.provider}
                                        </p>
                                    </div>
                                    <span className="text-xs text-gray-500">
                                        #{index + 1}
                                    </span>
                                </div>
                            ))}
                            {stats.mostActiveUsers.length === 0 && (
                                <p className="text-sm text-gray-500">No user activity</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow">
                <div className="p-4 sm:p-6 border-b border-gray-200">
                    <h3 className="text-lg font-medium text-gray-900">Recent Feedback</h3>
                </div>
                <div className="p-4 sm:p-6 overflow-x-auto">
                    {feedbackTableData.length > 0 ? (
                        <Table 
                            data={feedbackTableData} 
                            columns={feedbackTableColumns}
                            searchable={true} 
                            emptyMessage="No Feedbacks found"
                        />
                    ) : (
                        <p className="text-sm text-gray-500">No recent feedback</p>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default DashboardHomePage;
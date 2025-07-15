'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import Layout from '@/components/Dashlayout';
import Header from '@/components/Header';
import Table from '@/components/Table';
import axios from 'axios';

// Enhanced type definitions
interface LogData {
    _id: string;
    email: string;
    userId: string;
    provider: 'google' | 'credentials' | string;
    ip: string;
    device: string;
    timestamp: string;
}

interface ApiResponse {
    success: boolean;
    logs: LogData[];
    message?: string;
}

interface Column {
    key: keyof LogData | 'actions';
    label: string;
    render?: (row: LogData) => React.ReactNode;
    width?: string;
}

// Loading and error states
interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

const UsersLogsPage: React.FC = () => {
    const [data, setData] = useState<LogData[]>([]);
    const [filteredData, setFilteredData] = useState<LogData[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null
    });

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    // Enhanced columns with better rendering and sorting
    const columns: Column[] = useMemo(() => [
        { 
            key: 'email', 
            label: 'Email',
        },
        { 
            key: 'userId', 
            label: 'User ID',
          
        },
        { 
            key: 'provider', 
            label: 'Provider',
          
            render: (row: LogData) => (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                    ${row.provider === 'google' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 
                      row.provider === 'credentials' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' :
                      'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'}`}>
                    {row.provider}
                </span>
            )
        },
        { 
            key: 'ip', 
            label: 'IP Address',
          
            render: (row: LogData) => (
                <span className="font-mono text-sm text-gray-600 dark:text-gray-400">
                    {row.ip === '::1' ? 'localhost' : row.ip}
                </span>
            )
        },
        { 
            key: 'device', 
            label: 'Device',
         
        },
        {
            key: 'timestamp',
            label: 'Login Time',
           
            render: (row: LogData) => {
                const date = new Date(row.timestamp);
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
            const response = await axios.get<ApiResponse>('/api/loginlog', {
                headers: {
                    'x-api-key': apiKey,
                },
                timeout: 10000, // 10 second timeout
            });

            const responseData = response.data;
            
            if (responseData.success && Array.isArray(responseData.logs)) {
                const logData = responseData.logs;
                
                // Sort by timestamp (newest first)
                const sortedData = logData.sort((a, b) => 
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
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

            console.error('Error fetching logs:', error);
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
        const today = data.filter(log => {
            const logDate = new Date(log.timestamp);
            const today = new Date();
            return logDate.toDateString() === today.toDateString();
        }).length;

        return { total, today };
    }, [data]);

    if (loadingState.isLoading) {
        return (
            <Layout>
                <Header title="User Login Logs" />
                <div className="flex items-center justify-center min-h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600 dark:text-gray-400">Loading login logs...</span>
                </div>
            </Layout>
        );
    }

    if (loadingState.error) {
        return (
            <Layout>
                <Header title="User Login Logs" />
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800 dark:text-red-200">
                                Error loading logs
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
            <Header title="User Login Logs" />
            
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Logins</p>
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
                            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Today's Logins</p>
                            <p className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.today}</p>
                        </div>
                    </div>
                </div>
            </div>

            <Table
                columns={columns}
                data={filteredData}
                searchable={true} 
                exportable={true}
                emptyMessage="No login logs found"
            />
        </Layout>
    );
};

export default UsersLogsPage;
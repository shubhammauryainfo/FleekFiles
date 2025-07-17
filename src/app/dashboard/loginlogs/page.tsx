'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import Layout from '@/components/Dashlayout';
import Header from '@/components/Header';
import Table from '@/components/Table';
import Swal from 'sweetalert2';
import axios from 'axios';

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

interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

const UsersLogsPage: React.FC = () => {
    const [data, setData] = useState<LogData[]>([]);
    const [filteredData, setFilteredData] = useState<LogData[]>([]);
    const [selectedLogs, setSelectedLogs] = useState<string[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null
    });
    const [deleteLoading, setDeleteLoading] = useState(false);

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

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
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium capitalize
                    ${row.provider === 'google' ? 'bg-green-100 text-green-800' : 
                      row.provider === 'credentials' ? 'bg-blue-100 text-blue-800' :
                      'bg-red-100 text-red-800'}`}>
                    {row.provider}
                </span>
            )
        },
        { 
            key: 'ip', 
            label: 'IP Address',
            render: (row: LogData) => (
                <span className="font-mono text-xs sm:text-sm text-gray-600 break-all">
                    {row.ip === '::1' ? 'localhost' : row.ip}
                </span>
            )
        },
        { 
            key: 'device', 
            label: 'Device',
            render: (row: LogData) => (
                <span className="text-xs sm:text-sm text-gray-900 break-words">
                    {row.device}
                </span>
            )
        },
        {
            key: 'timestamp',
            label: 'Login Time',
            width:'120px',
            render: (row: LogData) => {
                const date = new Date(row.timestamp);
                const isToday = new Date().toDateString() === date.toDateString();
                
                return (
                    <div className="flex flex-col space-y-1">
                        <span className="text-xs sm:text-sm font-medium text-gray-900">
                            {format(date, 'MMM dd, yyyy')}
                        </span>
                        <span className={`text-xs ${isToday ? 'text-green-600' : 'text-gray-500'}`}>
                            {format(date, 'hh:mm:ss a')}
                        </span>
                    </div>
                );
            }
        }
    ], []);

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
                timeout: 10000,
            });

            const responseData = response.data;
            
            if (responseData.success && Array.isArray(responseData.logs)) {
                const logData = responseData.logs;
                
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

    const deleteLog = async (userId: string) => {
        try {
            await axios.delete(`/api/loginlog/${userId}`, {
                headers: {
                    'x-api-key': apiKey || '',
                },
            });

            setData((prevData) => prevData.filter((log) => log.userId !== userId));
            setFilteredData((prevData) => prevData.filter((log) => log.userId !== userId));
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to delete the log: ${axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'An unexpected error occurred'}`,
            });
            console.error('Error deleting log:', error);
        }
    };

    const handleSelectionChange = useCallback((selectedIndexes: number[]) => {
        const selected = selectedIndexes
            .map((index) => filteredData[index]?.userId)
            .filter(Boolean);
        setSelectedIds(selected);
        setSelectedLogs(selected);
    }, [filteredData]);

    const handleBulkDelete = useCallback(() => {
        if (selectedIds.length === 0) return;

        Swal.fire({
            title: 'Enter Password',
            text: 'Please enter the password to proceed with deletion:',
            input: 'password',
            inputPlaceholder: 'Enter password',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Verify',
            cancelButtonText: 'Cancel',
            inputValidator: (value) => {
                if (!value) {
                    return 'Password is required!';
                }
                if (value !== '8080') {
                    return 'Incorrect password!';
                }
                return null;
            }
        }).then((passwordResult) => {
            if (passwordResult.isConfirmed) {
                Swal.fire({
                    title: `Delete ${selectedIds.length} selected login logs?`,
                    text: "You won't be able to revert this!",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Yes, delete all!',
                }).then(async (result) => {
                    if (result.isConfirmed) {
                        setDeleteLoading(true);
                        
                        Swal.fire({
                            title: 'Deleting Login Logs...',
                            html: `Deleting ${selectedIds.length} login logs. Please wait...`,
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showConfirmButton: false,
                            didOpen: () => {
                                Swal.showLoading();
                            }
                        });

                        try {
                            await Promise.all(selectedIds.map((userId) => deleteLog(userId)));
                            
                            setSelectedIds([]);
                            setSelectedLogs([]);
                            
                            Swal.fire({
                                icon: 'success',
                                title: 'Deleted!',
                                text: `Successfully deleted ${selectedIds.length} login logs.`,
                                timer: 2000,
                                timerProgressBar: true,
                            });
                        } catch (error) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Some login logs could not be deleted. Please try again.',
                            });
                        } finally {
                            setDeleteLoading(false);
                        }
                    }
                });
            }
        });
    }, [selectedIds]);

    const handleRefresh = useCallback(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
                <div className="flex items-center justify-center min-h-64 px-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-sm sm:text-base text-gray-600">Loading login logs...</span>
                </div>
            </Layout>
        );
    }

    if (loadingState.error) {
        return (
            <Layout>
                <Header title="User Login Logs" />
                <div className="bg-red-50 border border-red-200 rounded-md p-4 mx-4 sm:mx-0">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Error loading logs
                            </h3>
                            <p className="mt-1 text-sm text-red-700 break-words">
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
            <Header title="User Login Logs" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4 px-4 sm:px-0">
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Total Logins</p>
                            <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-xs sm:text-sm font-medium text-gray-600">Today's Logins</p>
                            <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.today}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-4 sm:px-0">
                <Table
                    columns={columns}
                    data={filteredData}
                    searchable={true} 
                    exportable={true}
                    selectable={true}
                    onSelectionChange={handleSelectionChange}
                    onDeleteSelected={handleBulkDelete}
                    emptyMessage="No login logs found"
                />
            </div>
        </Layout>
    );
};

export default UsersLogsPage;
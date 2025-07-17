'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { format } from 'date-fns';
import Layout from '@/components/Dashlayout';
import Header from '@/components/Header';
import Table from '@/components/Table';
import Swal from 'sweetalert2';
import axios from 'axios';

interface FeedbackData {
    _id: string;
    name: string;
    phone: string;
    email: string;
    subject: string;
    message: string;
    createdAt: string;
    __v: number;
}

interface ApiResponse {
    success: boolean;
    feedback?: FeedbackData[];
    message?: string;
}

interface Column {
    key: keyof FeedbackData | 'actions';
    label: string;
    render?: (row: FeedbackData) => React.ReactNode;
    width?: string;
}

interface LoadingState {
    isLoading: boolean;
    error: string | null;
}

const FeedbackPage: React.FC = () => {
    const [data, setData] = useState<FeedbackData[]>([]);
    const [filteredData, setFilteredData] = useState<FeedbackData[]>([]);
    const [selectedFeedback, setSelectedFeedback] = useState<string[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [loadingState, setLoadingState] = useState<LoadingState>({
        isLoading: true,
        error: null
    });
    const [deleteLoading, setDeleteLoading] = useState(false);

    const apiKey = process.env.NEXT_PUBLIC_API_KEY;

    const columns: Column[] = useMemo(() => [
        { 
            key: 'name', 
            label: 'Name',
            width: '200px',
            render: (row: FeedbackData) => (
                <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm font-medium">
                        {row.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="ml-3 font-medium text-gray-900">
                        {row.name}
                    </span>
                </div>
            )
        },
        { 
            key: 'email', 
            label: 'Email',
            render: (row: FeedbackData) => (
                <a 
                    href={`mailto:${row.email}`}
                    className="text-blue-600 hover:underline break-all"
                >
                    {row.email}
                </a>
            )
        },
        { 
            key: 'phone', 
            label: 'Phone',
            render: (row: FeedbackData) => (
                <span className="font-mono text-sm text-gray-600">
                    {row.phone}
                </span>
            )
        },
        { 
            key: 'subject', 
            label: 'Subject',
            render: (row: FeedbackData) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {row.subject}
                </span>
            )
        },
        { 
            key: 'message', 
            label: 'Message',
            render: (row: FeedbackData) => (
                <div className="max-w-xs">
                    <p className="text-sm text-gray-700 truncate" title={row.message}>
                        {row.message.length > 50 ? `${row.message.substring(0, 50)}...` : row.message}
                    </p>
                    {row.message.length > 50 && (
                        <button
                            onClick={() => {
                                Swal.fire({
                                    title: 'Full Message',
                                    text: row.message,
                                    icon: 'info',
                                    confirmButtonText: 'Close'
                                });
                            }}
                            className="text-xs text-blue-600 hover:underline mt-1"
                        >
                            Read more
                        </button>
                    )}
                </div>
            )
        },
        {
            key: 'createdAt',
            label: 'Submitted At',
            width: '120px',
            render: (row: FeedbackData) => {
                const date = new Date(row.createdAt);
                const isToday = new Date().toDateString() === date.toDateString();
                
                return (
                    <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
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
            const response = await axios.get<FeedbackData[]>('/api/feedback', {
                headers: {
                    'x-api-key': apiKey,
                },
                timeout: 10000,
            });

            const responseData = response.data;
            
            if (Array.isArray(responseData)) {
                const sortedData = responseData.sort((a, b) => 
                    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                );
                
                setData(sortedData);
                setFilteredData(sortedData);
                setLoadingState({ isLoading: false, error: null });
            } else {
                throw new Error('Invalid response format');
            }
        } catch (error) {
            const errorMessage = axios.isAxiosError(error)
                ? error.response?.data?.message || error.message
                : 'An unexpected error occurred';

            console.error('Error fetching feedback:', error);
            setLoadingState({ isLoading: false, error: errorMessage });
            setData([]);
            setFilteredData([]);
        }
    }, [apiKey]);

    const deleteFeedback = async (id: string) => {
        try {
            await axios.delete(`/api/feedback/${id}`, {
                headers: {
                    'x-api-key': apiKey || '',
                },
            });

            setData((prevData) => prevData.filter((feedback) => feedback._id !== id));
            setFilteredData((prevData) => prevData.filter((feedback) => feedback._id !== id));
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Failed to delete the feedback: ${axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'An unexpected error occurred'}`,
            });
            console.error('Error deleting feedback:', error);
        }
    };

    const handleSelectionChange = useCallback((selectedIndexes: number[]) => {
        const selected = selectedIndexes
            .map((index) => filteredData[index]?._id)
            .filter(Boolean);
        setSelectedIds(selected);
        setSelectedFeedback(selected);
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
                    title: `Delete ${selectedIds.length} selected feedback entries?`,
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
                            title: 'Deleting Feedback...',
                            html: `Deleting ${selectedIds.length} feedback entries. Please wait...`,
                            allowOutsideClick: false,
                            allowEscapeKey: false,
                            showConfirmButton: false,
                            didOpen: () => {
                                Swal.showLoading();
                            }
                        });

                        try {
                            await Promise.all(selectedIds.map((id) => deleteFeedback(id)));
                            
                            setSelectedIds([]);
                            setSelectedFeedback([]);
                            
                            Swal.fire({
                                icon: 'success',
                                title: 'Deleted!',
                                text: `Successfully deleted ${selectedIds.length} feedback entries.`,
                                timer: 2000,
                                timerProgressBar: true,
                            });
                        } catch (error) {
                            Swal.fire({
                                icon: 'error',
                                title: 'Error',
                                text: 'Some feedback entries could not be deleted. Please try again.',
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
        const today = data.filter(feedback => {
            const feedbackDate = new Date(feedback.createdAt);
            const today = new Date();
            return feedbackDate.toDateString() === today.toDateString();
        }).length;

        const thisWeek = data.filter(feedback => {
            const feedbackDate = new Date(feedback.createdAt);
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            return feedbackDate >= weekAgo;
        }).length;

        const subjectCounts = data.reduce((acc, feedback) => {
            acc[feedback.subject] = (acc[feedback.subject] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostCommonSubject = Object.keys(subjectCounts).reduce((a, b) => 
            subjectCounts[a] > subjectCounts[b] ? a : b, 
            Object.keys(subjectCounts)[0] || 'None'
        );

        return { total, today, thisWeek, mostCommonSubject };
    }, [data]);

    if (loadingState.isLoading) {
        return (
            <Layout>
                <Header title="Feedback Management" />
                <div className="flex items-center justify-center min-h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-3 text-gray-600">Loading feedback...</span>
                </div>
            </Layout>
        );
    }

    if (loadingState.error) {
        return (
            <Layout>
                <Header title="Feedback Management" />
                <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-3">
                            <h3 className="text-sm font-medium text-red-800">
                                Error loading feedback
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
            <Header title="Feedbacks" />
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-4">
                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Feedback</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Today's Feedback</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.today}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">This Week</p>
                            <p className="text-2xl font-semibold text-gray-900">{stats.thisWeek}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-4 sm:p-6">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                            </div>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Most Common</p>
                            <p className="text-lg font-semibold text-gray-900 truncate" title={stats.mostCommonSubject}>
                                {stats.mostCommonSubject}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <Table
                    columns={columns}
                    data={filteredData}
                    searchable={true} 
                    exportable={true}
                    selectable={true}
                    onSelectionChange={handleSelectionChange}
                    onDeleteSelected={handleBulkDelete}
                    emptyMessage="No feedback found"
                />
            </div>
        </Layout>
    );
};

export default FeedbackPage;
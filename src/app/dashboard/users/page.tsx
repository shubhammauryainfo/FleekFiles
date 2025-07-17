'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FaRegIdCard } from "react-icons/fa6";
import Layout from '@/components/Dashlayout';
import Header from '@/components/Header';
import Table from '@/components/Table';
import { format } from 'date-fns';
import Swal from 'sweetalert2';
import axios from 'axios';

interface UserData {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  provider: string;
  analytics: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

interface ApiResponse {
  success: boolean;
  users: UserData[];
  message?: string;
}

interface Column {
  key: keyof UserData | 'actions';
  label: string;
  render?: (row: UserData) => React.ReactNode;
  width?: string;
}

interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

const UsersPage: React.FC = () => {
  const [data, setData] = useState<UserData[]>([]);
  const [filteredData, setFilteredData] = useState<UserData[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: true,
    error: null
  });
  const [deleteLoading, setDeleteLoading] = useState(false);

  const apiKey = process.env.NEXT_PUBLIC_API_KEY;

  const getProviderInfo = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'google':
        return {
          color: 'bg-green-100 text-green-800',
          icon: '🌐'
        };
      case 'credentials':
        return {
          color: 'bg-blue-100 text-blue-800',
          icon: '🔒'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800',
          icon: '👤'
        };
    }
  };

  const getUserInitials = (name: string): string => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const columns: Column[] = useMemo(() => [
    {
      key: 'name',
      label: 'User',
      render: (row: UserData) => (
        <div className="flex items-center">
          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-medium mr-2 sm:mr-3">
            {getUserInitials(row.name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs sm:text-sm font-medium text-gray-900 truncate">
              {row.name}
            </div>
            <div className="text-xs text-gray-500 truncate block sm:hidden">
              {row.email}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (row: UserData) => (
        <div className="hidden sm:block">
          <a
            href={`mailto:${row.email}`}
            className="text-xs sm:text-sm text-blue-600 hover:underline truncate block"
          >
            {row.email}
          </a>
        </div>
      )
    },
    {
      key: '_id',
      label: 'ID',
      width:'200px'
    },
    {
      key: 'phone',
      label: 'Phone',
      width: '140px',
      render: (row: UserData) => (
        <div className="hidden md:block">
          <span className="text-xs sm:text-sm text-gray-900">
            {row.phone || 'N/A'}
          </span>
        </div>
      )
    },
    {
      key: 'provider',
      label: 'Provider',
      width: '120px',
      render: (row: UserData) => {
        const providerInfo = getProviderInfo(row.provider);
        return (
          <span className={`inline-flex items-center px-1 sm:px-2 py-1 rounded text-xs font-medium ${providerInfo.color}`}>
            <span className="mr-1">{providerInfo.icon}</span>
            <span className="hidden sm:inline">
              {row.provider.charAt(0).toUpperCase() + row.provider.slice(1)}
            </span>
          </span>
        );
      }
    },
    {
      key: 'updatedAt',
      label: 'Last Update',
      width:'120px',
      render: (row: UserData) => {
          const date = new Date(row.updatedAt);
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
  },
    {
      key: 'analytics',
      label: 'Actions',
      width: '60px',
      render: (row: UserData) => {
        return (
          <a href={`/dashboard/users/${row._id}`}>
            <button className="bg-blue-500 hover:bg-blue-400 text-white p-1 sm:p-2 text-sm sm:text-xl rounded transition-colors">
              <FaRegIdCard />
            </button>
          </a>
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
      const response = await axios.get<ApiResponse>('/api/users', {
        headers: {
          'x-api-key': apiKey,
        },
        timeout: 10000,
      });

      const responseData = response.data;

      if (responseData.success && Array.isArray(responseData.users)) {
        const userData = responseData.users;
        const sortedData = userData.sort((a, b) =>
          a.name.localeCompare(b.name)
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

      console.error('Error fetching users:', error);
      setLoadingState({ isLoading: false, error: errorMessage });
      setData([]);
      setFilteredData([]);
    }
  }, [apiKey]);

  const deleteUser = async (_id: string) => {
    try {
      await axios.delete(`/api/users/${_id}`, {
        headers: {
          'x-api-key': apiKey || '',
        },
      });

      setData((prevData) => prevData.filter((user) => user._id !== _id));
      setFilteredData((prevData) => prevData.filter((user) => user._id !== _id));
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Failed to delete the user: ${axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'An unexpected error occurred'}`,
      });
      console.error('Error deleting user:', error);
    }
  };

  const handleSelectionChange = useCallback((selectedIndexes: number[]) => {
    const selected = selectedIndexes
      .map((index) => filteredData[index]?._id)
      .filter(Boolean);
    setSelectedIds(selected);
    setSelectedUsers(selected);
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
          title: `Delete ${selectedIds.length} selected users?`,
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
              title: 'Deleting Users...',
              html: `Deleting ${selectedIds.length} users. Please wait...`,
              allowOutsideClick: false,
              allowEscapeKey: false,
              showConfirmButton: false,
              didOpen: () => {
                Swal.showLoading();
              }
            });

            try {
              await Promise.all(selectedIds.map((_id) => deleteUser(_id)));

              setSelectedIds([]);
              setSelectedUsers([]);

              Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: `Successfully deleted ${selectedIds.length} users.`,
                timer: 2000,
                timerProgressBar: true,
              });
            } catch (error) {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Some users could not be deleted. Please try again.',
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
    const providerCounts = data.reduce((acc, user) => {
      acc[user.provider] = (acc[user.provider] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, providerCounts };
  }, [data]);

  if (loadingState.isLoading) {
    return (
      <Layout>
        <Header title="User Management" />
        <div className="flex items-center justify-center min-h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading users...</span>
        </div>
      </Layout>
    );
  }

  if (loadingState.error) {
    return (
      <Layout>
        <Header title="User Management" />
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Error loading users
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
      <Header title="User Management" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 my-4">
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Google Users</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.providerCounts.google || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-gray-600">Credential Users</p>
              <p className="text-xl sm:text-2xl font-semibold text-gray-900">{stats.providerCounts.credentials || 0}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-hidden">
        <Table
          columns={columns}
          data={filteredData}
          searchable={true}
          exportable={true}
          selectable={true}
          onSelectionChange={handleSelectionChange}
          onDeleteSelected={handleBulkDelete}
          emptyMessage="No users found"
        />
      </div>
    </Layout>
  );
};

export default UsersPage;
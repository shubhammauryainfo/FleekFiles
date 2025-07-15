"use client";

import React, { useState, useMemo } from 'react';
import { GrLinkNext, GrLinkPrevious } from 'react-icons/gr';
import { TiExport } from 'react-icons/ti';
import { MdDeleteForever } from 'react-icons/md';

interface Column {
    key: string;
    label: string;
    width?: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (row: any, index: number) => React.ReactNode;
}

interface TableProps {
    columns: Column[];
    data: any[];
    rowsPerPage?: number;
    searchable?: boolean;
    sortable?: boolean;
    filterable?: boolean;
    selectable?: boolean;
    exportable?: boolean;
    onRowClick?: ((row: any, index: number) => void) | null;
    onSelectionChange?: ((selectedIndexes: number[]) => void) | null;
    onDeleteSelected?: (selectedIndexes: number[]) => void;
    className?: string;
    tableClassName?: string;
    headerClassName?: string;
    rowClassName?: string;
    emptyMessage?: string;
}

interface SortConfig {
    key: string | null;
    direction: 'asc' | 'desc';
}

const Table: React.FC<TableProps> = ({
    columns,
    data,
    rowsPerPage = 10,
    searchable = false,
    sortable = false,
    filterable = false,
    selectable = false,
    exportable = false,
    onRowClick = null,
    onSelectionChange = null,
    onDeleteSelected,
    className = "",
    tableClassName = "",
    headerClassName = "",
    rowClassName = "",
    emptyMessage = "No data available"
}) => {
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
    const [filters, setFilters] = useState<Record<string, string>>({});
    const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());
    const [rowsPerPageState, setRowsPerPageState] = useState<number>(rowsPerPage);

    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, filters, rowsPerPageState]);
    
    React.useEffect(() => {
        setSelectedRows(new Set());
        onSelectionChange && onSelectionChange([]);
    }, [data]);

    // Get unique values for filterable columns
    const getUniqueValues = (key: string): any[] => {
        return [...new Set(data.map(item => item[key]).filter(Boolean))];
    };

    // Filtered and sorted data
    const processedData = useMemo(() => {
        let filtered = [...data];

        // Apply search filter
        if (searchable && searchTerm) {
            filtered = filtered.filter(row =>
                columns.some(column => {
                    const value = row[column.key];
                    return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
                })
            );
        }

        // Apply column filters
        Object.entries(filters).forEach(([key, value]) => {
            if (value && value !== 'all') {
                filtered = filtered.filter(row => row[key] === value);
            }
        });

        // Apply sorting
        if (sortable && sortConfig.key) {
            filtered.sort((a, b) => {
                const aValue = a[sortConfig.key!];
                const bValue = b[sortConfig.key!];

                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filtered;
    }, [data, searchTerm, sortConfig, filters, searchable, sortable, columns]);

    const totalPages = Math.ceil(processedData.length / rowsPerPageState);
    const startIndex = (currentPage - 1) * rowsPerPageState;
    const currentPageData = processedData.slice(startIndex, startIndex + rowsPerPageState);

    const handlePageChange = (page: number): void => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const handleSort = (key: string): void => {
        if (!sortable) return;

        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleRowSelection = (rowIndex: number, isSelected: boolean): void => {
        const newSelection = new Set(selectedRows);
        if (isSelected) {
            newSelection.add(rowIndex);
        } else {
            newSelection.delete(rowIndex);
        }
        setSelectedRows(newSelection);
        onSelectionChange && onSelectionChange(Array.from(newSelection));
    };

    const handleSelectAll = (isSelected: boolean): void => {
        if (isSelected) {
            const allIndexes = currentPageData.map((_, index) => startIndex + index);
            setSelectedRows(new Set(allIndexes));
            onSelectionChange && onSelectionChange(allIndexes);
        } else {
            setSelectedRows(new Set());
            onSelectionChange && onSelectionChange([]);
        }
    };

    const exportToCSV = (): void => {
        const headers = columns.map(col => col.label).join(',');
        const rows = processedData.map(row =>
            columns.map(col => {
                const value = row[col.key];
                return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
            }).join(',')
        );

        const csvContent = [headers, ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'table-data.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const getSortIcon = (key: string): string => {
        if (sortConfig.key !== key) return '↕️';
        return sortConfig.direction === 'asc' ? '↑' : '↓';
    };

    return (
        <div className={`overflow-x-auto mt-2 rounded-lg shadow-sm max-w-[1243px] ${className}`}>
            {/* Controls */}
            <div className="mb-3 flex flex-wrap gap-2 items-center justify-between bg-gray-50 p-2 rounded-t-lg border">
                <div className="flex flex-wrap gap-1 items-center">
                    {/* Search */}
                    {searchable && (
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-400 w-32"
                        />
                    )}

                    {/* Filters */}
                    {filterable && columns.filter(col => col.filterable).map(column => (
                        <select
                            key={column.key}
                            value={filters[column.key] || 'all'}
                            onChange={(e) => setFilters(prev => ({
                                ...prev,
                                [column.key]: e.target.value
                            }))}
                            className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-400"
                        >
                            <option value="all">All {column.label}</option>
                            {getUniqueValues(column.key).map(value => (
                                <option key={value} value={value}>{value}</option>
                            ))}
                        </select>
                    ))}

                    {/* Rows per page */}
                    <select
                        value={rowsPerPageState}
                        onChange={(e) => setRowsPerPageState(Number(e.target.value))}
                        className="px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-teal-400"
                    >
                        <option value={5}>5</option>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                    </select>
                </div>

                <div className="flex gap-2 items-center">
                    {selectable && selectedRows.size > 0 && onDeleteSelected && (
                        <button
                            onClick={() => onDeleteSelected(Array.from(selectedRows))}
                            className="bg-red-500 flex hover:bg-red-600 text-white px-1 text-md rounded"
                            type="button"
                        >
                            <MdDeleteForever className='text-xl pt-1' /> ({selectedRows.size})
                        </button>
                    )}

                    {/* Data info */}
                    <span className="text-xs text-gray-600">
                        {startIndex + 1}-{Math.min(startIndex + rowsPerPageState, processedData.length)} of {processedData.length}
                        {data.length !== processedData.length && ` (${data.length})`}
                    </span>

                    {/* Export button */}
                    {exportable && (
                        <button
                            onClick={exportToCSV}
                            className="px-2 py-1 text-lg ml-2 bg-teal-500 text-white rounded hover:bg-teal-600 focus:outline-none focus:ring-1 focus:ring-teal-400"
                            type="button"
                        >
                            <TiExport />
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <table className={`w-full table-fixed border-collapse border border-gray-300 ${tableClassName}`}>
                <thead>
                    <tr className={`bg-gradient-to-br from-teal-400 via-cyan-500 to-blue-500 text-white text-left ${headerClassName}`}>
                        {selectable && (
                            <th className="px-1 py-1 border border-gray-400 font-medium w-8">
                                <input
                                    type="checkbox"
                                    checked={currentPageData.length > 0 && currentPageData.every((_, index) => selectedRows.has(startIndex + index))}
                                    onChange={(e) => handleSelectAll(e.target.checked)}
                                    className="rounded w-3 h-3"
                                />
                            </th>
                        )}
                        {columns.map((column) => (
                            <th
                                key={column.key}
                                className={`px-2 py-1 border border-gray-400 font-medium text-xs ${sortable && column.sortable !== false ? 'cursor-pointer hover:bg-teal-600' : ''}`}
                                style={{ width: column.width || 'auto' }}
                                onClick={() => column.sortable !== false && handleSort(column.key)}
                            >
                                <div className="flex items-center justify-between">
                                    <span className="truncate">{column.label}</span>
                                    {sortable && column.sortable !== false && (
                                        <span className="ml-1 text-xs opacity-70">
                                            {getSortIcon(column.key)}
                                        </span>
                                    )}
                                </div>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {currentPageData.length > 0 ? (
                        currentPageData.map((row, rowIndex) => {
                            const actualIndex = startIndex + rowIndex;
                            const isSelected = selectedRows.has(actualIndex);

                            return (
                                <tr
                                    key={actualIndex}
                                    className={`
                                        ${rowIndex % 2 === 0 ? 'bg-gray-50' : 'bg-white'} 
                                        ${isSelected ? 'bg-teal-100' : ''}
                                        ${onRowClick ? 'cursor-pointer hover:bg-gray-100' : ''}
                                        border-b border-gray-200 transition-colors
                                        ${rowClassName}
                                    `}
                                    onClick={() => onRowClick && onRowClick(row, actualIndex)}
                                >
                                    {selectable && (
                                        <td className="px-1 py-1 border-r border-gray-200">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={(e) => {
                                                    e.stopPropagation();
                                                    handleRowSelection(actualIndex, e.target.checked);
                                                }}
                                                className="rounded w-3 h-3"
                                            />
                                        </td>
                                    )}
                                    {columns.map((column) => (
                                        <td
                                            key={column.key}
                                            className="px-2 py-1 border-r border-gray-200 text-xs text-gray-700"
                                            style={{ width: column.width || 'auto' }}
                                        >
                                            <div className="truncate whitespace-normal">
                                                {column.render ? column.render(row, actualIndex) : row[column.key]}
                                            </div>
                                        </td>
                                    ))}
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={columns.length + (selectable ? 1 : 0)} className="px-4 py-6 text-center text-xs text-gray-500">
                                {emptyMessage}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-2 p-2 bg-gray-50 rounded-b-lg border-t">
                    <div className="text-xs text-gray-600">
                        Page {currentPage} of {totalPages}
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => handlePageChange(1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                        >
                            First
                        </button>

                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-2 py-1 bg-teal-300 text-gray-800 rounded hover:bg-teal-400 disabled:bg-gray-200 disabled:opacity-50"
                            type="button"
                        >
                            <GrLinkPrevious size={12} />
                        </button>

                        {/* Page numbers */}
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum: number;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => handlePageChange(pageNum)}
                                    className={`px-2 py-1 text-xs rounded ${currentPage === pageNum
                                            ? 'bg-teal-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                    type="button"
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 bg-teal-300 text-gray-800 rounded hover:bg-teal-400 disabled:bg-gray-200 disabled:opacity-50"
                            type="button"
                        >
                            <GrLinkNext size={12} />
                        </button>

                        <button
                            onClick={() => handlePageChange(totalPages)}
                            disabled={currentPage === totalPages}
                            className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            type="button"
                        >
                            Last
                        </button>
                    </div>
                </div>
            )}

            {/* Selection info */}
            {selectable && selectedRows.size > 0 && (
                <div className="mt-1 p-1 bg-teal-50 rounded border border-teal-200">
                    <span className="text-xs text-teal-800">
                        {selectedRows.size} selected
                    </span>
                </div>
            )}
        </div>
    );
};

export default Table;
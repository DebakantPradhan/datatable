import React, { useState, useCallback } from 'react';

const USERS_DATA = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Inactive' },
  { id: 3, name: 'Alice Johnson', email: 'alice@example.com', role: 'Admin', status: 'Active' },
  { id: 4, name: 'Charlie Brown', email: 'charlie@example.com', role: 'User', status: 'Inactive' },
  { id: 5, name: 'David Wilson', email: 'david@example.com', role: 'Admin', status: 'Active' },
  { id: 6, name: 'Eve Davis', email: 'eve@example.com', role: 'User', status: 'Active' },
  { id: 7, name: 'Frank Miller', email: 'frank@example.com', role: 'Admin', status: 'Inactive' }
];

const PAGE_SIZE_OPTIONS = [2, 5, 10, 25];

const DataTable = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pageNum, setPageNum] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);
  const [sortBy, setSortBy] = useState({ field: '', order: 'asc' });
  const [activeFilters, setActiveFilters] = useState({
    role: '',
    status: ''
  });

  const filterData = useCallback((data) => {
    let result = [...data];
    
    if (searchQuery) {
      result = result.filter(row => 
        Object.values(row).some(val => 
          val.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
    
    Object.entries(activeFilters).forEach(([key, value]) => {
      if (value) {
        result = result.filter(row => row[key] === value);
      }
    });
    
    return result;
  }, [searchQuery, activeFilters]);

  const handlePageChange = (newPage) => {
    const lastPage = Math.ceil(filterData(USERS_DATA).length / pageSize) - 1;
    if (newPage < 0 || newPage > lastPage) return;
    setPageNum(newPage);
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(Number(newSize));
    setPageNum(0);
  };

  const handleSort = (field) => {
    setSortBy(prev => ({
      field,
      order: prev.field === field && prev.order === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getPageData = () => {
    try {
      let filtered = filterData(USERS_DATA);
      
      if (sortBy.field) {
        filtered.sort((a, b) => {
          const aVal = a[sortBy.field];
          const bVal = b[sortBy.field];
          
          if (typeof aVal === 'string') {
            return sortBy.order === 'asc' 
              ? aVal.localeCompare(bVal)
              : bVal.localeCompare(aVal);
          }
          
          return sortBy.order === 'asc' ? aVal - bVal : bVal - aVal;
        });
      }
      
      const start = pageNum * pageSize;
      return filtered.slice(start, start + pageSize);
    } catch (err) {
      console.error('Failed to process table data:', err);
      return [];
    }
  };

  const filteredData = filterData(USERS_DATA);
  const totalPages = Math.ceil(filteredData.length / pageSize);

  // Get unique values for filters
  const roles = [...new Set(USERS_DATA.map(item => item.role))];
  const statuses = [...new Set(USERS_DATA.map(item => item.status))];

  return (
    <div className="mt-4">
      <div className="mb-4 flex gap-3 items-center justify-between">
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search table..."
            className="px-3 py-1 border rounded w-64"
          />
          
          <select 
            value={activeFilters.role}
            onChange={e => setActiveFilters(prev => ({
              ...prev,
              role: e.target.value
            }))}
            className="px-2 border rounded"
          >
            <option value="">All Roles</option>
            {roles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select 
            value={activeFilters.status}
            onChange={e => setActiveFilters(prev => ({
              ...prev,
              status: e.target.value
            }))}
            className="px-2 border rounded"
          >
            <option value="">All Statuses</option>
            {statuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Records per page:</span>
          <select
            value={pageSize}
            onChange={e => handlePageSizeChange(e.target.value)}
            className="px-2 py-1 border rounded"
          >
            {PAGE_SIZE_OPTIONS.map(size => (
              <option key={size} value={size}>{size}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              {Object.keys(USERS_DATA[0]).map(field => (
                <th 
                  key={field}
                  onClick={() => handleSort(field)}
                  className="p-2 text-left cursor-pointer hover:bg-gray-200"
                >
                  <div className="flex items-center gap-1">
                    {field}
                    {sortBy.field === field && (
                      <span>{sortBy.order === 'asc' ? '↑' : '↓'}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getPageData().map(row => (
              <tr 
                key={row.id} 
                className="border-t hover:bg-gray-50"
              >
                {Object.values(row).map((cell, i) => (
                  <td key={i} className="p-2">{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex justify-between items-center">
        <span className="text-sm text-gray-600">
          Showing {Math.min(pageNum * pageSize + 1, filteredData.length)} to{' '}
          {Math.min((pageNum + 1) * pageSize, filteredData.length)} of {filteredData.length} entries
        </span>
        
        <div className="flex gap-2">
          <button
            onClick={() => handlePageChange(pageNum - 1)}
            disabled={pageNum === 0}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(pageNum + 1)}
            disabled={pageNum >= totalPages - 1}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
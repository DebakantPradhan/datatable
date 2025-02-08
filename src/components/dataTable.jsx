import React, { useState, useMemo } from 'react';

// Sample data - replace with your actual data
const initialData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Inactive' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'Manager', status: 'Active' },
  // Add more sample data
];

const DataTable = () => {
  // State management
  const [data, setData] = useState(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [filters, setFilters] = useState({
    role: '',
    status: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filtering logic
  const filteredData = useMemo(() => {
    return data.filter(item => {
      // Search across all fields
      const matchesSearch = Object.values(item).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );

      // Role filter
      const matchesRoleFilter = !filters.role || item.role === filters.role;

      // Status filter
      const matchesStatusFilter = !filters.status || item.status === filters.status;

      return matchesSearch && matchesRoleFilter && matchesStatusFilter;
    });
  }, [data, searchTerm, filters]);

  // Sorting logic
  const sortedData = useMemo(() => {
    return [...filteredData].sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Pagination logic
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedData.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedData, currentPage]);

  // Sorting handler
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Unique values for filters
  const uniqueRoles = [...new Set(data.map(item => item.role))];
  const uniqueStatuses = [...new Set(data.map(item => item.status))];

  // Total pages calculation
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        {/* Search and Filters */}
        <div className="p-4 flex space-x-4">
          {/* Search Input */}
          <input 
            type="text" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow px-3 py-2 border rounded-md"
          />

          {/* Role Filter */}
          <select 
            value={filters.role}
            onChange={(e) => setFilters(prev => ({ ...prev, role: e.target.value }))}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Roles</option>
            {uniqueRoles.map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select 
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border rounded-md"
          >
            <option value="">All Statuses</option>
            {uniqueStatuses.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>

        {/* Data Table */}
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              {Object.keys(initialData[0]).map(key => (
                <th 
                  key={key} 
                  onClick={() => handleSort(key)}
                  className="p-3 text-left cursor-pointer hover:bg-gray-300 transition"
                >
                  {key.charAt(0).toUpperCase() + key.slice(1)}
                  {sortConfig.key === key && (
                    <span className="ml-2">
                      {sortConfig.direction === 'asc' ? '▲' : '▼'}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map(row => (
              <tr key={row.id} className="border-b hover:bg-gray-100">
                {Object.values(row).map((value, index) => (
                  <td key={index} className="p-3">{value}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="p-4 flex justify-between items-center">
          <div>
            Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
            {Math.min(currentPage * itemsPerPage, filteredData.length)} of{' '}
            {filteredData.length} entries
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Previous
            </button>
            {[...Array(totalPages)].map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPage(index + 1)}
                className={`px-4 py-2 border rounded-md ${
                  currentPage === index + 1 ? 'bg-blue-500 text-white' : ''
                }`}
              >
                {index + 1}
              </button>
            ))}
            <button 
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border rounded-md disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
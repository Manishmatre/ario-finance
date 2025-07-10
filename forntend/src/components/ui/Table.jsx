import React from "react";
import { FiChevronDown, FiChevronUp } from "react-icons/fi";

export default function Table({
  data = [],
  columns = [],
  className = "",
  onRowClick = null,
  loading = false,
  emptyMessage = "No data available",
  stickyHeader = false,
  pageSize = 10,
  onSort = null,
  defaultSort = null,
}) {
  const [sortState, setSortState] = React.useState(
    defaultSort || { column: "", direction: null }
  );

  // Sort data
  const sortedData = React.useMemo(() => {
    if (!sortState.column) return data;
    
    return [...data].sort((a, b) => {
      const aValue = a[sortState.column];
      const bValue = b[sortState.column];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortState.direction === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return sortState.direction === 'asc' ? aValue - bValue : bValue - aValue;
    });
  }, [data, sortState]);

  // Paginate data
  const [currentPage, setCurrentPage] = React.useState(1);
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="w-full border border-gray-300 bg-white rounded-lg shadow-sm">
        {stickyHeader && (
          <colgroup>
            {columns.map((col) => (
              <col key={col.accessor || col.Header} />
            ))}
          </colgroup>
        )}
        <thead className={stickyHeader ? 'sticky top-0 z-10 bg-white' : ''}>
          <tr className="border-b border-gray-300 bg-gray-50">
            {columns.map((col) => (
              <th
                key={col.accessor || col.Header}
                className={`px-4 py-3 border-b text-left font-semibold text-gray-700 cursor-pointer ${
                  col.disableSort ? 'opacity-50' : ''
                } ${col.className || ''}`}
                onClick={() => {
                  if (col.disableSort) return;
                  const isCurrent = sortState.column === col.accessor;
                  const direction = isCurrent
                    ? sortState.direction === 'asc'
                      ? 'desc'
                      : 'asc'
                    : 'asc';
                  setSortState({ column: col.accessor, direction });
                  onSort?.({ column: col.accessor, direction });
                }}
              >
                <div className="flex items-center gap-1">
                  {col.Header}
                  {!col.disableSort && (
                    <span className="text-sm">
                      {sortState.column === col.accessor ? (
                        sortState.direction === 'asc' ? (
                          <FiChevronUp className="w-4 h-4" />
                        ) : (
                          <FiChevronDown className="w-4 h-4" />
                        )
                      ) : null}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center">
                <div className="flex flex-col items-center gap-2">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  <span>Loading...</span>
                </div>
              </td>
            </tr>
          ) : sortedData.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="py-8 text-center text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            paginatedData.map((row, i) => (
              <tr
                key={row.id || row._id || i}
                className={`hover:bg-blue-50 transition-colors ${
                  (i + 1) % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                }`}
                onClick={() => onRowClick?.(row)}
              >
                {columns.map((col) => (
                  <td
                    key={(row.id || row._id || i) + '-' + (col.accessor || col.Header)}
                    className={`px-4 py-3 border-b ${
                      col.className || ''
                    } ${col.align === 'right' ? 'text-right' : ''} ${
                      col.align === 'center' ? 'text-center' : ''
                    }`}
                  >
                    {col.Cell ? (
                      <col.Cell value={row[col.accessor]} row={{ original: row }} />
                    ) : (
                      row[col.accessor]
                    )}
                  </td>
                ))}
              </tr>
            ))
          )}
      </tbody>
    </table>
      {sortedData.length > 0 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-gray-300 bg-gray-50">
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} entries
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-3 py-1 rounded-md bg-blue-50 text-blue-600">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md text-sm text-gray-600 hover:bg-gray-100 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

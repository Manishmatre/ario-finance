import React from "react";

export default function Table({ data, columns }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border border-gray-300 bg-white rounded-lg shadow-sm">
      <thead>
          <tr>
            {columns.map(col => (
              <th key={col.accessor || col.Header} className="px-4 py-2 border-b bg-gray-50 text-left font-semibold text-gray-700">
                {col.Header}
              </th>
            ))}
          </tr>
      </thead>
      <tbody>
          {data.map((row, i) => (
            <tr key={row.id || row._id || i} className="hover:bg-blue-50 transition-colors">
              {columns.map(col => (
                <td key={(row.id || row._id || i) + '-' + (col.accessor || col.Header)} className="px-4 py-2 border-b">
                  {row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
      </tbody>
    </table>
    </div>
  );
}

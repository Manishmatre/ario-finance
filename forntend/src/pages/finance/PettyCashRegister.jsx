import React, { useState } from "react";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";

export default function PettyCashRegister() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const totalPages = 2;
  const pettyCash = [
    { site: 'Site A', opening: 1000, closing: 800, date: '2024-06-01', notes: 'Materials' },
    // ...
  ];
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Petty Cash Register</h2>
      {loading ? (
        <Loader />
      ) : pettyCash.length === 0 ? (
        <EmptyState message="No petty cash entries found." />
      ) : (
        <Table
          columns={[
            { Header: 'Site', accessor: 'site' },
            { Header: 'Opening', accessor: 'opening' },
            { Header: 'Closing', accessor: 'closing' },
            { Header: 'Date', accessor: 'date' },
            { Header: 'Notes', accessor: 'notes' },
          ]}
          data={pettyCash}
        />
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

import React, { useState } from "react";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";

export default function Cashbook() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const totalPages = 2;
  const cashbook = [
    { date: '2024-06-01', amount: 1000, type: 'In', narration: 'Cash received' },
    // ...
  ];
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Cashbook</h2>
      {loading ? (
        <Loader />
      ) : cashbook.length === 0 ? (
        <EmptyState message="No cashbook entries found." />
      ) : (
        <Table
          columns={[
            { Header: 'Date', accessor: 'date' },
            { Header: 'Amount', accessor: 'amount' },
            { Header: 'Type', accessor: 'type' },
            { Header: 'Narration', accessor: 'narration' },
          ]}
          data={cashbook}
        />
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

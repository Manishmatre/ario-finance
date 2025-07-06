import React, { useState } from "react";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";

export default function JournalEntries() {
  // Dummy data for now
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const totalPages = 3;
  const entries = [
    { date: '2024-06-01', debit: 'Cash', credit: 'Revenue', amount: 10000, narration: 'Project payment' },
    // ...
  ];
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Journal Entries</h2>
      {loading ? (
        <Loader />
      ) : entries.length === 0 ? (
        <EmptyState message="No journal entries found." />
      ) : (
        <Table
          columns={[
            { Header: 'Date', accessor: 'date' },
            { Header: 'Debit', accessor: 'debit' },
            { Header: 'Credit', accessor: 'credit' },
            { Header: 'Amount', accessor: 'amount' },
            { Header: 'Narration', accessor: 'narration' },
          ]}
          data={entries}
        />
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

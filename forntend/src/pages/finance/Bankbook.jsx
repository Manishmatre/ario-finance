import React, { useState } from "react";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";

export default function Bankbook() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const totalPages = 2;
  const bankbook = [
    { date: '2024-06-01', amount: 5000, bank: 'HDFC', type: 'Deposit', narration: 'Project payment' },
    // ...
  ];
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Bankbook</h2>
      {loading ? (
        <Loader />
      ) : bankbook.length === 0 ? (
        <EmptyState message="No bankbook entries found." />
      ) : (
        <Table
          columns={[
            { Header: 'Date', accessor: 'date' },
            { Header: 'Amount', accessor: 'amount' },
            { Header: 'Bank', accessor: 'bank' },
            { Header: 'Type', accessor: 'type' },
            { Header: 'Narration', accessor: 'narration' },
          ]}
          data={bankbook}
        />
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

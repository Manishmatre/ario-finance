import React, { useState } from "react";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";

export default function VendorLedger() {
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const totalPages = 2;
  const ledger = [
    { date: '2024-06-01', billNo: 'B123', amount: 2000, type: 'Bill' },
    // ...
  ];
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Vendor Ledger</h2>
      {loading ? (
        <Loader />
      ) : ledger.length === 0 ? (
        <EmptyState message="No vendor ledger entries found." />
      ) : (
        <Table
          columns={[
            { Header: 'Date', accessor: 'date' },
            { Header: 'Bill No', accessor: 'billNo' },
            { Header: 'Amount', accessor: 'amount' },
            { Header: 'Type', accessor: 'type' },
          ]}
          data={ledger}
        />
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

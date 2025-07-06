import React, { useState } from "react";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Button from "../../components/ui/Button";

export default function GRNMatching() {
  const [loading, setLoading] = useState(false);
  const grnMatches = [
    { poRef: 'PO123', vendor: 'ABC Steels', grnDate: '2024-06-01', billMatched: true },
    { poRef: 'PO124', vendor: 'XYZ Cement', grnDate: '2024-06-02', billMatched: false },
  ];
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">GRN Matching</h2>
      {loading ? (
        <Loader />
      ) : grnMatches.length === 0 ? (
        <EmptyState message="No GRN matches found." />
      ) : (
        <Table
          columns={[
            { Header: 'PO Ref', accessor: 'poRef' },
            { Header: 'Vendor', accessor: 'vendor' },
            { Header: 'GRN Date', accessor: 'grnDate' },
            { Header: 'Matched', accessor: 'billMatched' },
            { Header: 'Actions', accessor: 'actions' },
          ]}
          data={grnMatches.map(row => ({
            ...row,
            billMatched: row.billMatched ? 'Yes' : 'No',
            actions: row.billMatched ? null : <Button>Match</Button>
          }))}
        />
      )}
    </div>
  );
}

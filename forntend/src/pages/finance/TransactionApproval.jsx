import React, { useState } from "react";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";

export default function TransactionApproval() {
  const [loading, setLoading] = useState(false);
  const [pending, setPending] = useState([
    { id: 1, date: '2025-07-01', amount: 500, narration: 'Pending txn', isApproved: false },
  ]);

  const handleApprove = id => {
    setPending(pending.map(txn => txn.id === id ? { ...txn, isApproved: true } : txn));
  };
  const handleReject = id => {
    setPending(pending.filter(txn => txn.id !== id));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Transaction Approval</h2>
      {loading ? (
        <Loader />
      ) : pending.length === 0 ? (
        <EmptyState message="No pending transactions." />
      ) : (
        <Table
          columns={[
            { Header: 'Date', accessor: 'date' },
            { Header: 'Amount', accessor: 'amount' },
            { Header: 'Narration', accessor: 'narration' },
            { Header: 'Approved', accessor: 'isApproved' },
            { Header: 'Actions', accessor: 'actions' },
          ]}
          data={pending.map(txn => ({
            ...txn,
            isApproved: txn.isApproved ? 'Yes' : 'No',
            actions: txn.isApproved ? null : (
              <div className="flex gap-2">
                <Button onClick={() => handleApprove(txn.id)}>Approve</Button>
                <Button variant="danger" onClick={() => handleReject(txn.id)}>Reject</Button>
              </div>
            )
          }))}
        />
      )}
    </div>
  );
}

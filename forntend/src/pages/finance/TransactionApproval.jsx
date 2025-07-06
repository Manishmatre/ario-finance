import React from "react";
import Table from "../../components/ui/Table";

export default function TransactionApproval() {
  const pending = [
    { id: 1, date: "2025-07-01", amount: 500, narration: "Pending txn", isApproved: false },
  ];
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Transaction Approval</h2>
      <Table
        columns={[
          { Header: 'Date', accessor: 'date' },
          { Header: 'Amount', accessor: 'amount' },
          { Header: 'Narration', accessor: 'narration' },
          { Header: 'Approved', accessor: 'isApproved' },
        ]}
        data={pending}
      />
      {/* Add approve/reject buttons */}
    </div>
  );
}

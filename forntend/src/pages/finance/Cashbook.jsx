import React from "react";
import Table from "../../components/ui/Table";

export default function Cashbook() {
  const cashbook = [
    { date: "2025-07-01", amount: 500, type: "debit", narration: "Site expense" },
  ];
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Cashbook</h2>
      <Table
        columns={[
          { Header: 'Date', accessor: 'date' },
          { Header: 'Amount', accessor: 'amount' },
          { Header: 'Type', accessor: 'type' },
          { Header: 'Narration', accessor: 'narration' },
        ]}
        data={cashbook}
      />
    </div>
  );
}

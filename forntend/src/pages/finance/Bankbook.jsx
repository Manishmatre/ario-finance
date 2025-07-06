import React from "react";
import Table from "../../components/ui/Table";

export default function Bankbook() {
  const bankbook = [
    { date: "2025-07-01", amount: 5000, bank: "SBI", type: "credit", narration: "Payment received" },
  ];
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Bankbook</h2>
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
      {/* Add bank account filter */}
    </div>
  );
}

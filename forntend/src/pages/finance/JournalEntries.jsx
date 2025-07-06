import React from "react";
import Table from "../../components/ui/Table";

export default function JournalEntries() {
  const entries = [
    { date: "2025-07-01", debit: "Expense", credit: "Cash", amount: 1000, narration: "Office supplies" },
  ];
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Journal Entries</h2>
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
      {/* Add filters, pagination, and actions */}
    </div>
  );
}

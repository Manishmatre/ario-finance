import React from "react";
import Table from "../../components/ui/Table";

export default function VendorLedger() {
  const ledger = [
    { date: "2025-07-01", billNo: "B123", amount: 2000, type: "bill" },
  ];
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Vendor Ledger</h2>
      <Table
        columns={[
          { Header: 'Date', accessor: 'date' },
          { Header: 'Bill No', accessor: 'billNo' },
          { Header: 'Amount', accessor: 'amount' },
          { Header: 'Type', accessor: 'type' },
        ]}
        data={ledger}
      />
      {/* Add vendor filter */}
    </div>
  );
}

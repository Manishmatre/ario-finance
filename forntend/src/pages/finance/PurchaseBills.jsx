import React from "react";
import Table from "../../components/ui/Table";

export default function PurchaseBills() {
  const bills = [
    { vendor: "ABC Steels", billNo: "B123", amount: 2000, isPaid: false },
  ];
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Purchase Bills</h2>
      <Table
        columns={[
          { Header: 'Vendor', accessor: 'vendor' },
          { Header: 'Bill No', accessor: 'billNo' },
          { Header: 'Amount', accessor: 'amount' },
          { Header: 'Paid', accessor: 'isPaid' },
        ]}
        data={bills}
      />
      {/* Add upload form and mapping */}
    </div>
  );
}

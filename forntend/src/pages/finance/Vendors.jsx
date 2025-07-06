import React from "react";
import Table from '../../components/ui/Table';

export default function Vendors() {
  const vendors = [
    { name: "ABC Steels", gstNo: "GSTIN123", phone: "1234567890" },
  ];
  const columns = [
    { Header: 'name', accessor: 'name' },
    { Header: 'gstNo', accessor: 'gstNo' },
    { Header: 'phone', accessor: 'phone' }
  ];
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Vendors</h2>
      <Table data={vendors} columns={columns} />
      {/* Add vendor CRUD */}
    </div>
  );
}

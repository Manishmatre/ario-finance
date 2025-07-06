import React from "react";
import Table from "../../components/ui/Table";

export default function PettyCashRegister() {
  const pettyCash = [
    { site: "Site A", opening: 1000, closing: 800, date: "2025-07-01", notes: "All ok" },
  ];
  return (
    <div>
      <h2 className="text-xl font-bold mb-4">Petty Cash Register</h2>
      <Table
        columns={[
          { Header: 'Site', accessor: 'site' },
          { Header: 'Opening', accessor: 'opening' },
          { Header: 'Closing', accessor: 'closing' },
          { Header: 'Date', accessor: 'date' },
          { Header: 'Notes', accessor: 'notes' },
        ]}
        data={pettyCash}
      />
      {/* Add site filter and CRUD */}
    </div>
  );
}

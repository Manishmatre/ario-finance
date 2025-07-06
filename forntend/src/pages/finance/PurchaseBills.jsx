import React, { useState } from "react";
import Table from "../../components/ui/Table";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";

export default function PurchaseBills() {
  const [bills, setBills] = useState([
    { id: 1, vendor: "ABC Steels", billNo: "B123", amount: 2000, isPaid: false },
  ]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const columns = [
    { Header: 'Vendor', accessor: 'vendor' },
    { Header: 'Bill No', accessor: 'billNo' },
    { Header: 'Amount', accessor: 'amount' },
    { Header: 'Paid', accessor: 'isPaid' },
    { Header: 'Actions', accessor: 'actions' },
  ];

  const handleUpload = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setBills([...bills, { id: bills.length + 1, vendor: "XYZ Cement", billNo: "B124", amount: 1500, isPaid: false }]);
      setLoading(false);
      setSuccess(true);
      setModalOpen(false);
    }, 1000);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Purchase Bills</h2>
      <Button className="mb-4" onClick={() => setModalOpen(true)}>+ Upload Bill</Button>
      {loading && <Loader />}
      {!loading && bills.length === 0 && <EmptyState message="No bills found." />}
      {!loading && bills.length > 0 && (
        <Table
          data={bills.map(bill => ({ ...bill, actions: <Button variant="danger">Delete</Button> }))}
          columns={columns}
        />
      )}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 min-w-[300px] shadow-lg">
            <h3 className="text-lg font-bold mb-2">Upload Bill</h3>
            <form onSubmit={handleUpload} className="space-y-3">
              <div>
                <label className="block mb-1">Vendor</label>
                <input className="border rounded px-2 py-1 w-full" required />
              </div>
              <div>
                <label className="block mb-1">Bill No</label>
                <input className="border rounded px-2 py-1 w-full" required />
              </div>
              <div>
                <label className="block mb-1">Amount</label>
                <input type="number" step="0.01" className="border rounded px-2 py-1 w-full" required />
              </div>
    <div>
                <label className="block mb-1">File (PDF/JPG)</label>
                <input type="file" className="border rounded px-2 py-1 w-full" accept=".pdf,.jpg,.jpeg,.png" required />
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit">Upload</Button>
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              </div>
            </form>
            {success && <div className="text-green-600 mt-2">Bill uploaded!</div>}
          </div>
        </div>
      )}
    </div>
  );
}

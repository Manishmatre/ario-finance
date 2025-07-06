import React, { useState } from "react";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";

export default function VendorPayments() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [selectedBill, setSelectedBill] = useState("");
  const bills = [
    { id: 1, billNo: "B123", vendor: "ABC Steels", amount: 2000, isPaid: false },
    { id: 2, billNo: "B124", vendor: "XYZ Cement", amount: 1500, isPaid: false },
  ];
  const unpaidBills = bills.filter(b => !b.isPaid);

  const handlePay = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Vendor Payments</h2>
      {loading && <Loader />}
      {success && <div className="text-green-600 mb-4">Payment successful!</div>}
      <form onSubmit={handlePay} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block mb-1">Select Unpaid Bill</label>
          <select className="border rounded px-2 py-1 w-full" value={selectedBill} onChange={e => setSelectedBill(e.target.value)} required>
            <option value="">Select a bill</option>
            {unpaidBills.map(bill => (
              <option key={bill.id} value={bill.id}>{bill.billNo} - {bill.vendor} - ₹{bill.amount}</option>
            ))}
          </select>
        </div>
        <Button type="submit" className="w-full" disabled={loading || !selectedBill}>Pay Bill</Button>
      </form>
      {!loading && unpaidBills.length === 0 && <EmptyState message="No unpaid bills." />}
    </div>
  );
}

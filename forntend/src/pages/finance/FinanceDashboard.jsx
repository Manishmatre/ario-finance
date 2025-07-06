import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../utils/axios';

export default function FinanceDashboard() {
  const [kpis, setKpis] = useState({});
  const { token } = useAuth();

  useEffect(() => {
    // For demo, just set dummy data. Replace with real API call.
    setKpis({ cashInHand: 10000, budgetVsActual: 0.9, payables: 5000, receivables: 8000 });
    // Example real API call:
    // axios.get('/api/finance/dashboard/kpis', { headers: { Authorization: `Bearer ${token}` } })
    //   .then(res => setKpis(res.data))
    //   .catch(() => {});
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Finance Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card title="Cash In Hand" value={`₹${kpis.cashInHand ?? 0}`} />
        <Card title="Budget vs Actual" value={`${(kpis.budgetVsActual ?? 0) * 100}%`} />
        <Card title="Payables" value={`₹${kpis.payables ?? 0}`} />
        <Card title="Receivables" value={`₹${kpis.receivables ?? 0}`} />
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Select from "../../components/ui/Select";
import axios from "../../utils/axiosInstance";
import { useAuth } from "../../contexts/AuthContext";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";

export default function LedgerView() {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const totalPages = 2;

  // Fetch accounts on mount
  useEffect(() => {
    setLoading(true);
    axios
      .get("/api/finance/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAccounts(res.data.accounts || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load accounts");
        setLoading(false);
      });
  }, [token]);

  // Fetch ledger entries when account changes
  useEffect(() => {
    if (!selectedAccount) return;
    setLoading(true);
    axios
      .get(`/api/finance/accounts/${selectedAccount}/ledger`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setEntries(res.data.entries || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load ledger entries");
        setLoading(false);
      });
  }, [selectedAccount, token]);

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Ledger View</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <div className="mb-4 max-w-xs">
        <label className="block mb-1">Select Account</label>
        <Select
          options={accounts.map((a) => ({ value: a._id, label: `${a.name} (${a.code})` }))}
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
        />
      </div>
      {loading ? (
        <Loader />
      ) : entries.length === 0 ? (
        <EmptyState message="No ledger entries found." />
      ) : (
        <Table
          columns={[
            { Header: 'Date', accessor: 'date' },
            { Header: 'Type', accessor: 'type' },
            { Header: 'Amount', accessor: 'amount' },
            { Header: 'Narration', accessor: 'narration' },
          ]}
          data={entries}
        />
      )}
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

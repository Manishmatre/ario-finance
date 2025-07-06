import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MoneyInput } from "../../components/ui/MoneyInput";
import { Select } from "../../components/ui/Select";
import axios from "../../utils/axiosInstance";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";

export default function AddTransaction() {
  const { token } = useAuth();
  const { register, handleSubmit, reset } = useForm();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch accounts for dropdowns
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
      .catch(() => {
        setError("Failed to load accounts");
        setLoading(false);
      });
  }, [token]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      await axios.post(
        "/api/finance/transactions",
        {
          ...data,
          amount: Number(data.amount),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Transaction added successfully");
      reset();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to add transaction");
      toast.error(err.response?.data?.error || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Add Transaction</h2>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-md">
        <div>
          <label className="block mb-1">Debit Account</label>
          <Select
            options={accounts.map((a) => ({ value: a._id, label: `${a.name} (${a.code})` }))}
            {...register("debitAccount", { required: true })}
          />
        </div>
        <div>
          <label className="block mb-1">Credit Account</label>
          <Select
            options={accounts.map((a) => ({ value: a._id, label: `${a.name} (${a.code})` }))}
            {...register("creditAccount", { required: true })}
          />
        </div>
        <div>
          <label className="block mb-1">Amount</label>
          <MoneyInput {...register("amount", { required: true })} />
        </div>
        <div>
          <label className="block mb-1">Date</label>
          <input type="date" className="border rounded px-2 py-1" {...register("date", { required: true })} />
        </div>
        <div>
          <label className="block mb-1">Narration</label>
          <input className="border rounded px-2 py-1 w-full" {...register("narration")} />
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          type="submit"
          disabled={loading}
        >
          {loading ? "Adding..." : "Add Transaction"}
        </button>
      </form>
    </div>
  );
}

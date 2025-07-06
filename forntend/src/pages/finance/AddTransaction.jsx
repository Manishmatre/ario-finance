import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { MoneyInput } from "../../components/ui/MoneyInput";
import Select from "../../components/ui/Select";
import axios from "../../utils/axiosInstance";
import { useAuth } from "../../contexts/AuthContext";
import { toast } from "react-toastify";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";

export default function AddTransaction() {
  const { token } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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
        setLoading(false);
      });
  }, [token]);

  const onSubmit = async (data) => {
    setLoading(true);
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
      setSuccess(true);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Add Transaction</h2>
      {loading && <Loader />}
      {success && <div className="text-green-600 mb-4">Transaction added!</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block mb-1">Debit Account</label>
          <Select
            options={accounts.map((a) => ({ value: a._id, label: `${a.name} (${a.code})` }))}
            {...register("debitAccount", { required: true })}
          />
          {errors.debitAccount && <span className="text-red-500 text-sm">Required</span>}
        </div>
        <div>
          <label className="block mb-1">Credit Account</label>
          <Select
            options={accounts.map((a) => ({ value: a._id, label: `${a.name} (${a.code})` }))}
            {...register("creditAccount", { required: true })}
          />
          {errors.creditAccount && <span className="text-red-500 text-sm">Required</span>}
        </div>
        <div>
          <label className="block mb-1">Amount</label>
          <MoneyInput {...register("amount", { required: true })} />
          {errors.amount && <span className="text-red-500 text-sm">Required</span>}
        </div>
        <div>
          <label className="block mb-1">Date</label>
          <input type="date" className="border rounded px-2 py-1 w-full" {...register("date", { required: true })} />
          {errors.date && <span className="text-red-500 text-sm">Required</span>}
        </div>
        <div>
          <label className="block mb-1">Cost Code</label>
          <input className="border rounded px-2 py-1 w-full" {...register("costCode")} />
        </div>
        <div>
          <label className="block mb-1">Narration</label>
          <input className="border rounded px-2 py-1 w-full" {...register("narration")} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>Add Transaction</Button>
      </form>
    </div>
  );
}

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";

export default function EditTransaction() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      debitAccount: "Cash",
      creditAccount: "Revenue",
      amount: 1000,
      date: "2024-07-01",
      costCode: "",
      narration: "Edit this transaction"
    }
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = data => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      reset(data);
    }, 1000);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Edit Transaction</h2>
      {loading && <Loader />}
      {success && <div className="text-green-600 mb-4">Transaction updated!</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block mb-1">Debit Account</label>
          <input className="border rounded px-2 py-1 w-full" {...register("debitAccount", { required: true })} />
          {errors.debitAccount && <span className="text-red-500 text-sm">Required</span>}
        </div>
        <div>
          <label className="block mb-1">Credit Account</label>
          <input className="border rounded px-2 py-1 w-full" {...register("creditAccount", { required: true })} />
          {errors.creditAccount && <span className="text-red-500 text-sm">Required</span>}
        </div>
        <div>
          <label className="block mb-1">Amount</label>
          <input type="number" step="0.01" className="border rounded px-2 py-1 w-full" {...register("amount", { required: true })} />
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
        <Button type="submit" className="w-full" disabled={loading}>Update Transaction</Button>
      </form>
    </div>
  );
}

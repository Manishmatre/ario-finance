import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";

export default function AdvanceToVendor() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = data => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      reset();
    }, 1000);
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-4">Advance To Vendor</h2>
      {loading && <Loader />}
      {success && <div className="text-green-600 mb-4">Advance recorded!</div>}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white p-6 rounded shadow">
        <div>
          <label className="block mb-1">Vendor</label>
          <input className="border rounded px-2 py-1 w-full" {...register("vendor", { required: true })} />
          {errors.vendor && <span className="text-red-500 text-sm">Required</span>}
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
        <Button type="submit" className="w-full" disabled={loading}>Record Advance</Button>
      </form>
    </div>
  );
}

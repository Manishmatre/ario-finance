import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Button from "../../components/ui/Button";
import Loader from "../../components/ui/Loader";
import { useParams, Link } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = data => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded shadow max-w-sm w-full space-y-6">
        <h1 className="text-2xl font-bold mb-2 text-center">Reset Password</h1>
        {success && <div className="text-green-600 text-center">Password reset successful!</div>}
        <div>
          <label className="block mb-1">New Password</label>
          <input type="password" className="border rounded px-3 py-2 w-full" {...register("password", { required: true })} />
          {errors.password && <span className="text-red-500 text-sm">Required</span>}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>{loading ? <Loader /> : "Reset Password"}</Button>
        <div className="flex flex-col items-center gap-2 mt-4">
          <Link to="/auth/login" className="text-blue-600 hover:underline text-sm">Back to Login</Link>
          <span className="text-gray-500 text-sm">Don't have an account? <Link to="/auth/register" className="text-blue-600 hover:underline">Register</Link></span>
        </div>
      </form>
    </div>
  );
} 
import React from "react";
import { useForm } from "react-hook-form";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import { Link } from "react-router-dom";

export default function RegisterStep1({ onNext }) {
  const { register, handleSubmit, formState: { errors } } = useForm();
  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4 p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <div className="text-center">
        <img src="/logo.svg" alt="SSK Finance" className="h-10 mb-2" />
        <h2 className="text-xl font-bold tracking-tight text-blue-700">SSK Finance Registration</h2>
        <p className="text-sm text-gray-600 mt-1">Create your account to get started</p>
      </div>
      <Input
        label="Admin Name"
        error={errors.name && "Required"}
        {...register("name", { required: true })}
        autoFocus
        autoComplete="name"
      />
      <Input
        label="Admin Email"
        type="email"
        error={errors.email && "Required"}
        {...register("email", { required: true })}
        autoComplete="email"
      />
      <Input
        label="Phone Number"
        error={errors.phone && "Required"}
        {...register("phone", { required: true, pattern: /^[0-9]{10,15}$/ })}
        autoComplete="tel"
        placeholder="e.g. 9876543210"
      />
      <Input
        label="Password"
        type="password"
        error={errors.password && "Min 6 chars"}
        {...register("password", { required: true, minLength: 6 })}
        showPasswordToggle
        autoComplete="new-password"
      />
      <Button type="submit" className="w-full mt-2">Next: Company Info</Button>
      <div className="flex justify-center mt-2">
        <Link to="/auth/login" className="text-blue-600 hover:underline text-sm">Back to Login</Link>
      </div>
    </form>
  );
} 
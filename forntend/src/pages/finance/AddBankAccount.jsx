import React, { useState } from "react";
import { useForm } from "react-hook-form";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import PageHeading from "../../components/ui/PageHeading";

const ACCOUNT_TYPES = [
  { value: '', label: 'Select type' },
  { value: 'Current', label: 'Current' },
  { value: 'Savings', label: 'Savings' },
  { value: 'Other', label: 'Other' },
];
const STATUS_OPTIONS = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

export default function AddBankAccount() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (data) => {
    setSuccess(true);
    setTimeout(() => {
      navigate('/finance/accounts');
    }, 1200);
    reset();
  };

  return (
    <div className="px-2 sm:px-4 py-6 max-w-2xl mx-auto">
      <PageHeading
        title="Add Bank/Account"
        subtitle="Enter account details"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Chart of Accounts", to: "/finance/accounts" },
          { label: "Add Account" }
        ]}
      />
      <div className="bg-white rounded-lg shadow-md p-6">
        {success && <div className="text-green-600 text-center font-medium mb-2">Account added successfully!</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Bank Name"
            error={errors.bankName && "Required"}
            {...register("bankName", { required: true })}
            autoFocus
          />
          <div>
            <label className="block mb-1 font-medium">Type</label>
            <Select
              options={ACCOUNT_TYPES}
              {...register("type", { required: true })}
              error={errors.type}
            />
            {errors.type && <div className="text-red-500 text-xs mt-1">Required</div>}
          </div>
          <Input
            label="Account Holder"
            error={errors.accountHolder && "Required"}
            {...register("accountHolder", { required: true })}
          />
          <Input
            label="Account Number"
            error={errors.bankAccountNo && "Required"}
            {...register("bankAccountNo", { required: true })}
          />
          <Input
            label="IFSC Code"
            error={errors.ifsc && "Required"}
            {...register("ifsc", { required: true })}
          />
          <Input
            label="Branch Name"
            error={errors.branchName && "Required"}
            {...register("branchName", { required: true })}
          />
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <Select
              options={STATUS_OPTIONS}
              {...register("status", { required: true })}
              error={errors.status}
            />
            {errors.status && <div className="text-red-500 text-xs mt-1">Required</div>}
          </div>
          <Button type="submit" className="w-full mt-2">Add Account</Button>
        </form>
      </div>
    </div>
  );
} 
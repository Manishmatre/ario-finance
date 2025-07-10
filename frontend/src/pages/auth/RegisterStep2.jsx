import React from "react";
import { useForm, FormProvider } from "react-hook-form";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Select from "../../components/ui/Select";
import { Link } from "react-router-dom";

const COMPANY_TYPES = [
  { value: "Private Limited", label: "Private Limited" },
  { value: "Partnership", label: "Partnership" },
  { value: "Proprietorship", label: "Proprietorship" },
  { value: "Government", label: "Government" },
  { value: "Other", label: "Other" },
];

export default function RegisterStep2({ onBack, onSubmit, defaultValues }) {
  const methods = useForm({ defaultValues });
  const { handleSubmit, formState: { errors } } = methods;
  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="text-sm text-gray-500 mb-2">Step 2: Company Info</div>
        <Input
          label="Company Name"
          error={errors.name && "Required"}
          {...methods.register("name", { required: true })}
          autoFocus
          autoComplete="organization"
        />
        <Select
          label="Company Type"
          error={errors.companyType && "Required"}
          options={COMPANY_TYPES}
          {...methods.register("companyType", { required: true })}
        />
        <Input
          label="PAN Number"
          error={errors.pan && "Required"}
          {...methods.register("pan", { required: true, pattern: /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/ })}
          autoComplete="off"
          placeholder="ABCDE1234F"
        />
        <Input
          label="GST No (optional)"
          {...methods.register("gstNo")}
          autoComplete="off"
        />
       <Input
          label="Address Line 1"
          error={errors.addressLine1 && "Required"}
          {...methods.register("addressLine1", { required: true })}
          autoComplete="address-line1"
        />
        <Input
          label="Address Line 2"
          {...methods.register("addressLine2")}
          autoComplete="address-line2"
        />
        <div className="flex gap-2">
          <Input
            label="City"
            error={errors.city && "Required"}
            {...methods.register("city", { required: true })}
            autoComplete="address-level2"
          />
          <Input
            label="State"
            error={errors.state && "Required"}
            {...methods.register("state", { required: true })}
            autoComplete="address-level1"
          />
        </div>
        <Input
          label="Pincode"
          error={errors.pincode && "Required"}
          {...methods.register("pincode", { required: true, pattern: /^[0-9]{5,10}$/ })}
          autoComplete="postal-code"
        />
        <div className="flex gap-2 mt-2">
          <Button type="button" variant="secondary" onClick={onBack}>Back</Button>
          <Button type="submit">Register Company</Button>
        </div>
        <div className="flex justify-center mt-2">
          <Link to="/auth/login" className="text-blue-600 hover:underline text-sm">Back to Login</Link>
        </div>
      </form>
    </FormProvider>
  );
} 
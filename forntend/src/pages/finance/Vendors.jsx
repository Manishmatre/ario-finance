import React, { useState } from "react";
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import { useForm } from 'react-hook-form';

export default function Vendors() {
  const [vendors, setVendors] = useState([
    { id: 1, name: 'ABC Steels', gstNo: 'GSTIN123', phone: '1234567890' }
    // ...more vendors
  ]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const columns = [
    { Header: 'Name', accessor: 'name' },
    { Header: 'GST No', accessor: 'gstNo' },
    { Header: 'Phone', accessor: 'phone' },
    { Header: 'Actions', accessor: 'actions' }
  ];

  const onSubmit = data => {
    setLoading(true);
    setTimeout(() => {
      setVendors([...vendors, { ...data, id: vendors.length + 1 }]);
      setLoading(false);
      setModalOpen(false);
      reset();
    }, 800);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Vendors</h2>
      <Button className="mb-4" onClick={() => setModalOpen(true)}>+ Add Vendor</Button>
      {loading && <Loader />}
      {!loading && vendors.length === 0 && <EmptyState message="No vendors found." />}
      {!loading && vendors.length > 0 && (
        <Table data={vendors.map(v => ({ ...v, actions: <Button variant="danger">Delete</Button> }))} columns={columns} />
      )}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded p-6 min-w-[300px] shadow-lg">
            <h3 className="text-lg font-bold mb-2">Add Vendor</h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
              <div>
                <label className="block mb-1">Name</label>
                <input className="border rounded px-2 py-1 w-full" {...register('name', { required: true })} />
                {errors.name && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div>
                <label className="block mb-1">GST No</label>
                <input className="border rounded px-2 py-1 w-full" {...register('gstNo', { required: true })} />
                {errors.gstNo && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div>
                <label className="block mb-1">Phone</label>
                <input className="border rounded px-2 py-1 w-full" {...register('phone', { required: true })} />
                {errors.phone && <span className="text-red-500 text-sm">Required</span>}
              </div>
              <div className="flex gap-2 mt-4">
                <Button type="submit">Add</Button>
                <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

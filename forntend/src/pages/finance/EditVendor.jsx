import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';

export default function EditVendor() {
  const navigate = useNavigate();
  const location = useLocation();
  const vendor = location.state?.vendor || {
    name: '', gstNo: '', phone: '', email: '', address: '', category: '', balance: '', status: 'Active'
  };
  const [form, setForm] = useState(vendor);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      alert('Vendor updated (mock)!');
      setLoading(false);
      navigate('/finance/vendors');
    }, 800);
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading title="Edit Vendor" breadcrumbs={[
        { label: 'Vendors', to: '/finance/vendors' },
        { label: 'Edit Vendor' }
      ]} />
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6 p-6 max-w-xl mx-auto">
          <Input label="Name" name="name" value={form.name} onChange={handleChange} required />
          <Input label="GST No" name="gstNo" value={form.gstNo} onChange={handleChange} required />
          <Input label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
          <Input label="Email" name="email" value={form.email} onChange={handleChange} required />
          <Input label="Address" name="address" value={form.address} onChange={handleChange} required />
          <Input label="Category" name="category" value={form.category} onChange={handleChange} required />
          <Input label="Balance" name="balance" value={form.balance} onChange={handleChange} type="number" min="0" required />
          <select name="status" value={form.status} onChange={handleChange} className="border rounded px-3 py-2 w-full">
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => navigate('/finance/vendors')}>Cancel</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white" disabled={loading}>
              {loading ? 'Saving...' : 'Update Vendor'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
} 
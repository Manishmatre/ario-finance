import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import PageHeading from '../../components/ui/PageHeading';
import Card from '../../components/ui/Card';
import axiosInstance from '../../utils/axiosInstance';

export default function ViewVendor() {
  const location = useLocation();
  const navigate = useNavigate();
  const [vendor, setVendor] = useState(location.state?.vendor || null);
  const [loading, setLoading] = useState(!location.state?.vendor);
  const [error, setError] = useState(null);

  // Get vendor ID from state or query string
  const getVendorId = () => {
    if (location.state?.vendor?._id || location.state?.vendor?.id) return location.state.vendor._id || location.state.vendor.id;
    const params = new URLSearchParams(location.search);
    return params.get('id');
  };

  useEffect(() => {
    if (!vendor) {
      const id = getVendorId();
      if (!id) {
        setError('No vendor ID provided');
        setLoading(false);
        return;
      }
      setLoading(true);
      axiosInstance.get(`/api/finance/vendors/${id}`)
        .then(res => {
          setVendor(res.data);
          setLoading(false);
        })
        .catch(err => {
          setError((err.response?.data?.error || err.message || 'Failed to fetch vendor') + (err.response ? `\nRaw: ${JSON.stringify(err.response.data)}` : ''));
          setLoading(false);
        });
    }
  }, []);

  const isVendorEmpty = !vendor || (typeof vendor === 'object' && Object.keys(vendor).length === 0);

  // Loading state
  if (loading) return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading title="Vendor Details" breadcrumbs={[
        { label: 'Vendors', to: '/finance/vendors' },
        { label: 'View Vendor' }
      ]} />
      <Card>
        <div className="p-6 max-w-xl mx-auto text-center text-gray-500">
          <div className="mb-2">Loading vendor details...</div>
        </div>
      </Card>
    </div>
  );

  // Error or not found state
  if (error || isVendorEmpty || !vendor.name) return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading title="Vendor Details" breadcrumbs={[
        { label: 'Vendors', to: '/finance/vendors' },
        { label: 'View Vendor' }
      ]} />
      <Card>
        <div className="p-6 max-w-xl mx-auto text-center text-gray-500">
          <div className="mb-2 text-red-500 font-semibold">Vendor not found or no details available.</div>
          {error && <div className="mb-2 text-red-400">Error: {error.toString()}</div>}
          <div className="mb-2">Vendor object:<pre className="bg-gray-100 text-xs p-2 rounded text-left overflow-x-auto">{JSON.stringify(vendor, null, 2)}</pre></div>
          <div className="mb-2">Loading: {loading ? 'true' : 'false'}</div>
          <div className="flex justify-center mt-6 gap-2">
            <Button variant="outline" onClick={() => navigate('/finance/vendors')}>Back to Vendors</Button>
            <Button variant="primary" onClick={() => window.location.reload()}>Reload</Button>
          </div>
        </div>
      </Card>
    </div>
  );

  // Success state
  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading title="Vendor Details" breadcrumbs={[
        { label: 'Vendors', to: '/finance/vendors' },
        { label: 'View Vendor' }
      ]} />
      <Card>
        <div className="p-6 max-w-xl mx-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div><strong>ID:</strong> {vendor._id || vendor.id}</div>
            <div><strong>Name:</strong> {vendor.name}</div>
            <div><strong>GST No:</strong> {vendor.gstNo}</div>
            <div><strong>Phone:</strong> {vendor.phone}</div>
            <div className="md:col-span-2"><strong>Address:</strong> {vendor.address}</div>
            {vendor.createdBy && <div><strong>Created By:</strong> {vendor.createdBy}</div>}
            {vendor.createdAt && <div><strong>Created At:</strong> {new Date(vendor.createdAt).toLocaleString()}</div>}
            {vendor.updatedAt && <div><strong>Updated At:</strong> {new Date(vendor.updatedAt).toLocaleString()}</div>}
          </div>
          <div className="flex justify-end mt-6 gap-2">
            <Button variant="outline" onClick={() => navigate('/finance/vendors')}>Back to Vendors</Button>
            <Button variant="primary" onClick={() => window.location.reload()}>Reload</Button>
          </div>
          <pre className="bg-gray-100 text-xs p-2 rounded mt-4 text-left overflow-x-auto">{JSON.stringify(vendor, null, 2)}</pre>
        </div>
      </Card>
    </div>
  );
} 
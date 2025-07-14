import React, { useState, useEffect } from "react";
import Table from "../../components/ui/Table";
import Loader from "../../components/ui/Loader";
import EmptyState from "../../components/ui/EmptyState";
import Pagination from "../../components/ui/Pagination";
import PageHeading from "../../components/ui/PageHeading";
import axiosInstance from '../../utils/axiosInstance';
import Button from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function PettyCashRegister() {
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pettyCash, setPettyCash] = useState([]);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ siteCode: '', opening: '', closing: '', date: '', notes: '' });
  const totalPages = Math.max(1, Math.ceil(pettyCash.length / 10));

  const fetchPettyCash = () => {
    setLoading(true);
    setError('');
    axiosInstance.get('/api/finance/petty-cash')
      .then(res => setPettyCash(res.data || []))
      .catch(() => setError('Failed to fetch petty cash'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPettyCash();
  }, []);

  const handleAdd = () => {
    setForm({ siteCode: '', opening: '', closing: '', date: '', notes: '' });
    setEditItem(null);
    setShowModal(true);
  };
  const handleEdit = (item) => {
    setForm({ ...item });
    setEditItem(item);
    setShowModal(true);
  };
  const handleDelete = async (item) => {
    if (!window.confirm('Delete this entry?')) return;
    setLoading(true);
    setError('');
    try {
      await axiosInstance.delete(`/api/finance/petty-cash/${item._id}`);
      fetchPettyCash();
    } catch {
      setError('Failed to delete entry');
    } finally {
      setLoading(false);
    }
  };
  const handleModalSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (editItem && editItem._id) {
        await axiosInstance.patch(`/api/finance/petty-cash/${editItem._id}`, form);
      } else {
        await axiosInstance.post('/api/finance/petty-cash', form);
      }
      setShowModal(false);
      fetchPettyCash();
    } catch {
      setError('Failed to save entry');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { Header: 'Site Code', accessor: 'siteCode' },
    { Header: 'Opening', accessor: 'opening', Cell: ({ value }) => ` ₹${value?.toLocaleString()}` },
    { Header: 'Closing', accessor: 'closing', Cell: ({ value }) => ` ₹${value?.toLocaleString()}` },
    { Header: 'Date', accessor: 'date', Cell: ({ value }) => value ? new Date(value).toLocaleDateString('en-IN') : '' },
    { Header: 'Notes', accessor: 'notes' },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => (
      <div className="flex gap-2">
        <Button size="sm" variant="primary" onClick={() => handleEdit(row.original)}>Edit</Button>
        <Button size="sm" variant="danger" onClick={() => handleDelete(row.original)}>Delete</Button>
      </div>
    ) },
  ];

  if (loading) return <Loader />;

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Petty Cash Register"
        subtitle="Manage petty cash across all sites and locations"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Accounts", to: "/finance/accounts" },
          { label: "Petty Cash Register" }
        ]}
      />
      <div className="flex justify-end mb-2">
        <Button variant="primary" onClick={handleAdd}>Add Petty Cash</Button>
      </div>
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Site-wise Petty Cash Summary</h3>
        </div>
        {pettyCash.length === 0 ? (
          <EmptyState message="No petty cash entries found." />
        ) : (
          <>
            <Table columns={columns} data={pettyCash.slice((page-1)*10, page*10)} />
            <div className="p-4 border-t border-gray-100">
              <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
          </>
        )}
      </div>
      <Modal open={showModal} onClose={() => setShowModal(false)} title={editItem ? 'Edit Petty Cash' : 'Add Petty Cash'}>
        <form className="space-y-3" onSubmit={handleModalSave}>
          <div>
            <label>Site Code</label>
            <input className="border rounded px-2 py-1 w-full" value={form.siteCode} onChange={e => setForm({ ...form, siteCode: e.target.value })} required />
          </div>
          <div>
            <label>Opening</label>
            <input type="number" className="border rounded px-2 py-1 w-full" value={form.opening} onChange={e => setForm({ ...form, opening: e.target.value })} required />
          </div>
          <div>
            <label>Closing</label>
            <input type="number" className="border rounded px-2 py-1 w-full" value={form.closing} onChange={e => setForm({ ...form, closing: e.target.value })} required />
          </div>
          <div>
            <label>Date</label>
            <input type="date" className="border rounded px-2 py-1 w-full" value={form.date ? form.date.slice(0,10) : ''} onChange={e => setForm({ ...form, date: e.target.value })} required />
          </div>
          <div>
            <label>Notes</label>
            <input className="border rounded px-2 py-1 w-full" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" type="submit">Save</Button>
            <Button variant="secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

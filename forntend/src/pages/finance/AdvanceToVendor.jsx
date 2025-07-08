import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import Pagination from '../../components/ui/Pagination';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import PageHeading from "../../components/ui/PageHeading";
import Card from "../../components/ui/Card";
import { FiDollarSign, FiUsers, FiCalendar, FiTrendingUp } from "react-icons/fi";
import Select from "../../components/ui/Select";

const PAGE_SIZE = 10;

const AdvanceToVendor = () => {
  const [advances, setAdvances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editAdvance, setEditAdvance] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { register, handleSubmit, reset, setValue } = useForm();

  const fetchAdvances = async () => {
    setLoading(true);
    try {
      const res = await axiosInstance.get('/api/finance/vendors/advances');
      setAdvances(res.data);
      setTotal(res.data.length);
    } catch (e) {
      setAdvances([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAdvances();
  }, []);

  const onSubmit = async (data) => {
    try {
      if (editAdvance) {
        await axiosInstance.put(`/api/finance/vendors/advances/${editAdvance._id}`, data);
      } else {
        await axiosInstance.post('/api/finance/vendors/advances', data);
      }
      setModalOpen(false);
      setEditAdvance(null);
      reset();
      fetchAdvances();
    } catch {}
  };

  const handleEdit = (advance) => {
    setEditAdvance(advance);
    setValue('vendorId', advance.vendorId);
    setValue('amount', advance.amount);
    setValue('date', advance.date?.slice(0, 10));
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this advance?')) return;
    await axiosInstance.delete(`/api/finance/vendors/advances/${id}`);
    fetchAdvances();
  };

  const paginated = advances.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const columns = [
    { 
      Header: 'Reference', 
      accessor: 'reference',
      Cell: ({ value }) => (
        <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
          {value}
        </span>
      )
    },
    { 
      Header: 'Vendor', 
      accessor: 'vendor',
      Cell: ({ value }) => (
        <div className="font-medium">{value}</div>
      )
    },
    { 
      Header: 'Amount', 
      accessor: 'amount',
      Cell: ({ value }) => `₹${value.toLocaleString()}`
    },
    { 
      Header: 'Date', 
      accessor: 'date',
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
    },
    { 
      Header: 'Purpose', 
      accessor: 'purpose',
      Cell: ({ value }) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    { 
      Header: 'Expected Return', 
      accessor: 'expectedReturn',
      Cell: ({ value }) => new Date(value).toLocaleDateString('en-IN')
    },
    { 
      Header: 'Status', 
      accessor: 'status',
      Cell: ({ value }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Settled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Advance To Vendor"
        subtitle="Manage vendor advances and track settlements"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Payables", to: "/finance/payables" },
          { label: "Advance To Vendor" }
        ]}
      />

      {/* Add Advance Button */}
      <div className="flex justify-between items-center">
        <Button onClick={() => { setModalOpen(true); setEditAdvance(null); reset(); }} icon={<FiPlus />}>Add Advance</Button>
      </div>

      {/* Advance History Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Advance History</h3>
        </div>
        {loading ? <Loader /> : advances.length === 0 ? <EmptyState text="No advances found." /> : (
          <>
            <Table
              columns={[{ label: 'Vendor ID', key: 'vendorId' }, { label: 'Amount', key: 'amount' }, { label: 'Date', key: 'date' }, { label: 'Cleared', key: 'cleared' }, { label: 'Actions', key: 'actions' }]}
              data={paginated.map(a => ({
                ...a,
                date: a.date ? a.date.slice(0, 10) : '',
                actions: (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(a)} icon={<FiEdit />} />
                    <Button size="sm" variant="danger" onClick={() => handleDelete(a._id)} icon={<FiTrash2 />} />
                  </div>
                )
              }))}
            />
            <Pagination
              page={page}
              pageSize={PAGE_SIZE}
              total={total}
              onPageChange={setPage}
            />
          </>
        )}
      </div>

      {/* Add Advance Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditAdvance(null); reset(); }} title={editAdvance ? 'Edit Advance' : 'Add Advance'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1">Vendor ID</label>
            <input className="input" {...register('vendorId', { required: true })} />
          </div>
          <div>
            <label className="block mb-1">Amount</label>
            <input className="input" type="number" step="0.01" {...register('amount', { required: true })} />
          </div>
          <div>
            <label className="block mb-1">Date</label>
            <input className="input" type="date" {...register('date', { required: true })} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { setModalOpen(false); setEditAdvance(null); reset(); }}>Cancel</Button>
            <Button type="submit">{editAdvance ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdvanceToVendor;

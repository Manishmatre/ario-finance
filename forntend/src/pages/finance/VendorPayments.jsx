import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance';
import Loader from '../../components/ui/Loader';
import EmptyState from '../../components/ui/EmptyState';
import Table from '../../components/ui/Table';
import Pagination from '../../components/ui/Pagination';
import Select from '../../components/ui/Select';
import { Modal } from '../../components/ui/Modal';
import Button from '../../components/ui/Button';
import { useForm } from 'react-hook-form';
import { FiPlus } from 'react-icons/fi';

const PAGE_SIZE = 10;

const VendorPayments = () => {
  const [vendors, setVendors] = useState([]);
  const [selectedVendor, setSelectedVendor] = useState('');
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { register, handleSubmit, reset } = useForm();

  useEffect(() => {
    axiosInstance.get('/api/finance/vendors').then(res => setVendors(res.data));
  }, []);

  useEffect(() => {
    if (!selectedVendor) return;
    setLoading(true);
    axiosInstance.get(`/transactions?accountId=${selectedVendor}`).then(res => {
      // Filter only payment transactions (credit to vendor)
      setPayments(res.data.filter(t => t.amount < 0 || t.creditAccount === selectedVendor));
      setTotal(res.data.length);
      setLoading(false);
    }).catch(() => {
      setPayments([]);
      setTotal(0);
      setLoading(false);
    });
  }, [selectedVendor]);

  const onSubmit = async (data) => {
    try {
      await axiosInstance.post('/transactions', {
        date: data.date,
        debitAccount: data.debitAccount,
        creditAccount: selectedVendor,
        amount: data.amount,
        narration: data.narration,
      });
      setModalOpen(false);
      reset();
      setTimeout(() => {
        // refetch
        axiosInstance.get(`/transactions?accountId=${selectedVendor}`).then(res => {
          setPayments(res.data.filter(t => t.amount < 0 || t.creditAccount === selectedVendor));
          setTotal(res.data.length);
        });
      }, 500);
    } catch {}
  };

  const paginated = payments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Vendor Payments</h1>
        <Button icon={<FiPlus />} onClick={() => setModalOpen(true)} disabled={!selectedVendor}>Add Payment</Button>
      </div>
      <div className="mb-4">
        <Select
          options={vendors.map(v => ({ value: v._id, label: v.name }))}
          value={selectedVendor}
          onChange={e => { setSelectedVendor(e.target.value); setPage(1); }}
          placeholder="Select Vendor"
          className="w-64"
        />
      </div>
      {loading ? <Loader /> : !selectedVendor ? <EmptyState text="Select a vendor to view payments." /> : payments.length === 0 ? <EmptyState text="No payments found." /> : (
        <>
          <Table
            columns={[
              { label: 'Date', key: 'date' },
              { label: 'Debit Account', key: 'debitAccount' },
              { label: 'Credit Account', key: 'creditAccount' },
              { label: 'Amount', key: 'amount' },
              { label: 'Narration', key: 'narration' },
            ]}
            data={paginated.map(p => ({
              ...p,
              date: p.date ? p.date.slice(0, 10) : '',
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
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); reset(); }} title="Add Vendor Payment">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block mb-1">Date</label>
            <input className="input" type="date" {...register('date', { required: true })} />
          </div>
          <div>
            <label className="block mb-1">Debit Account</label>
            <input className="input" {...register('debitAccount', { required: true })} />
          </div>
          <div>
            <label className="block mb-1">Amount</label>
            <input className="input" type="number" step="0.01" {...register('amount', { required: true })} />
          </div>
          <div>
            <label className="block mb-1">Narration</label>
            <input className="input" {...register('narration')} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => { setModalOpen(false); reset(); }}>Cancel</Button>
            <Button type="submit">Add Payment</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default VendorPayments;

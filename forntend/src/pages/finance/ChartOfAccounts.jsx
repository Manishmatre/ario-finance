import React, { useEffect, useState } from "react";
import Table from "../../components/ui/Table";
import { Modal } from "../../components/ui/Modal";
import { useForm } from "react-hook-form";
import { useAuth } from "../../contexts/AuthContext";
import axios from "../../utils/axiosInstance";
import { toast } from "react-toastify";

export default function ChartOfAccounts() {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [error, setError] = useState("");
  const { register, handleSubmit, reset } = useForm();

  // Fetch accounts
  const fetchAccounts = () => {
    setLoading(true);
    axios
      .get("/api/finance/accounts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setAccounts(res.data.accounts || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load accounts");
        setLoading(false);
      });
  };
  useEffect(() => {
    fetchAccounts();
    // eslint-disable-next-line
  }, [token]);

  // Add account
  const onSubmit = async (data) => {
    setLoading(true);
    setError("");
    try {
      await axios.post(
        "/api/finance/accounts",
        data,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Account created");
      setModalOpen(false);
      reset();
      fetchAccounts();
    } catch (err) {
      setError(err.response?.data?.error || "Failed to create account");
      toast.error(err.response?.data?.error || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  // Delete account
  const deleteAccount = async (id) => {
    if (!window.confirm("Delete this account?")) return;
    setLoading(true);
    try {
      await axios.patch(
        `/api/finance/accounts/${id}`,
        { deleted: true },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Account deleted");
      fetchAccounts();
    } catch (err) {
      toast.error("Failed to delete account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Chart of Accounts</h2>
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => setModalOpen(true)}
      >
        + Add Account
      </button>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {loading ? (
        <div>Loading...</div>
      ) : (
        <Table
          columns={[
            { Header: 'Name', accessor: 'name' },
            { Header: 'Code', accessor: 'code' },
            { Header: 'Type', accessor: 'type' },
            { Header: 'Actions', accessor: 'actions' },
          ]}
          data={accounts.map((a) => ({
            ...a,
            actions: (
              <button
                className="text-red-600 hover:underline"
                onClick={() => deleteAccount(a._id)}
              >
                Delete
              </button>
            ),
          }))}
        />
      )}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <h3 className="text-lg font-bold mb-2">Add Account</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="block mb-1">Name</label>
            <input className="border rounded px-2 py-1 w-full" {...register("name", { required: true })} />
          </div>
          <div>
            <label className="block mb-1">Code</label>
            <input className="border rounded px-2 py-1 w-full" {...register("code", { required: true })} />
          </div>
          <div>
            <label className="block mb-1">Type</label>
            <select className="border rounded px-2 py-1 w-full" {...register("type", { required: true })}>
              <option value="">Select type</option>
              <option value="asset">Asset</option>
              <option value="liability">Liability</option>
              <option value="equity">Equity</option>
              <option value="revenue">Revenue</option>
              <option value="expense">Expense</option>
            </select>
          </div>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            type="submit"
            disabled={loading}
          >
            {loading ? "Adding..." : "Add Account"}
          </button>
        </form>
      </Modal>
    </div>
  );
}

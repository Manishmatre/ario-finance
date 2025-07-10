import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiCheck } from 'react-icons/fi';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PageHeading from '../../components/ui/PageHeading';
import { Modal } from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../contexts/useAuth';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';

export default function ExpenseCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [categorySearch, setCategorySearch] = useState('');
  
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();
  const { user } = useAuth();

  // Fetch categories from backend
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/finance/expenses/categories');
      setCategories(res.data || []);
    } catch (err) {
      toast.error('Failed to fetch categories');
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      
      if (editingCategory) {
        await axios.put(`/api/finance/expenses/categories/${editingCategory._id}`, {
          name: data.name,
          description: data.description
        });
        toast.success('Category updated successfully');
      } else {
        await axios.post('/api/finance/expenses/categories', {
          name: data.name,
          description: data.description
        });
        toast.success('Category created successfully');
      }
      
      reset();
      setIsModalOpen(false);
      setEditingCategory(null);
      fetchCategories();
    } catch (err) {
      console.error('Error saving category:', err);
      toast.error(err.response?.data?.error || 'Failed to save category');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setValue('name', category.name);
    setValue('description', category.description || '');
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!categoryToDelete) return;
    
    try {
      setIsDeleting(true);
      await axios.delete(`/api/finance/expenses/categories/${categoryToDelete._id}`);
      toast.success('Category deleted successfully');
      setCategoryToDelete(null);
      fetchCategories();
    } catch (err) {
      console.error('Error deleting category:', err);
      toast.error(err.response?.data?.error || 'Failed to delete category');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddNew = () => {
    setEditingCategory(null);
    reset({
      name: '',
      description: ''
    });
    setIsModalOpen(true);
  };

  const toggleStatus = async (category) => {
    try {
      await axios.put(`/api/finance/expenses/categories/${category._id}`, {
        isActive: !category.isActive
      });
      toast.success(`Category ${category.isActive ? 'deactivated' : 'activated'} successfully`);
      fetchCategories();
    } catch (err) {
      console.error('Error toggling category status:', err);
      toast.error('Failed to update category status');
    }
  };

  // Calculate summary from real data
  const summary = [
    { title: 'Total Categories', value: categories.length, color: 'blue' },
    { title: 'Active', value: categories.filter(c => c.isActive).length, color: 'green' },
    { title: 'Inactive', value: categories.filter(c => !c.isActive).length, color: 'red' },
  ];

  // Filtered categories by search
  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    (cat.description || '').toLowerCase().includes(categorySearch.toLowerCase())
  );

  // Table columns for categories
  const columns = [
    { Header: 'Name', accessor: 'name', className: 'font-medium', disableSort: false },
    { Header: 'Description', accessor: 'description', Cell: ({ value }) => value || '—', disableSort: false },
    { Header: 'Status', accessor: 'isActive', disableSort: false, Cell: ({ value }) => (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {value ? 'Active' : 'Inactive'}
      </span>
    ) },
    { Header: 'Actions', accessor: 'actions', disableSort: true, Cell: ({ row }) => (
      <div className="flex gap-2 justify-end">
        <Button
          size="sm"
          variant={row.original.isActive ? 'danger' : 'success'}
          onClick={() => toggleStatus(row.original)}
          title={row.original.isActive ? 'Deactivate' : 'Activate'}
        >
          {row.original.isActive ? <FiX /> : <FiCheck />}
        </Button>
        <Button
          size="sm"
          variant="primary"
          onClick={() => handleEdit(row.original)}
          title="Edit"
        >
          <FiEdit2 />
        </Button>
        <Button
          size="sm"
          variant="danger"
          onClick={() => setCategoryToDelete(row.original)}
          title="Delete"
        >
          <FiTrash2 />
        </Button>
      </div>
    ) },
  ];

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Expense Categories"
        subtitle="Manage and organize your expense categories"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Expense Categories" }
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {summary.map((item, idx) => (
          <Card key={idx} title={item.title} value={item.value} icon={<span className={`inline-block w-3 h-3 rounded-full bg-${item.color}-500`} />} />
        ))}
      </div>
      {/* Filters and Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 mt-4">
        <div className="flex flex-1 items-center gap-2">
          <input
            type="text"
            value={categorySearch}
            onChange={e => setCategorySearch(e.target.value)}
            className="border rounded px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 border-gray-300"
            placeholder="Search categories..."
          />
            </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Button onClick={handleAddNew} className="bg-blue-600 hover:bg-blue-700 text-white"><FiPlus className="mr-2" />Add Category</Button>
        </div>
      </div>
      {/* Table Section */}
      <Card>
        {loading ? <Loader /> : filteredCategories.length === 0 ? <EmptyState message="No categories found. Create your first category to get started." /> : (
          <Table
            columns={columns}
            data={filteredCategories}
            stickyHeader={true}
            pageSize={10}
            className="mt-2"
          />
        )}
      </Card>
      {/* Modal for Add/Edit Category */}
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingCategory ? 'Edit Category' : 'Add Category'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Category Name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
            autoFocus
          />
          <Input
            label="Description"
            {...register('description')}
            error={errors.description?.message}
          />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={loading}>
              {editingCategory ? 'Update' : 'Add'}
            </Button>
          </div>
        </form>
      </Modal>
      {/* Confirm Delete Modal */}
      <Modal open={!!categoryToDelete} onClose={() => setCategoryToDelete(null)} title="Delete Category?">
        <div className="space-y-4">
          <p>Are you sure you want to delete the category <b>{categoryToDelete?.name}</b>?</p>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setCategoryToDelete(null)} disabled={isDeleting}>Cancel</Button>
            <Button variant="danger" onClick={confirmDelete} loading={isDeleting}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

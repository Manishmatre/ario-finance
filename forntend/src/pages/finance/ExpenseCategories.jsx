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
import { useAuth } from '../../contexts/AuthContext';
import Table from '../../components/ui/Table';
import Loader from '../../components/ui/Loader';

export default function ExpenseCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  
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

  // Table columns for categories
  const columns = [
    { Header: 'Name', accessor: 'name' },
    { Header: 'Description', accessor: 'description', Cell: ({ value }) => value || '—' },
    { Header: 'Status', accessor: 'isActive', Cell: ({ value }) => (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${value ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        {value ? 'Active' : 'Inactive'}
      </span>
    ) },
    { Header: 'Actions', accessor: 'actions', Cell: ({ row }) => (
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => toggleStatus(row.original)}
          className={`p-1 rounded-full ${row.original.isActive ? 'text-red-600 hover:bg-red-100' : 'text-green-600 hover:bg-green-100'}`}
          title={row.original.isActive ? 'Deactivate' : 'Activate'}
        >
          {row.original.isActive ? <FiX /> : <FiCheck />}
        </button>
        <button
          onClick={() => handleEdit(row.original)}
          className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-100"
          title="Edit"
        >
          <FiEdit2 />
        </button>
        <button
          onClick={() => setCategoryToDelete(row.original)}
          className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-100"
          title="Delete"
        >
          <FiTrash2 />
        </button>
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
        actions={[
          <Button
            key="add-category"
            onClick={handleAddNew}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <FiPlus className="mr-2" /> Add Category
          </Button>
        ]}
      />
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summary.map((item, idx) => (
          <Card key={idx} title={item.title} value={item.value} icon={<span className={`inline-block w-3 h-3 rounded-full bg-${item.color}-500`} />} />
        ))}
      </div>
      {/* Category Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-medium text-gray-800">Category List</h3>
            </div>
        {loading ? (
          <Loader />
          ) : categories.length === 0 ? (
            <EmptyState message="No categories found. Create your first category to get started." />
          ) : (
          <Table columns={columns} data={categories} />
          )}
        </div>

      {/* Add/Edit Category Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingCategory(null);
        }}
        title={editingCategory ? 'Edit Category' : 'Add New Category'}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Name"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
            disabled={loading}
            placeholder="e.g. Office Supplies, Travel"
          />
          
          <Input
            label="Description (Optional)"
            {...register('description')}
            error={errors.description?.message}
            disabled={loading}
            placeholder="A brief description of this category"
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingCategory(null);
              }}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Saving...' : editingCategory ? 'Update Category' : 'Add Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        open={!!categoryToDelete}
        onClose={() => setCategoryToDelete(null)}
        title="Delete Category"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete the category "{categoryToDelete?.name}"? 
            This action cannot be undone.
          </p>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setCategoryToDelete(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

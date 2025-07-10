import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { format, parse } from 'date-fns';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import PageHeading from '../../components/ui/PageHeading';
import { Modal } from '../../components/ui/Modal';
import { FiX, FiCheck, FiUpload, FiArrowLeft, FiPlus } from 'react-icons/fi';

export default function GRNForm() {
  const { id = null } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isEditMode] = useState(Boolean(id));
  const [isBillModalOpen, setIsBillModalOpen] = useState(false);
  const [billFile, setBillFile] = useState(null);
  const [billPreview, setBillPreview] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm({
    defaultValues: {
      poRef: '',
      vendorId: '',
      grnDate: format(new Date(), 'yyyy-MM-dd'),
      billNumber: '',
      billDate: format(new Date(), 'yyyy-MM-dd'),
      billAmount: '',
      remarks: '',
      items: []
    }
  });

  const fetchVendors = async () => {
    try {
      const response = await axios.get('/api/finance/vendors');
      setVendors(response.data);
    } catch (err) {
      console.error('Error fetching vendors:', err);
      toast.error('Failed to load vendors');
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get('/api/finance/products');
      setProducts(response.data);
    } catch (err) {
      console.error('Error fetching products:', err);
      toast.error('Failed to load products');
    }
  };

  const fetchGRN = async () => {
    try {
      const response = await axios.get(`/api/finance/grns/${id}`);
      const grn = response.data;
      
      setValue('poRef', grn.poRef);
      setValue('vendorId', grn.vendorId);
      setValue('grnDate', format(new Date(grn.grnDate), 'yyyy-MM-dd'));
      setValue('billNumber', grn.billDetails?.billNumber || '');
      setValue('billDate', grn.billDetails?.billDate ? format(new Date(grn.billDetails.billDate), 'yyyy-MM-dd') : '');
      setValue('billAmount', grn.billDetails?.billAmount || '');
      setValue('remarks', grn.remarks || '');
      
      setItems(grn.items || []);
      setTotalAmount(grn.totalAmount || 0);
      
      if (grn.billDetails?.billFile) {
        setBillPreview(grn.billDetails.billFile);
      }
    } catch (err) {
      console.error('Error fetching GRN:', err);
      toast.error('Failed to load GRN details');
      navigate('/finance/grns');
    }
  };

  useEffect(() => {
    fetchVendors();
    fetchProducts();
    if (isEditMode) {
      fetchGRN();
    }
  }, [isEditMode]);

  const handleAddItem = () => {
    setItems(prev => [...prev, {
      productId: '',
      quantity: 0,
      unitPrice: 0,
      totalAmount: 0,
      batchNumber: '',
      expiryDate: '',
      receivedQuantity: 0
    }]);
  };

  const handleRemoveItem = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems(prev => {
      const newItems = [...prev];
      newItems[index][field] = value;
      
      // Calculate total amount for the item
      if (field === 'quantity' || field === 'unitPrice') {
        newItems[index].totalAmount = parseFloat(value) * parseFloat(newItems[index].unitPrice);
      }
      
      // Calculate total amount for all items
      setTotalAmount(newItems.reduce((sum, item) => sum + (item.totalAmount || 0), 0));
      
      return newItems;
    });
  };

  const handleBillFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    // Check file type (allow images and PDFs)
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (!validTypes.includes(selectedFile.type)) {
      toast.error('Please upload an image (JPEG, PNG, GIF) or PDF file');
      return;
    }

    // Check file size (max 5MB)
    if (selectedFile.size > 5 * 1024 * 1024) {
      toast.error('File size should be less than 5MB');
      return;
    }

    setBillFile(selectedFile);

    // Create preview for images
    if (selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBillPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    } else {
      setBillPreview(null);
    }
  };

  const removeBillFile = () => {
    setBillFile(null);
    setBillPreview(null);
    setValue('billNumber', '');
    setValue('billDate', '');
    setValue('billAmount', '');
    document.getElementById('billFile').value = '';
  };

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      // Add form data
      Object.keys(data).forEach(key => {
        if (key !== 'items') {
          formData.append(key, data[key]);
        }
      });

      // Add items
      formData.append('items', JSON.stringify(items));

      // Add bill file if selected
      if (billFile) {
        formData.append('billFile', billFile);
      }

      let response;
      if (isEditMode) {
        response = await axios.put(`/api/finance/grns/${id}`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('GRN updated successfully');
      } else {
        response = await axios.post('/api/finance/grns', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        toast.success('GRN created successfully');
      }

      navigate('/finance/grns');
    } catch (err) {
      console.error('Error saving GRN:', err);
      toast.error(err.response?.data?.error || 'Failed to save GRN');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeading
        title={isEditMode ? 'Edit GRN' : 'Create New GRN'}
        description="Manage Goods Received Note details"
        actions={[
          <Button
            key="back"
            variant="outline"
            as={Link}
            to="/finance/grns"
            className="flex items-center"
          >
            <FiArrowLeft className="mr-2" /> Back to GRNs
          </Button>
        ]}
      />

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">PO Reference</label>
              <Input
                {...register('poRef', {
                  required: 'PO Reference is required',
                  minLength: { value: 3, message: 'PO Reference must be at least 3 characters' }
                })}
                error={errors.poRef?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor</label>
              <Select
                {...register('vendorId', { required: 'Vendor is required' })}
                error={errors.vendorId?.message}
                options={[
                  { value: '', label: 'Select Vendor' },
                  ...vendors.map(vendor => ({
                    value: vendor._id,
                    label: vendor.name
                  }))
                ]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GRN Date</label>
              <Input
                type="date"
                {...register('grnDate', {
                  required: 'GRN Date is required',
                  valueAsDate: true
                })}
                error={errors.grnDate?.message}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bill Details</label>
              <div className="mt-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      type="file"
                      id="billFile"
                      accept="image/*,.pdf"
                      onChange={handleBillFileChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="billFile"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiUpload className="mr-2 h-4 w-4" />
                      Upload Bill
                    </label>
                  </div>
                  {billPreview && (
                    <button
                      type="button"
                      onClick={removeBillFile}
                      className="text-red-600 hover:text-red-800"
                    >
                      <FiX className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {billPreview && (
                  <div className="mt-2">
                    {billPreview.startsWith('data:image') ? (
                      <img
                        src={billPreview}
                        alt="Bill preview"
                        className="max-h-48 w-full object-contain"
                      />
                    ) : (
                      <div className="p-4 bg-gray-50 rounded">
                        <p className="text-sm text-gray-500">PDF file uploaded</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Items</h3>
            {items.map((item, index) => (
              <div key={index} className="border rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-medium text-gray-700">
                    Item #{index + 1}
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                    <Select
                      value={item.productId}
                      onChange={(e) => handleItemChange(index, 'productId', e.target.value)}
                      options={[
                        { value: '', label: 'Select Product' },
                        ...products.map(product => ({
                          value: product._id,
                          label: product.name
                        }))
                      ]}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                    <Input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      min="0"
                      step="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Unit Price</label>
                    <Input
                      type="number"
                      value={item.unitPrice}
                      onChange={(e) => handleItemChange(index, 'unitPrice', e.target.value)}
                      min="0"
                      step="0.01"
                      prefix="₹"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Batch Number</label>
                    <Input
                      value={item.batchNumber}
                      onChange={(e) => handleItemChange(index, 'batchNumber', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                    <Input
                      type="date"
                      value={item.expiryDate}
                      onChange={(e) => handleItemChange(index, 'expiryDate', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Received Quantity</label>
                    <Input
                      type="number"
                      value={item.receivedQuantity}
                      onChange={(e) => handleItemChange(index, 'receivedQuantity', e.target.value)}
                      min="0"
                      step="1"
                    />
                  </div>
                </div>
              </div>
            ))}
            <div className="flex justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={handleAddItem}
                className="bg-green-100 text-green-800 hover:bg-green-200"
              >
                <FiPlus className="mr-2" /> Add Item
              </Button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
            <textarea
              {...register('remarks')}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows="3"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/finance/grns')}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? 'Saving...' : isEditMode ? 'Update GRN' : 'Create GRN'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

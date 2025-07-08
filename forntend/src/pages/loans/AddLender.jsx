import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { indianBanks } from '../../data/banks';
import axiosInstance from '../../utils/axiosInstance';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import PageHeading from '../../components/ui/PageHeading';
import { FiArrowLeft } from 'react-icons/fi';
import { toast } from 'react-toastify';

const AddLender = () => {
  const { id } = useParams();
  const [isEditMode, setIsEditMode] = React.useState(false);
  const [lender, setLender] = React.useState(null);

  React.useEffect(() => {
    if (id) {
      setIsEditMode(true);
      fetchLender();
    }
  }, [id]);

  const fetchLender = async () => {
    try {
      const response = await axiosInstance.get(`/api/finance/lenders/${id}`);
      const lenderData = response.data;
      setLender(lenderData);
      setFormData({
        name: lenderData.name,
        email: lenderData.email,
        phone: lenderData.phone,
        type: lenderData.type,
        address: lenderData.address,
        contactPerson: lenderData.contactPerson,
        status: lenderData.status
      });
    } catch (error) {
      console.error('Error fetching lender:', error);
      setError('Failed to load lender details');
    }
  };
  const navigate = useNavigate();
  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    address: '',
    contactPerson: '',
    status: 'ACTIVE'
  });
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Convert form data to JSON object
      const lenderData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        type: formData.type,
        address: formData.address,
        contactPerson: formData.contactPerson,
        status: formData.status
      };

      if (isEditMode) {
        await axiosInstance.put(`/api/finance/lenders/${id}`, lenderData);
        toast.success('Lender updated successfully');
      } else {
        await axiosInstance.post('/api/finance/lenders', lenderData);
        toast.success('Lender added successfully');
      }
      navigate('/finance/lenders');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save lender');
      toast.error(err.response?.data?.message || 'Failed to save lender');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/finance/lenders');
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={isEditMode ? "Edit Lender" : "Add New Lender"}
        subtitle={isEditMode ? `Editing ${lender?.name}` : "Add a new lender to your system"}
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Lenders", to: "/finance/lenders" },
          { label: isEditMode ? "Edit" : "Add" }
        ]}
      />

      <div className="flex justify-between items-center mb-4">
        <Button
          variant="outline"
          icon={<FiArrowLeft />}
          onClick={handleCancel}
        >
          Back to Lenders
        </Button>
      </div>

      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-2">
                <h3 className="text-sm font-medium text-gray-700">Lender Name</h3>
                {formData.type === 'BANK' && (
                  <Select
                    label="Bank Name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    options={indianBanks}
                    required
                  />
                )}
                {formData.type !== 'BANK' && (
                  <Input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                )}
              </div>
            </div>

            <div>
              <div className="mb-2">
                <h3 className="text-sm font-medium text-gray-700">Email</h3>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter email address"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-2">
                <h3 className="text-sm font-medium text-gray-700">Phone</h3>
                <Input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            <div>
              <div className="mb-2">
                <h3 className="text-sm font-medium text-gray-700">Lender Type</h3>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  options={[
                    { value: '', label: 'Select type' },
                    { value: 'BANK', label: 'Bank' },
                    { value: 'NBFC', label: 'NBFC' },
                    { value: 'PRIVATE', label: 'Private Lender' },
                    { value: 'GOVERNMENT', label: 'Government' }
                  ]}
                  required
                />
              </div>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Address</h3>
            <Input
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              required
              placeholder="Enter complete address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-2">
                <h3 className="text-sm font-medium text-gray-700">Contact Person</h3>
                <Input
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter contact person name"
                />
              </div>
            </div>

            <div>
              <div className="mb-2">
                <h3 className="text-sm font-medium text-gray-700">Status</h3>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  options={[
                    { value: 'ACTIVE', label: 'Active' },
                    { value: 'INACTIVE', label: 'Inactive' }
                  ]}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Add Lender'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddLender;

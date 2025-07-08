import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from '../../utils/axiosInstance';
import { toast } from 'react-toastify';
import { format } from 'date-fns';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import PageHeading from '../../components/ui/PageHeading';
import { Modal } from '../../components/ui/Modal';
import { FiArrowLeft, FiCheck, FiUpload, FiX } from 'react-icons/fi';

export default function GRNMatchBill() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [grn, setGRN] = useState(null);
  const [billFile, setBillFile] = useState(null);
  const [billPreview, setBillPreview] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  const fetchGRN = async () => {
    try {
      const response = await axios.get(`/api/finance/grns/${id}`);
      setGRN(response.data);
    } catch (err) {
      console.error('Error fetching GRN:', err);
      toast.error('Failed to load GRN details');
      navigate('/finance/grns');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGRN();
  }, []);

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
    document.getElementById('billFile').value = '';
  };

  const handleMatchBill = async () => {
    try {
      setLoading(true);
      const formData = new FormData();
      
      formData.append('billNumber', grn.billDetails?.billNumber || '');
      formData.append('billDate', grn.billDetails?.billDate || '');
      formData.append('billAmount', grn.billDetails?.billAmount || '');
      
      if (billFile) {
        formData.append('billFile', billFile);
      }

      await axios.put(`/api/finance/grns/${id}/match`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success('Bill matched successfully');
      navigate('/finance/grns');
    } catch (err) {
      console.error('Error matching bill:', err);
      toast.error(err.response?.data?.error || 'Failed to match bill');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeading
        title="Match Bill to GRN"
        description={`Match bill for GRN #${grn.grnNumber}`}
        actions={[
          <Button
            key="back"
            variant="outline"
            as={Link}
            to={`/finance/grns/${id}`}
            className="flex items-center"
          >
            <FiArrowLeft className="mr-2" /> Back to GRN
          </Button>
        ]}
      />

      <Card>
        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                GRN Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500 mb-1">GRN Number</p>
                  <p className="text-sm text-gray-900">{grn.grnNumber}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">PO Reference</p>
                  <p className="text-sm text-gray-900">{grn.poRef}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Vendor</p>
                  <p className="text-sm text-gray-900">{grn.vendor?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">GRN Date</p>
                  <p className="text-sm text-gray-900">
                    {format(new Date(grn.grnDate), 'dd MMM yyyy')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                  <p className="text-sm text-gray-900">₹{grn.totalAmount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Bill Details
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill Number</label>
                  <Input
                    value={grn.billDetails?.billNumber || ''}
                    onChange={(e) => {
                      setGRN(prev => ({
                        ...prev,
                        billDetails: {
                          ...prev.billDetails,
                          billNumber: e.target.value
                        }
                      }));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill Date</label>
                  <Input
                    type="date"
                    value={grn.billDetails?.billDate ? format(new Date(grn.billDetails.billDate), 'yyyy-MM-dd') : ''}
                    onChange={(e) => {
                      setGRN(prev => ({
                        ...prev,
                        billDetails: {
                          ...prev.billDetails,
                          billDate: e.target.value
                        }
                      }));
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bill Amount</label>
                  <Input
                    type="number"
                    value={grn.billDetails?.billAmount || ''}
                    onChange={(e) => {
                      setGRN(prev => ({
                        ...prev,
                        billDetails: {
                          ...prev.billDetails,
                          billAmount: e.target.value
                        }
                      }));
                    }}
                    prefix="₹"
                  />
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Bill File
                  </label>
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

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/finance/grns/${id}`)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                type="button"
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                {loading ? 'Matching...' : 'Match Bill'}
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Confirm Modal */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm Bill Matching"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to match this bill to GRN #{grn.grnNumber}?
          </p>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsConfirmModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleMatchBill}
              disabled={loading}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? 'Matching...' : 'Confirm'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

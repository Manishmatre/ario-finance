import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiUpload, FiDownload, FiTrash2, FiFileText, FiCheck } from 'react-icons/fi';
import Button from '../../components/ui/Button';
import Card from '../../components/ui/Card';
import PageHeading from '../../components/ui/PageHeading';
import axiosInstance from '../../utils/axiosInstance';
import { toast } from 'react-toastify';

const LoanDocuments = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [documents, setDocuments] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    fetchDocuments();
  }, [id]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/finance/loans/${id}/documents`);
      setDocuments(response.data);
    } catch (error) {
      setError('Failed to fetch documents. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (event) => {
    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('document', file);
    formData.append('category', event.target.dataset.category);

    try {
      setError('');
      await axiosInstance.post(`/api/finance/loans/${id}/documents`, formData);
      toast.success('Document uploaded successfully');
      fetchDocuments();
    } catch (error) {
      setError('Failed to upload document. Please try again.');
      toast.error(error.response?.data?.message || 'Failed to upload document');
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      setError('');
      await axiosInstance.delete(`/api/finance/loans/${id}/documents/${documentId}`);
      toast.success('Document deleted successfully');
      fetchDocuments();
    } catch (error) {
      setError('Failed to delete document. Please try again.');
      toast.error(error.response?.data?.message || 'Failed to delete document');
    }
  };

  const handleDownload = async (document) => {
    try {
      const response = await axiosInstance.get(`/api/finance/loans/${id}/documents/${document._id}/download`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', document.name);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Document downloaded successfully');
    } catch (error) {
      setError('Failed to download document. Please try again.');
      toast.error(error.response?.data?.message || 'Failed to download document');
    }
  };

  const handleApproval = async (documentId, status) => {
    try {
      setError('');
      await axiosInstance.put(`/api/finance/loans/${id}/documents/${documentId}/status`, {
        status
      });
      toast.success('Document status updated successfully');
      fetchDocuments();
    } catch (error) {
      setError('Failed to update document status. Please try again.');
      toast.error(error.response?.data?.message || 'Failed to update document status');
    }
  };

  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Loan Documents"
        subtitle="Manage loan-related documents"
        breadcrumbs={[
          { label: "Finance", to: "/finance" },
          { label: "Loans", to: "/finance/loans" },
          { label: "Documents" }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Identification Documents</label>
                <input
                  type="file"
                  onChange={handleUpload}
                  data-category="IDENTIFICATION"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Income Documents</label>
                <input
                  type="file"
                  onChange={handleUpload}
                  data-category="INCOME"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Property Documents</label>
                <input
                  type="file"
                  onChange={handleUpload}
                  data-category="PROPERTY"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Other Documents</label>
                <input
                  type="file"
                  onChange={handleUpload}
                  data-category="OTHER"
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <Card key={doc._id}>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-semibold">{doc.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-sm ${
                    doc.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                    doc.status === 'REJECTED' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }}`}>
                    {doc.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">Category: {doc.category.replace('_', ' ')}</p>
                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    icon={<FiDownload />}
                    onClick={() => handleDownload(doc)}
                  >
                    Download
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      icon={doc.status === 'APPROVED' ? <FiCheck /> : <FiFileText />}
                      onClick={() => handleApproval(doc._id, doc.status === 'APPROVED' ? 'REJECTED' : 'APPROVED')}
                    >
                      {doc.status === 'APPROVED' ? 'Reject' : 'Approve'}
                    </Button>
                    <Button
                      variant="danger"
                      icon={<FiTrash2 />}
                      onClick={() => handleDelete(doc._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoanDocuments;

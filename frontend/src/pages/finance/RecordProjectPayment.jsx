import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PaymentForm from '../../components/finance/PaymentForm';
import PageHeading from '../../components/ui/PageHeading';

export default function RecordProjectPayment() {
  const { id } = useParams();
  const navigate = useNavigate();

    // No changes needed here: PaymentForm now handles all dynamic fields internally and passes them to the backend.
  // Just ensure the layout is full width and PaymentForm is used directly.
  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Record Project Payment"
        subtitle="Add a new payment for this project"
        breadcrumbs={[
          { label: 'Projects', to: '/finance/projects' },
          { label: 'Project Details', to: `/finance/projects/${id}` },
          { label: 'Record Payment' }
        ]}
      />
      <PaymentForm
        projectId={id}
        onSuccess={() => navigate(`/finance/projects/${id}?tab=payments`)}
        onCancel={() => navigate(-1)}
      />
    </div>
  );
} 
import React from 'react';
import PageHeading from '../../components/ui/PageHeading';
import ProjectForm from '../../components/finance/ProjectForm';
import { useNavigate } from 'react-router-dom';

export default function AddProject() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title="Add Project"
        subtitle="Create a new project record"
        breadcrumbs={[
          { label: 'Projects', to: '/finance/projects' },
          { label: 'Add Project' }
        ]}
      />
      <ProjectForm
        onSuccess={() => navigate('/finance/projects')}
        onCancel={() => navigate('/finance/projects')}
      />
    </div>
  );
} 
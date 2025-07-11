import React, { useEffect, useState } from 'react';
import PageHeading from '../../components/ui/PageHeading';
import ProjectForm from '../../components/finance/ProjectForm';
import { useNavigate, useParams } from 'react-router-dom';
import Loader from '../../components/ui/Loader';
import axios from '../../utils/axios';

export default function AddProject() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      setLoading(true);
      axios.get(`/api/finance/projects/${id}`)
        .then(res => setProject(res.data))
        .catch(() => setError('Failed to load project'))
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  const isEdit = !!id;
  return (
    <div className="space-y-4 px-2 sm:px-4">
      <PageHeading
        title={isEdit ? 'Edit Project' : 'Add Project'}
        subtitle={isEdit ? 'Update project details' : 'Create a new project record'}
        breadcrumbs={[
          { label: 'Projects', to: '/finance/projects' },
          { label: isEdit ? 'Edit Project' : 'Add Project' }
        ]}
      />
      <ProjectForm
        project={isEdit ? project : undefined}
        onSuccess={() => navigate('/finance/projects')}
        onCancel={() => navigate('/finance/projects')}
      />
    </div>
  );
} 
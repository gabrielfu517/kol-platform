import React, { useEffect, useMemo, useState } from 'react';
import { jobsAPI, Job, JobAssignment, kolAPI, KOL } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const Jobs: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canCreate = useMemo(() => user?.role === 'admin' || user?.role === 'client', [user]);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await jobsAPI.list();
      setJobs(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="max-w-6xl mx-auto w-full p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Jobs</h1>
        {canCreate && (
          <button
            onClick={() => navigate('/jobs/new')}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90"
          >
            + New Job
          </button>
        )}
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : jobs.length === 0 ? (
        <div className="text-gray-500">No jobs yet.</div>
      ) : (
        <div className="space-y-4">
          {jobs.map((j) => (
            <div key={j.id} className="border rounded-lg p-4 flex items-start justify-between">
              <div>
                <div className="font-semibold text-lg">{j.title}</div>
                <div className="text-sm text-gray-600">
                  {j.restaurant_name || '-'} • {j.address || '-'}
                </div>
                <div className="text-sm mt-1">
                  Status: <span className="font-medium">{j.status}</span> • Will pay:{' '}
                  <span className="font-medium">{j.will_pay ? 'Yes' : 'No'}</span>{' '}
                  {j.will_pay && <span>• Budget: ${j.budget}</span>}
                </div>
                <div className="text-sm mt-1">
                  Content: {j.content_types?.join(', ') || '-'} • Restrictions:{' '}
                  {j.restrictions?.join(', ') || '-'}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/jobs/${j.id}/edit`)}
                  className="px-3 py-2 border rounded-md hover:bg-gray-50"
                >
                  Edit
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Jobs;


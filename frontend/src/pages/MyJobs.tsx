import React, { useEffect, useState } from 'react';
import { myJobsAPI, JobAssignment } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const MyJobs: React.FC = () => {
  const { user } = useAuth();
  const [status, setStatus] = useState<'pending' | 'accepted' | 'rejected' | 'withdrawn' | ''>('pending');
  const [items, setItems] = useState<JobAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      const { data } = await myJobsAPI.list(status || undefined);
      setItems(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const act = async (assignmentId: number, action: 'accept' | 'reject') => {
    try {
      if (action === 'accept') await myJobsAPI.accept(assignmentId);
      else await myJobsAPI.reject(assignmentId);
      await load();
    } catch (e) {
      // noop
    }
  };

  if (user?.role !== 'kol') {
    return <div className="max-w-4xl mx-auto p-6">This page is for KOL users.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Jobs</h1>
        <select
          className="border rounded px-3 py-2"
          value={status}
          onChange={(e) => setStatus(e.target.value as any)}
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="withdrawn">Withdrawn</option>
          <option value="">All</option>
        </select>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : items.length === 0 ? (
        <div className="text-gray-500">No jobs found.</div>
      ) : (
        <div className="space-y-4">
          {items.map((a) => (
            <div key={a.id} className="border rounded-lg p-4">
              <div className="font-semibold">{a.job?.title}</div>
              <div className="text-sm text-gray-600">{a.job?.restaurant_name} • {a.job?.address}</div>
              <div className="text-sm mt-1">
                Content: {a.job?.content_types?.join(', ') || '-'} • Restrictions: {a.job?.restrictions?.join(', ') || '-'}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <div className="text-sm">Status: <span className="font-medium">{a.invite_status}</span></div>
                {a.invite_status === 'pending' && (
                  <div className="flex gap-2">
                    <button onClick={() => act(a.id, 'reject')} className="px-3 py-2 border rounded-md">Reject</button>
                    <button onClick={() => act(a.id, 'accept')} className="px-3 py-2 bg-primary text-white rounded-md">Accept</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyJobs;


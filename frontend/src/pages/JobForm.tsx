import React, { useEffect, useState } from 'react';
import { jobsAPI, Job, kolAPI, KOL } from '../services/api';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const allRestrictions = [
  { key: 'time', label: 'Time' },
  { key: 'date', label: 'Date' },
  { key: 'budget', label: 'Budget' },
  { key: 'alcohol', label: '酒 (Alcohol)' },
  { key: 'plus_one', label: '+1?' },
  { key: 'not_free', label: 'Not free' },
];

const allContentTypes = [
  { key: 'ig_reel', label: 'IG Reel' },
  { key: 'post', label: 'Post' },
];

const JobForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const editing = !!id;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [kols, setKols] = useState<KOL[]>([]);
  const [inviteKolIds, setInviteKolIds] = useState<number[]>([]);

  const [form, setForm] = useState<Partial<Job> & { content_types: string[]; restrictions: string[]; budget?: string | number }>({
    title: '',
    description: '',
    restaurant_name: '',
    address: '',
    will_pay: false,
    budget: '',
    suggested_turnaround_days: 7,
    content_types: ['post'],
    restrictions: [],
    status: 'draft',
  } as any);

  useEffect(() => {
    // Load KOLs for invite select
    kolAPI.getAll().then(({ data }) => setKols(data)).catch(() => {});
    if (editing) {
      setLoading(true);
      jobsAPI
        .get(Number(id))
        .then(({ data }) => {
          setForm({
            ...data,
            content_types: data.content_types || [],
            restrictions: data.restrictions || [],
          } as any);
          setInviteKolIds((data as any).assignments?.map((a: any) => a.kol_id) || []);
        })
        .catch((e) => setError(e?.message || 'Failed to load job'))
        .finally(() => setLoading(false));
    }
  }, [editing, id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type, checked } = e.target as any;
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const toggleArray = (arr: string[], v: string) =>
    arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v];

  const submit = async () => {
    try {
      setLoading(true);
      setError(null);
      // Normalize budget: allow empty string; backend requires >0 if will_pay
      const payload: any = { ...form };
      if (form.will_pay) {
        const budgetNum =
          form.budget === '' || form.budget === undefined ? NaN : Number((form.budget as any));
        if (Number.isNaN(budgetNum) || budgetNum <= 0) {
          setLoading(false);
          setError('Please enter a budget greater than 0 when Will pay is enabled.');
          return;
        }
        payload.budget = budgetNum;
      } else {
        delete payload.budget;
      }
      let saved: Job;
      if (editing) {
        const { data } = await jobsAPI.update(Number(id), payload);
        saved = data;
      } else {
        const { data } = await jobsAPI.create(payload);
        saved = data;
      }
      // publish if wanted and send invites
      if (saved.status === 'draft' && (form.status as any) === 'published') {
        await jobsAPI.publish(saved.id);
      }
      const toInvite = inviteKolIds.filter(Boolean);
      if (toInvite.length) {
        await jobsAPI.inviteKOLs(saved.id, toInvite);
      }
      navigate('/jobs');
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  if (user?.role === 'kol') {
    return <div className="max-w-3xl mx-auto p-6 text-red-600">KOLs cannot create jobs.</div>;
  }

  return (
    <div className="max-w-3xl mx-auto w-full p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{editing ? 'Edit Job' : 'New Job'}</h1>
      </div>
      {error && <div className="text-red-600">{error}</div>}

      <div className="grid grid-cols-1 gap-4">
        <input
          className="border rounded px-3 py-2"
          placeholder="Title"
          name="title"
          value={form.title || ''}
          onChange={handleChange}
        />
        <textarea
          className="border rounded px-3 py-2"
          placeholder="Description"
          name="description"
          value={form.description || ''}
          onChange={handleChange}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Restaurant name"
          name="restaurant_name"
          value={form.restaurant_name || ''}
          onChange={handleChange}
        />
        <input
          className="border rounded px-3 py-2"
          placeholder="Address"
          name="address"
          value={form.address || ''}
          onChange={handleChange}
        />

        <label className="flex items-center gap-2">
          <input type="checkbox" name="will_pay" checked={!!form.will_pay} onChange={handleChange} />
          Will pay
        </label>
        {form.will_pay && (
          <input
            className="border rounded px-3 py-2"
            placeholder="Budget"
            name="budget"
            type="number"
            value={(form.budget as any) ?? ''}
            onChange={handleChange}
          />
        )}
        <input
          className="border rounded px-3 py-2"
          placeholder="Suggested turnaround days (1-60)"
          name="suggested_turnaround_days"
          type="number"
          value={form.suggested_turnaround_days || 7}
          onChange={handleChange}
        />

        <div>
          <div className="font-medium mb-2">Restrictions</div>
          <div className="flex flex-wrap gap-3">
            {allRestrictions.map((r) => (
              <label key={r.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.restrictions.includes(r.key)}
                  onChange={() =>
                    setForm((f) => ({ ...f, restrictions: toggleArray(f.restrictions, r.key) }))
                  }
                />
                {r.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="font-medium mb-2">Content types</div>
          <div className="flex flex-wrap gap-3">
            {allContentTypes.map((c) => (
              <label key={c.key} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.content_types.includes(c.key)}
                  onChange={() =>
                    setForm((f) => ({ ...f, content_types: toggleArray(f.content_types, c.key) }))
                  }
                />
                {c.label}
              </label>
            ))}
          </div>
        </div>

        <div>
          <div className="font-medium mb-2">Status</div>
          <select
            className="border rounded px-3 py-2"
            value={form.status as any}
            onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as any }))}
          >
            <option value="draft">Draft</option>
            {!editing && <option value="published">Active</option>}
            {editing && (
              <>
                <option value="published">Active</option>
                <option value="closed">Closed</option>
              </>
            )}
          </select>
        </div>

        <div>
          <div className="font-medium mb-2">Invite KOLs</div>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              placeholder="Search KOLs by name or email"
              className="border rounded px-3 py-2 flex-1"
              onChange={(e) => {
                const q = e.target.value.toLowerCase();
                kolAPI.getAll().then(({ data }) => {
                  setKols(
                    data.filter(
                      (k) =>
                        k.name.toLowerCase().includes(q) ||
                        k.email.toLowerCase().includes(q)
                    )
                  );
                });
              }}
            />
            <button
              type="button"
              className="px-3 py-2 border rounded"
              onClick={() => setInviteKolIds(kols.map((k) => k.id))}
            >
              Select all
            </button>
            <button
              type="button"
              className="px-3 py-2 border rounded"
              onClick={() => setInviteKolIds([])}
            >
              Clear
            </button>
          </div>
          <div className="text-sm text-gray-600 mb-2">
            Selected: {inviteKolIds.length}
          </div>
          <select
            multiple
            className="border rounded px-3 py-2 w-full h-48"
            value={inviteKolIds.map(String)}
            onChange={(e) => {
              const selected = Array.from(e.target.selectedOptions).map((o) => Number(o.value));
              setInviteKolIds(selected);
            }}
          >
            {kols.map((k) => (
              <option key={k.id} value={k.id}>
                {k.name} • {k.email}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={submit}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50"
        >
          {editing ? 'Save' : 'Create'}
        </button>
        <button onClick={() => navigate('/jobs')} className="px-4 py-2 border rounded-lg">
          Cancel
        </button>
      </div>
    </div>
  );
};

export default JobForm;


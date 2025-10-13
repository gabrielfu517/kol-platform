import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { campaignAPI, kolAPI, KOL } from '../services/api';

const CampaignForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [kols, setKols] = useState<KOL[]>([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    budget: 0,
    start_date: '',
    end_date: '',
    status: 'draft',
    kol_id: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch KOLs
        const kolsResponse = await kolAPI.getAll();
        setKols(kolsResponse.data);

        // Fetch campaign if editing
        if (isEdit) {
          const response = await campaignAPI.getOne(Number(id));
          const campaign = response.data;
          setFormData({
            title: campaign.title,
            description: campaign.description || '',
            budget: campaign.budget,
            start_date: campaign.start_date ? campaign.start_date.split('T')[0] : '',
            end_date: campaign.end_date ? campaign.end_date.split('T')[0] : '',
            status: campaign.status,
            kol_id: campaign.kol_id?.toString() || '',
          });
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data: any = {
        title: formData.title,
        description: formData.description,
        budget: formData.budget,
        status: formData.status,
      };

      if (formData.start_date) data.start_date = new Date(formData.start_date).toISOString();
      if (formData.end_date) data.end_date = new Date(formData.end_date).toISOString();
      if (formData.kol_id) data.kol_id = parseInt(formData.kol_id);

      if (isEdit) {
        await campaignAPI.update(Number(id), data);
      } else {
        await campaignAPI.create(data);
      }
      navigate('/campaigns');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save campaign. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  return (
    <div className="max-w-4xl mx-auto px-8 py-8 flex-1">
      <div className="mb-8">
        <Link to="/campaigns" className="text-primary font-medium hover:underline">
          ← Back to Campaigns
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold">{isEdit ? 'Edit Campaign' : 'Create New Campaign'}</h2>
        </div>

        {error && <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-800 text-sm">Campaign Title *</label>
            <input
              type="text"
              name="title"
              className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={formData.title}
              onChange={handleChange}
              required
              placeholder="Summer Product Launch"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-800 text-sm">Description</label>
            <textarea
              name="description"
              className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-vertical min-h-[100px]"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your campaign goals and objectives..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-800 text-sm">Budget ($) *</label>
              <input
                type="number"
                name="budget"
                className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={formData.budget}
                onChange={handleChange}
                min="0"
                step="0.01"
                required
                placeholder="5000"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-800 text-sm">Status</label>
              <select
                name="status"
                className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-800 text-sm">Start Date</label>
              <input
                type="date"
                name="start_date"
                className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={formData.start_date}
                onChange={handleChange}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-800 text-sm">End Date</label>
              <input
                type="date"
                name="end_date"
                className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={formData.end_date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-800 text-sm">Assign KOL</label>
            <select
              name="kol_id"
              className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={formData.kol_id}
              onChange={handleChange}
            >
              <option value="">Select a KOL (optional)</option>
              {kols.map((kol) => (
                <option key={kol.id} value={kol.id}>
                  {kol.name} - {kol.platform} ({kol.followers.toLocaleString()} followers)
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4 mt-4">
            <button 
              type="submit" 
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={loading}
            >
              {loading ? 'Saving...' : isEdit ? 'Update Campaign' : 'Create Campaign'}
            </button>
            <Link to="/campaigns" className="px-6 py-3 bg-gray-100 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampaignForm;

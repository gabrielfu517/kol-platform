import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { kolAPI } from '../services/api';

const KOLForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: 'tech',
    platform: 'instagram',
    followers: 0,
    engagement_rate: 0,
    bio: '',
    price_per_post: 0,
    verified: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEdit) {
      const fetchKOL = async () => {
        try {
          const response = await kolAPI.getOne(Number(id));
          const kol = response.data;
          setFormData({
            name: kol.name,
            email: kol.email,
            category: kol.category,
            platform: kol.platform,
            followers: kol.followers,
            engagement_rate: kol.engagement_rate,
            bio: kol.bio || '',
            price_per_post: kol.price_per_post,
            verified: kol.verified,
          });
        } catch (error) {
          console.error('Failed to fetch KOL:', error);
        }
      };
      fetchKOL();
    }
  }, [id, isEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isEdit) {
        await kolAPI.update(Number(id), formData);
      } else {
        await kolAPI.create(formData);
      }
      navigate('/kols');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save KOL. Please try again.');
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
        <Link to="/kols" className="text-primary font-medium hover:underline">
          ← Back to KOLs
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex justify-between items-center mb-6 pb-6 border-b border-gray-200">
          <h2 className="text-3xl font-bold">{isEdit ? 'Edit KOL' : 'Add New KOL'}</h2>
        </div>

        {error && <div className="bg-red-100 text-red-800 p-4 rounded-lg mb-6">{error}</div>}

        <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-800 text-sm">Name *</label>
              <input
                type="text"
                name="name"
                className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="John Doe"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-800 text-sm">Email *</label>
              <input
                type="email"
                name="email"
                className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="john@example.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-800 text-sm">Category *</label>
              <select
                name="category"
                className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="tech">Tech</option>
                <option value="fashion">Fashion</option>
                <option value="fitness">Fitness</option>
                <option value="beauty">Beauty</option>
                <option value="food">Food</option>
                <option value="travel">Travel</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-800 text-sm">Platform *</label>
              <select
                name="platform"
                className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={formData.platform}
                onChange={handleChange}
                required
              >
                <option value="instagram">Instagram</option>
                <option value="youtube">YouTube</option>
                <option value="tiktok">TikTok</option>
                <option value="twitter">Twitter</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-800 text-sm">Followers</label>
              <input
                type="number"
                name="followers"
                className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={formData.followers}
                onChange={handleChange}
                min="0"
                placeholder="10000"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="font-semibold text-gray-800 text-sm">Engagement Rate (%)</label>
              <input
                type="number"
                name="engagement_rate"
                className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                value={formData.engagement_rate}
                onChange={handleChange}
                min="0"
                max="100"
                step="0.1"
                placeholder="3.5"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-800 text-sm">Price per Post ($)</label>
            <input
              type="number"
              name="price_per_post"
              className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              value={formData.price_per_post}
              onChange={handleChange}
              min="0"
              step="0.01"
              placeholder="500"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="font-semibold text-gray-800 text-sm">Bio</label>
            <textarea
              name="bio"
              className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 resize-vertical min-h-[100px]"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Tell us about this KOL..."
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="verified"
                checked={formData.verified}
                onChange={(e) => setFormData((prev) => ({ ...prev, verified: e.target.checked }))}
                className="w-5 h-5 cursor-pointer accent-primary"
              />
              <span className="font-semibold text-gray-800 text-sm">Verified Account</span>
            </label>
          </div>

          <div className="flex gap-4 mt-4">
            <button 
              type="submit" 
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed" 
              disabled={loading}
            >
              {loading ? 'Saving...' : isEdit ? 'Update KOL' : 'Create KOL'}
            </button>
            <Link to="/kols" className="px-6 py-3 bg-gray-100 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-colors">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KOLForm;

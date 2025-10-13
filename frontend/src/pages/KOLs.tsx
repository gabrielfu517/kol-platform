import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { kolAPI, KOL } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const KOLs: React.FC = () => {
  const { user } = useAuth();
  const [kols, setKols] = useState<KOL[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    platform: '',
    min_followers: '',
  });

  useEffect(() => {
    fetchKOLs();
  }, [filters]);

  const fetchKOLs = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filters.category) params.category = filters.category;
      if (filters.platform) params.platform = filters.platform;
      if (filters.min_followers) params.min_followers = filters.min_followers;

      const response = await kolAPI.getAll(params);
      setKols(response.data);
    } catch (error) {
      console.error('Failed to fetch KOLs:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 flex-1">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Browse KOLs</h1>
        {user?.role === 'admin' && (
          <Link to="/kols/new" className="px-5 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg transition-all inline-flex items-center gap-2">
            + Add New KOL
          </Link>
        )}
      </div>

      <div className="flex gap-4 mb-8 flex-wrap bg-white p-6 rounded-xl shadow-sm">
        <div className="flex-1 min-w-[200px] flex flex-col gap-2">
          <label className="font-semibold text-gray-800 text-sm">Category</label>
          <select
            className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          >
            <option value="">All Categories</option>
            <option value="tech">Tech</option>
            <option value="fashion">Fashion</option>
            <option value="fitness">Fitness</option>
            <option value="beauty">Beauty</option>
            <option value="food">Food</option>
            <option value="travel">Travel</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px] flex flex-col gap-2">
          <label className="font-semibold text-gray-800 text-sm">Platform</label>
          <select
            className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            value={filters.platform}
            onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
          >
            <option value="">All Platforms</option>
            <option value="instagram">Instagram</option>
            <option value="youtube">YouTube</option>
            <option value="tiktok">TikTok</option>
            <option value="twitter">Twitter</option>
          </select>
        </div>

        <div className="flex-1 min-w-[200px] flex flex-col gap-2">
          <label className="font-semibold text-gray-800 text-sm">Min Followers</label>
          <input
            type="number"
            className="px-3 py-3 border border-gray-300 rounded-lg text-base transition-all focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            placeholder="e.g., 10000"
            value={filters.min_followers}
            onChange={(e) => setFilters({ ...filters, min_followers: e.target.value })}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center min-h-96 text-xl text-gray-600">Loading KOLs...</div>
      ) : kols.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-16 text-center">
          <p className="text-gray-600">
            No KOLs found. Try adjusting your filters or add a new KOL.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {kols.map((kol) => (
            <div key={kol.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow relative overflow-hidden">
              <div className="flex gap-4 mb-4">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
                  {kol.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold mb-1">
                    {kol.name}
                    {kol.verified && <span className="text-primary ml-2">✓</span>}
                  </h3>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold uppercase">{kol.category}</span>
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold uppercase">{kol.platform}</span>
                  </div>
                </div>
              </div>

              {kol.bio && (
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {kol.bio.length > 100 ? kol.bio.substring(0, 100) + '...' : kol.bio}
                </p>
              )}

              <div className="flex gap-4 py-4 my-4 border-t border-b border-gray-200">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase">Followers</span>
                  <span className="text-lg font-bold text-primary">{formatNumber(kol.followers)}</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase">Engagement</span>
                  <span className="text-lg font-bold text-primary">{kol.engagement_rate.toFixed(1)}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 uppercase">Price/Post</span>
                  <span className="text-lg font-bold text-primary">${formatNumber(kol.price_per_post)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Link to={`/kols/${kol.id}`} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium text-center hover:bg-primary-dark transition-colors text-sm">
                  View Details
                </Link>
                {user?.role === 'admin' && (
                  <Link to={`/kols/${kol.id}/edit`} className="px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg font-medium hover:bg-gray-200 transition-colors text-sm">
                    Edit
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KOLs;

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { kolAPI, KOL } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const KOLDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [kol, setKol] = useState<KOL | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKOL = async () => {
      try {
        const response = await kolAPI.getOne(Number(id));
        setKol(response.data);
      } catch (error) {
        console.error('Failed to fetch KOL:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchKOL();
  }, [id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this KOL?')) {
      try {
        await kolAPI.delete(Number(id));
        navigate('/kols');
      } catch (error) {
        console.error('Failed to delete KOL:', error);
      }
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-96 text-xl text-gray-600">Loading KOL details...</div>;
  }

  if (!kol) {
    return (
      <div className="max-w-7xl mx-auto px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-16 text-center">
          <p>KOL not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 flex-1">
      <div className="mb-8">
        <Link to="/kols" className="text-primary font-medium hover:underline">
          ← Back to KOLs
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex gap-6 mb-8">
          <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-5xl font-bold flex-shrink-0">
            {kol.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-5xl font-bold mb-2">
              {kol.name}
              {kol.verified && <span className="text-primary ml-3">✓</span>}
            </h1>
            <div className="mb-4 flex gap-2">
              <span className="px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold uppercase">{kol.category}</span>
              <span className="px-4 py-2 bg-green-100 text-green-800 rounded-full text-sm font-semibold uppercase">{kol.platform}</span>
            </div>
            <p className="text-gray-600">{kol.email}</p>
          </div>
        </div>

        <div className="flex justify-around py-6 my-6 border-t border-b border-gray-200">
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 uppercase mb-2">Followers</span>
            <span className="text-4xl font-bold text-primary">{formatNumber(kol.followers)}</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 uppercase mb-2">Engagement Rate</span>
            <span className="text-4xl font-bold text-primary">{kol.engagement_rate.toFixed(1)}%</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-xs text-gray-500 uppercase mb-2">Price per Post</span>
            <span className="text-4xl font-bold text-primary">${formatNumber(kol.price_per_post)}</span>
          </div>
        </div>

        {kol.bio && (
          <div className="mt-8 p-6 bg-gray-50 rounded-lg">
            <h3 className="mb-3 font-semibold text-lg">About</h3>
            <p className="text-gray-600 leading-relaxed text-lg">{kol.bio}</p>
          </div>
        )}

        {user?.role === 'admin' && (
          <div className="flex gap-4 mt-8 pt-8 border-t border-gray-200">
            <Link to={`/kols/${kol.id}/edit`} className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
              Edit Profile
            </Link>
            <button onClick={handleDelete} className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors">
              Delete KOL
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default KOLDetail;

import React, { useEffect, useState } from 'react';
import { statsAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await statsAPI.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center min-h-96 text-xl text-gray-600">Loading dashboard...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 flex-1 animate-fade-in">
      <h1 className="text-4xl font-bold mb-8 animate-slide-up">
        Welcome, {user?.full_name}! 👋
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primary to-primary-dark text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-scale-in">
          <div className="text-sm opacity-90 mb-2 uppercase tracking-wide">Total KOLs</div>
          <div className="text-5xl font-bold">{stats?.total_kols || 0}</div>
          <div className="mt-2 text-sm opacity-75">📊 In database</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-scale-in" style={{ animationDelay: '0.1s' }}>
          <div className="text-sm opacity-90 mb-2 uppercase tracking-wide">Total Campaigns</div>
          <div className="text-5xl font-bold">{stats?.total_campaigns || 0}</div>
          <div className="mt-2 text-sm opacity-75">🚀 Created</div>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 animate-scale-in" style={{ animationDelay: '0.2s' }}>
          <div className="text-sm opacity-90 mb-2 uppercase tracking-wide">Active Campaigns</div>
          <div className="text-5xl font-bold">{stats?.active_campaigns || 0}</div>
          <div className="mt-2 text-sm opacity-75">⚡ Running</div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
        <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">
            {user?.role === 'admin' ? '⚙️ Platform Management' : '🚀 Getting Started'}
          </h2>
        </div>
        <div className="flex flex-col gap-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 hover:shadow-md transition-all">
            <h3 className="mb-2 font-semibold text-blue-900">📊 Browse KOLs</h3>
            <p className="text-blue-700">
              {user?.role === 'admin' 
                ? 'Manage the database of influencers and key opinion leaders across various platforms.'
                : 'Explore our database of influencers and key opinion leaders across various platforms.'}
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-100 hover:shadow-md transition-all">
            <h3 className="mb-2 font-semibold text-green-900">🚀 Create Campaigns</h3>
            <p className="text-green-700">
              Launch marketing campaigns and connect with the right influencers for your brand.
            </p>
          </div>
          <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100 hover:shadow-md transition-all">
            <h3 className="mb-2 font-semibold text-purple-900">📈 Track Performance</h3>
            <p className="text-purple-700">
              Monitor your campaigns and analyze engagement metrics in real-time.
            </p>
          </div>
          {user?.role === 'admin' && (
            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-400">
              <h3 className="mb-2 font-semibold text-yellow-900">👑 Admin Access</h3>
              <p className="text-yellow-800">
                You have admin privileges to create, edit, and delete KOLs in the platform.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

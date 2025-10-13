import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { campaignAPI, Campaign } from '../services/api';

const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await campaignAPI.getAll();
      setCampaigns(response.data);
    } catch (error) {
      console.error('Failed to fetch campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      try {
        await campaignAPI.delete(id);
        setCampaigns(campaigns.filter((c) => c.id !== id));
      } catch (error) {
        console.error('Failed to delete campaign:', error);
      }
    }
  };

  const getStatusClass = (status: string) => {
    const classes: any = {
      draft: 'bg-blue-100 text-blue-800',
      active: 'bg-green-100 text-green-800',
      completed: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
    };
    return classes[status] || 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return <div className="flex justify-center items-center min-h-96 text-xl text-gray-600">Loading campaigns...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-8 py-8 flex-1">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">My Campaigns</h1>
        <Link to="/campaigns/new" className="px-5 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark hover:-translate-y-0.5 hover:shadow-lg transition-all inline-flex items-center gap-2">
          + Create Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-16 text-center">
          <p className="text-gray-600">
            No campaigns yet. Create your first campaign to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <div key={campaign.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold flex-1">{campaign.title}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${getStatusClass(campaign.status)}`}>
                  {campaign.status}
                </span>
              </div>

              {campaign.description && (
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {campaign.description.length > 100
                    ? campaign.description.substring(0, 100) + '...'
                    : campaign.description}
                </p>
              )}

              <div className="flex gap-8 py-4 my-4 border-t border-b border-gray-200">
                <div>
                  <div className="text-xs text-gray-500 uppercase mb-1">
                    Budget
                  </div>
                  <div className="text-lg font-bold text-primary">
                    ${campaign.budget.toLocaleString()}
                  </div>
                </div>
                {campaign.kol && (
                  <div>
                    <div className="text-xs text-gray-500 uppercase mb-1">
                      KOL
                    </div>
                    <div className="text-lg font-bold">{campaign.kol.name}</div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link to={`/campaigns/${campaign.id}/edit`} className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium text-center hover:bg-primary-dark transition-colors text-sm">
                  Edit
                </Link>
                <button onClick={() => handleDelete(campaign.id)} className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Campaigns;

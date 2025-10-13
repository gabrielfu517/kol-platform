import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

interface Invite {
  id: number;
  email: string;
  status: string;
  invited_by: number;
  expires_at: string;
  used_at: string | null;
  created_at: string;
}

const InfluencerInvites: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [invites, setInvites] = useState<Invite[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    
    fetchInvites();
  }, [user, navigate]);

  const fetchInvites = async () => {
    try {
      const response = await api.get('/invites');
      setInvites(response.data);
    } catch (error) {
      console.error('Error fetching invites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteSuccess('');
    setSending(true);

    try {
      const response = await api.post('/invites', { email: inviteEmail });
      setInviteSuccess(response.data.email_sent 
        ? 'Invitation sent successfully!' 
        : 'Invitation created (email failed to send)'
      );
      setInviteEmail('');
      
      // Refresh invites list
      await fetchInvites();
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setShowInviteModal(false);
        setInviteSuccess('');
      }, 2000);
    } catch (error: any) {
      setInviteError(error.response?.data?.error || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'expired':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="container">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            📧 Influencer Invitations
          </h1>
          <p className="text-gray-600">
            Invite influencers to join your platform and connect their Instagram accounts
          </p>
        </div>
        <button
          onClick={() => setShowInviteModal(true)}
          className="btn btn-primary"
        >
          + Send New Invite
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Total Invites</div>
          <div className="text-3xl font-bold text-gray-800">{invites.length}</div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Pending</div>
          <div className="text-3xl font-bold text-yellow-600">
            {invites.filter(i => i.status === 'pending').length}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Completed</div>
          <div className="text-3xl font-bold text-green-600">
            {invites.filter(i => i.status === 'completed').length}
          </div>
        </div>
        <div className="card">
          <div className="text-sm text-gray-600 mb-1">Expired</div>
          <div className="text-3xl font-bold text-red-600">
            {invites.filter(i => i.status === 'expired').length}
          </div>
        </div>
      </div>

      {/* Invites Table */}
      <div className="card">
        {invites.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-600 mb-4">No invitations sent yet</p>
            <button
              onClick={() => setShowInviteModal(true)}
              className="btn btn-primary"
            >
              Send Your First Invite
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Sent At</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Expires At</th>
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Used At</th>
                </tr>
              </thead>
              <tbody>
                {invites.map((invite) => (
                  <tr key={invite.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-800">{invite.email}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(invite.status)}`}>
                        {invite.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(invite.created_at)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDate(invite.expires_at)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {invite.used_at ? formatDate(invite.used_at) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-scale-in">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Send Influencer Invite
            </h2>
            <p className="text-gray-600 mb-6">
              Enter the influencer's email address to send them a registration invitation.
            </p>

            <form onSubmit={handleSendInvite}>
              <div className="form-group mb-6">
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="form-input"
                  placeholder="influencer@example.com"
                  required
                />
              </div>

              {inviteError && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 mb-4 text-sm">
                  {inviteError}
                </div>
              )}

              {inviteSuccess && (
                <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 mb-4 text-sm">
                  {inviteSuccess}
                </div>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-blue-800">
                  <strong>What happens next:</strong>
                </p>
                <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                  <li>Influencer receives an email with a registration link</li>
                  <li>They accept terms and connect their Instagram account</li>
                  <li>Their profile is automatically created with Instagram data</li>
                  <li>Link expires in 7 days</li>
                </ul>
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={sending}
                  className="btn btn-primary flex-1"
                >
                  {sending ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Sending...
                    </>
                  ) : (
                    'Send Invitation'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowInviteModal(false);
                    setInviteError('');
                    setInviteSuccess('');
                    setInviteEmail('');
                  }}
                  disabled={sending}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default InfluencerInvites;


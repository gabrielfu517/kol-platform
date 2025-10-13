import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const InstagramCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [message, setMessage] = useState('Connecting your Instagram account...');

  useEffect(() => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const token = localStorage.getItem('registration_token');

    if (error) {
      setStatus('error');
      setMessage('Instagram connection was cancelled or failed.');
      return;
    }

    if (!code) {
      setStatus('error');
      setMessage('No authorization code received from Instagram.');
      return;
    }

    if (!token) {
      setStatus('error');
      setMessage('Registration token not found. Please start over.');
      return;
    }

    // Exchange code for access token and get Instagram data
    api.post('/instagram/exchange-token', { code })
      .then(async (response) => {
        const { access_token, user_data } = response.data;

        // Complete registration with Instagram data
        const registrationResponse = await api.post('/invites/complete', {
          token,
          consent_given: true,
          instagram_data: {
            id: user_data.id,
            username: user_data.username,
            access_token,
            followers_count: user_data.followers_count || 0,
            profile_picture_url: user_data.profile_picture_url,
            biography: user_data.biography
          }
        });

        // Clear token from localStorage
        localStorage.removeItem('registration_token');

        setStatus('success');
        setMessage('Instagram connected successfully!');

        // Redirect to registration page to show completion step
        setTimeout(() => {
          navigate(`/influencer/register?token=${token}&step=complete`);
        }, 2000);
      })
      .catch((err) => {
        console.error('Instagram connection error:', err);
        setStatus('error');
        setMessage(err.response?.data?.error || 'Failed to connect Instagram account.');
      });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {status === 'processing' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto mb-6"></div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Connecting Instagram</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-500 text-6xl mb-6">✓</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Success!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <p className="text-sm text-gray-500">Redirecting...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="text-red-500 text-6xl mb-6">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Connection Failed</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  const token = localStorage.getItem('registration_token');
                  if (token) {
                    navigate(`/influencer/register?token=${token}`);
                  } else {
                    navigate('/');
                  }
                }}
                className="btn btn-primary flex-1"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn btn-secondary flex-1"
              >
                Go Home
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default InstagramCallback;


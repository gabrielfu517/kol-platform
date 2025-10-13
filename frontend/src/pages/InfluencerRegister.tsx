import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';

const InfluencerRegister: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  
  const [step, setStep] = useState<'consent' | 'instagram' | 'complete'>('consent');
  const [consentGiven, setConsentGiven] = useState(false);
  const [instagramData, setInstagramData] = useState<any>(null);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    if (!token) {
      setError('No registration token provided');
      setLoading(false);
      return;
    }

    // Verify token
    api.get(`/invites/verify/${token}`)
      .then((response) => {
        setTokenValid(true);
        setEmail(response.data.email);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.error || 'Invalid or expired token');
        setLoading(false);
      });
  }, [token]);

  const handleConsentSubmit = () => {
    if (!consentGiven) {
      setError('You must accept the terms to continue');
      return;
    }
    setStep('instagram');
  };

  const handleConnectInstagram = async () => {
    try {
      setConnecting(true);
      const response = await api.get('/instagram/auth-url');
      const authUrl = response.data.auth_url;
      
      // Store token in localStorage for callback
      localStorage.setItem('registration_token', token || '');
      
      // Redirect to Instagram OAuth
      window.location.href = authUrl;
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to connect Instagram');
      setConnecting(false);
    }
  };

  const handleSkipInstagram = async () => {
    try {
      setConnecting(true);
      
      // Complete registration without Instagram data
      const response = await api.post('/invites/complete', {
        token,
        consent_given: true,
        instagram_data: null
      });
      
      setStep('complete');
      setConnecting(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to complete registration');
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Verifying your invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Invalid Invitation</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn btn-primary"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 py-12">
      <div className="container max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            <div className={`flex items-center ${step === 'consent' ? 'text-primary' : 'text-green-500'}`}>
              <div className="w-10 h-10 rounded-full bg-current flex items-center justify-center text-white font-bold">
                {step === 'consent' ? '1' : '✓'}
              </div>
              <span className="ml-2 font-semibold">Consent</span>
            </div>
            <div className={`w-20 h-1 mx-4 ${step !== 'consent' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step === 'instagram' ? 'text-primary' : step === 'complete' ? 'text-green-500' : 'text-gray-400'}`}>
              <div className="w-10 h-10 rounded-full bg-current flex items-center justify-center text-white font-bold">
                {step === 'complete' ? '✓' : '2'}
              </div>
              <span className="ml-2 font-semibold">Connect</span>
            </div>
            <div className={`w-20 h-1 mx-4 ${step === 'complete' ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className={`flex items-center ${step === 'complete' ? 'text-primary' : 'text-gray-400'}`}>
              <div className="w-10 h-10 rounded-full bg-current flex items-center justify-center text-white font-bold">
                3
              </div>
              <span className="ml-2 font-semibold">Complete</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === 'consent' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-scale-in">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Welcome to KOL Platform! 🎉
            </h1>
            <p className="text-gray-600 mb-6">
              You've been invited to join as an influencer: <strong>{email}</strong>
            </p>

            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <h3 className="font-bold text-lg text-blue-900 mb-4">Terms & Data Usage Consent</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <p>By accepting this invitation, you agree to:</p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Allow us to access your Instagram profile information (username, followers count, media)</li>
                  <li>Let us display your profile and statistics to potential brand partners</li>
                  <li>Receive notifications about campaign opportunities</li>
                  <li>Our platform's terms of service and privacy policy</li>
                </ul>
                <p className="mt-4 text-xs text-blue-600">
                  <strong>Your Privacy Matters:</strong> We will never post on your behalf without explicit permission. 
                  You can revoke access or delete your account at any time.
                </p>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentGiven}
                  onChange={(e) => setConsentGiven(e.target.checked)}
                  className="mt-1 mr-3 h-5 w-5 text-primary focus:ring-primary rounded"
                />
                <span className="text-sm text-gray-700">
                  I have read and agree to the terms above. I consent to sharing my Instagram profile data 
                  with this platform for the purpose of connecting with brands.
                </span>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                onClick={handleConsentSubmit}
                disabled={!consentGiven}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Accept & Continue →
              </button>
              <button
                onClick={() => navigate('/')}
                className="btn btn-secondary"
              >
                Decline
              </button>
            </div>
          </div>
        )}

        {step === 'instagram' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 animate-scale-in">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              Connect Your Instagram Account 📸
            </h1>
            <p className="text-gray-600 mb-6">
              Connect your Instagram account to automatically import your profile data and statistics.
            </p>

            <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-8 text-white mb-6">
              <h3 className="font-bold text-xl mb-4">Why Connect Instagram?</h3>
              <ul className="space-y-2">
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Automatically sync your follower count and engagement metrics</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Show brands your authentic reach and audience</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Get matched with relevant campaigns faster</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">✓</span>
                  <span>Keep your profile up-to-date automatically</span>
                </li>
              </ul>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 mb-6">
                {error}
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={handleConnectInstagram}
                disabled={connecting}
                className="btn btn-primary flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {connecting ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Connecting...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📸</span>
                    Connect Instagram
                  </>
                )}
              </button>
              <button
                onClick={handleSkipInstagram}
                disabled={connecting}
                className="btn btn-secondary"
              >
                Skip for Now
              </button>
            </div>

            <p className="text-xs text-gray-500 text-center mt-6">
              You can connect your Instagram account later from your profile settings.
            </p>
          </div>
        )}

        {step === 'complete' && (
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center animate-scale-in">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              Registration Complete!
            </h1>
            <p className="text-gray-600 mb-8">
              Your influencer profile has been created successfully. 
              You'll be notified when brands are interested in working with you.
            </p>
            
            <div className="bg-green-50 rounded-lg p-6 mb-8">
              <h3 className="font-bold text-green-900 mb-2">What's Next?</h3>
              <ul className="text-left space-y-2 text-green-800">
                <li className="flex items-start">
                  <span className="mr-2">📧</span>
                  <span>Check your email for campaign opportunities</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">🔔</span>
                  <span>We'll notify you when brands want to collaborate</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">💼</span>
                  <span>Complete your profile to increase your chances</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => navigate('/')}
              className="btn btn-primary"
            >
              Go to Homepage
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default InfluencerRegister;


import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import KOLs from './pages/KOLs';
import KOLDetail from './pages/KOLDetail';
import KOLForm from './pages/KOLForm';
import Campaigns from './pages/Campaigns';
import CampaignForm from './pages/CampaignForm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/"
            element={
              <PrivateRoute>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <Dashboard />
                </div>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/kols"
            element={
              <PrivateRoute>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <KOLs />
                </div>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/kols/new"
            element={
              <PrivateRoute>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <KOLForm />
                </div>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/kols/:id"
            element={
              <PrivateRoute>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <KOLDetail />
                </div>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/kols/:id/edit"
            element={
              <PrivateRoute>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <KOLForm />
                </div>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/campaigns"
            element={
              <PrivateRoute>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <Campaigns />
                </div>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/campaigns/new"
            element={
              <PrivateRoute>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <CampaignForm />
                </div>
              </PrivateRoute>
            }
          />
          
          <Route
            path="/campaigns/:id/edit"
            element={
              <PrivateRoute>
                <div className="min-h-screen flex flex-col">
                  <Navbar />
                  <CampaignForm />
                </div>
              </PrivateRoute>
            }
          />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;

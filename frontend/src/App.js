import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/sonner';
import useAuthStore from './store/authStore';

// Screens
import Auth from './screens/Auth';
import Home from './screens/Home';
import AskAI from './screens/AskAI';
import JobCard from './screens/JobCard';
import URGAA from './screens/URGAA';
import Arjun from './screens/Arjun';
import Ignition from './screens/Ignition';
import Support from './screens/Support';
import Finance from './screens/Finance';
import Legal from './screens/Legal';
import Settings from './screens/Settings';

import './App.css';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }
  
  return children;
};

// Public Route wrapper (redirect to home if already authenticated)
const PublicRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route 
            path="/auth" 
            element={
              <PublicRoute>
                <Auth />
              </PublicRoute>
            } 
          />

          {/* Protected Routes */}
          <Route 
            path="/" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ask" 
            element={
              <ProtectedRoute>
                <AskAI />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/gstsaas" 
            element={
              <ProtectedRoute>
                <JobCard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/urgaa" 
            element={
              <ProtectedRoute>
                <URGAA />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/arjun" 
            element={
              <ProtectedRoute>
                <Arjun />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/ignition" 
            element={
              <ProtectedRoute>
                <Ignition />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/support" 
            element={
              <ProtectedRoute>
                <Support />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/finance" 
            element={
              <ProtectedRoute>
                <Finance />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/legal" 
            element={
              <ProtectedRoute>
                <Legal />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />

          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;

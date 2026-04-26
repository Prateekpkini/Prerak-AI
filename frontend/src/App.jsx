/**
 * App.jsx — Root Application with Routing
 * =========================================
 * Handles navigation between GitHub Analyzer (onboarding) and Dashboard views.
 */
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import GitHubAnalyzer from './components/GitHubAnalyzer';
import Dashboard from './components/Dashboard';

export default function App() {
  // Shared state: user data persists across routes after onboarding
  const [userData, setUserData] = useState(null);
  const [evaluationData, setEvaluationData] = useState(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-900 bg-mesh">
        <Routes>
          <Route
            path="/"
            element={
              <GitHubAnalyzer
                onComplete={(user, evaluation) => {
                  setUserData(user);
                  setEvaluationData(evaluation);
                }}
              />
            }
          />
          <Route
            path="/dashboard"
            element={
              userData ? (
                <Dashboard user={userData} evaluation={evaluationData} />
              ) : (
                <Navigate to="/" replace />
              )
            }
          />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

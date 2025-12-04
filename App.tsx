import React, { useState } from 'react';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import { AppState } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.LANDING);

  return (
    <>
      {appState === AppState.LANDING ? (
        <LandingPage onStart={() => setAppState(AppState.DASHBOARD)} />
      ) : (
        <Dashboard />
      )}
    </>
  );
};

export default App;

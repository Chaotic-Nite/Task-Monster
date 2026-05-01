import React from 'react';
import { BrowserRouter as Router, Navigate, Routes, Route, useParams } from 'react-router-dom';
import Home from './Pages/Home';
import QuestDetail from './Pages/QuestDetail';

function LegacyGroupRedirect() {
  const { id } = useParams();
  return <Navigate to={`/quest/${id}`} replace />;
}

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/quest/:id" element={<QuestDetail />} />
          <Route path="/group/:id" element={<LegacyGroupRedirect />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

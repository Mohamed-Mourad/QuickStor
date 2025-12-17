import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
// Note: Matches your lowercase "layout" folder
import AdminLayout from './components/layout/AdminLayout';
import AuthLayout from './components/layout/AuthLayout';

// Pages
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes (Login) */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<Login />} />
        </Route>

        {/* Protected Routes (Dashboard) */}
        <Route element={<AdminLayout />}>
          <Route path="/" element={<Dashboard />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
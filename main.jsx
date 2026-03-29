import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import ClientPortal from './pages/ClientPortal'
import AdminLogin from './pages/AdminLogin'
import AdminCRM from './pages/AdminCRM'
import AdminDashboard from './pages/AdminDashboard'
import AdminDemandes from './pages/AdminDemandes'
import AdminSuperAdmin from './pages/AdminSuperAdmin'
import AdminOnboarding from './pages/AdminOnboarding'
import FreelancePortal from './pages/FreelancePortal'
import AdminImmigration from './pages/AdminImmigration'
import ProtectedRoute from './components/ProtectedRoute'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* PUBLIC */}
        <Route path="/" element={<ClientPortal />} />
        <Route path="/freelance" element={<FreelancePortal />} />

        {/* AUTH */}
        <Route path="/admin" element={<AdminLogin />} />

        {/* ADMIN — protégé */}
        <Route path="/admin/crm" element={<ProtectedRoute><AdminCRM /></ProtectedRoute>} />
        <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/demandes" element={<ProtectedRoute><AdminDemandes /></ProtectedRoute>} />
        <Route path="/admin/immigration" element={<ProtectedRoute><AdminImmigration /></ProtectedRoute>} />
        <Route path="/admin/superadmin" element={<ProtectedRoute roles={['superadmin']}><AdminSuperAdmin /></ProtectedRoute>} />
        <Route path="/admin/onboarding" element={<ProtectedRoute roles={['superadmin','admin']}><AdminOnboarding /></ProtectedRoute>} />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
)

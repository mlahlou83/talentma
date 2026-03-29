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
  React.createElement(React.StrictMode, null,
    React.createElement(BrowserRouter, null,
      React.createElement(Routes, null,
        React.createElement(Route, { path: "/", element: React.createElement(ClientPortal) }),
        React.createElement(Route, { path: "/freelance", element: React.createElement(FreelancePortal) }),
        React.createElement(Route, { path: "/admin", element: React.createElement(AdminLogin) }),
        React.createElement(Route, { path: "/admin/crm", element: React.createElement(ProtectedRoute, null, React.createElement(AdminCRM)) }),
        React.createElement(Route, { path: "/admin/dashboard", element: React.createElement(ProtectedRoute, null, React.createElement(AdminDashboard)) }),
        React.createElement(Route, { path: "/admin/demandes", element: React.createElement(ProtectedRoute, null, React.createElement(AdminDemandes)) }),
        React.createElement(Route, { path: "/admin/immigration", element: React.createElement(ProtectedRoute, null, React.createElement(AdminImmigration)) }),
        React.createElement(Route, { path: "/admin/superadmin", element: React.createElement(ProtectedRoute, null, React.createElement(AdminSuperAdmin)) }),
        React.createElement(Route, { path: "/admin/onboarding", element: React.createElement(ProtectedRoute, null, React.createElement(AdminOnboarding)) }),
        React.createElement(Route, { path: "*", element: React.createElement(Navigate, { to: "/", replace: true }) })
      )
    )
  )
)

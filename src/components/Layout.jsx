import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '../lib/firebase'
import { FaChartBar, FaFileAlt, FaFolderOpen, FaChartLine, FaSignOutAlt, FaGavel } from 'react-icons/fa'
import toast from 'react-hot-toast'
import { ConfirmModal } from './Modal'

export default function Layout({ user }) {
  const location = useLocation()
  const navigate = useNavigate()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogoutClick = () => {
    setShowLogoutModal(true)
  }

  const handleLogoutConfirm = async () => {
    try {
      await signOut(auth)
      toast.success('Logged out successfully!')
      navigate('/')
    } catch (error) {
      console.error('Logout error:', error)
      toast.error('Failed to logout. Please try again.')
    }
  }

  const navItems = [
    { path: '/app/dashboard', label: 'Dashboard', icon: FaChartBar },
    { path: '/app/report-incident', label: 'Report Incident', icon: FaFileAlt },
    { path: '/app/cases', label: 'Case Management', icon: FaFolderOpen },
    { path: '/app/reports', label: 'Reports', icon: FaChartLine },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-600 to-green-500 shadow-lg border-b-4 border-emerald-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-emerald-600 font-bold text-xl shadow-lg">
                <FaGavel />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">MinSU Disciplinary System</h1>
                <p className="text-xs text-emerald-100">Mindoro State University</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-white">{user?.email}</p>
                <p className="text-xs text-emerald-100">Discipline Officer</p>
              </div>
              <button
                onClick={handleLogoutClick}
                className="flex items-center space-x-2 text-sm text-white hover:text-emerald-100 font-medium transition-colors bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30"
              >
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b-2 border-emerald-500 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {navItems.map((item) => {
              const IconComponent = item.icon
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 text-sm font-medium transition-colors ${
                    location.pathname === item.path
                      ? 'border-emerald-600 text-emerald-600'
                      : 'border-transparent text-gray-500 hover:text-emerald-600 hover:border-emerald-300'
                  }`}
                >
                  <IconComponent className="text-lg" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will be redirected to the landing page."
        confirmText="Yes, Logout"
        cancelText="Cancel"
        type="warning"
      />
    </div>
  )
}

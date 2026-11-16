import { useState, useEffect } from 'react'
import { getCurrentUser, logout } from './api'

export function useAuth() {
  const [currentUser, setCurrentUser] = useState(null)
  const [userRole, setUserRole] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('minsu_token')

    if (!token) {
      setUserRole(null)
      setLoading(false)
      return
    }

    getCurrentUser()
      .then((user) => {
        setCurrentUser(user)
        setUserRole(user.role)
      })
      .catch(() => {
        logout()
        setCurrentUser(null)
        setUserRole(null)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return { currentUser, userRole, loading }
}

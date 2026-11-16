import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('minsu_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── AUTH ────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password })
  if (data.token) {
    localStorage.setItem('minsu_token', data.token)
  }
  return data
}

export async function register(email, password, fullName, role) {
  const { data } = await api.post('/auth/register', { email, password, fullName, role })
  if (data.token) {
    localStorage.setItem('minsu_token', data.token)
  }
  return data
}

export async function getCurrentUser() {
  const { data } = await api.get('/auth/me')
  return data
}

export function logout() {
  localStorage.removeItem('minsu_token')
}

// ─── USERS ──────────────────────────────────────────────────────────────────

export async function fetchUsers(archived) {
  const { data } = await api.get('/users', { params: { archived } })
  return data
}

export async function addUser(userData) {
  const { data } = await api.post('/users', userData)
  return data
}

export async function updateUserRole(userId, role) {
  const { data } = await api.put(`/users/${userId}/role`, { role })
  return data
}

export async function archiveUser(userId) {
  const { data } = await api.put(`/users/${userId}/archive`)
  return data
}

export async function restoreUser(userId) {
  const { data } = await api.put(`/users/${userId}/restore`)
  return data
}

// ─── STUDENTS ───────────────────────────────────────────────────────────────

export async function fetchStudents() {
  const { data } = await api.get('/students')
  return data
}

export async function addStudent(studentData) {
  const { data } = await api.post('/students', studentData)
  return data
}

export async function updateStudent(id, studentData) {
  const { data } = await api.put(`/students/${id}`, studentData)
  return data
}

export async function deleteStudent(id) {
  const { data } = await api.delete(`/students/${id}`)
  return data
}

// ─── CASES ──────────────────────────────────────────────────────────────────

export async function fetchCases() {
  const { data } = await api.get('/cases')
  return data
}

export async function createCase(caseData) {
  const { data } = await api.post('/cases', caseData)
  return data
}

export async function updateCaseStatus(id, status) {
  const { data } = await api.put(`/cases/${id}/status`, { status })
  return data
}

export async function mergeCases() {
  const { data } = await api.post('/cases/merge')
  return data
}

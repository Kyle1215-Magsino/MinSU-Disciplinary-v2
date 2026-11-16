import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import pool from './db.js'
import { authMiddleware, adminOnly } from './middleware/auth.js'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000
const JWT_SECRET = process.env.JWT_SECRET || 'minsu-disciplinary-secret'

app.use(cors())
app.use(express.json())

// ─── AUTH ROUTES ──────────────────────────────────────────────────────────────

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' })
    }

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email])

    if (rows.length === 0) {
      return res.status(401).json({ error: 'No account found with this email address.' })
    }

    const user = rows[0]

    if (user.archived) {
      return res.status(403).json({ error: 'This account has been disabled' })
    }

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) {
      return res.status(401).json({ error: 'Incorrect password. Please try again.' })
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, fullName: user.full_name },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({ error: 'Login failed. Please try again.' })
  }
})

// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName, role } = req.body

    if (!email || !password || !fullName) {
      return res.status(400).json({ error: 'Email, password, and full name are required' })
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long!' })
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'This email is already registered.' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userRole = role || 'officer'

    const [result] = await pool.query(
      'INSERT INTO users (email, password, full_name, role, archived) VALUES (?, ?, ?, ?, FALSE)',
      [email, hashedPassword, fullName, userRole]
    )

    const token = jwt.sign(
      { id: result.insertId, email, role: userRole, fullName },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    res.status(201).json({
      token,
      user: { id: result.insertId, email, fullName, role: userRole },
    })
  } catch (error) {
    console.error('Register error:', error)
    res.status(500).json({ error: 'Registration failed. Please try again.' })
  }
})

// Get current user
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, full_name, role, archived FROM users WHERE id = ?', [req.user.id])

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' })
    }

    if (rows[0].archived) {
      return res.status(403).json({ error: 'This account has been disabled' })
    }

    const user = rows[0]
    res.json({
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    })
  } catch (error) {
    console.error('Get user error:', error)
    res.status(500).json({ error: 'Failed to fetch user' })
  }
})

// ─── USER MANAGEMENT ROUTES ──────────────────────────────────────────────────

// Get all users
app.get('/api/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { archived } = req.query
    let query = 'SELECT id, email, full_name, role, archived, created_at FROM users'
    let params = []

    if (archived === 'true') {
      query += ' WHERE archived = TRUE'
    } else if (archived === 'false') {
      query += ' WHERE archived = FALSE'
    }

    query += ' ORDER BY created_at DESC'

    const [rows] = await pool.query(query, params)
    res.json(rows.map(row => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      role: row.role,
      archived: !!row.archived,
      createdAt: row.created_at,
    })))
  } catch (error) {
    console.error('Fetch users error:', error)
    res.status(500).json({ error: 'Failed to load users' })
  }
})

// Add user
app.post('/api/users', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body

    if (!fullName || !email || !password) {
      return res.status(400).json({ error: 'Full name, email, and password are required' })
    }

    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'This email is already registered' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userRole = role || 'officer'

    const [result] = await pool.query(
      'INSERT INTO users (email, password, full_name, role, archived) VALUES (?, ?, ?, ?, FALSE)',
      [email, hashedPassword, fullName, userRole]
    )

    res.status(201).json({
      id: result.insertId,
      fullName,
      email,
      role: userRole,
      archived: false,
    })
  } catch (error) {
    console.error('Add user error:', error)
    res.status(500).json({ error: 'Failed to add user' })
  }
})

// Update user role
app.put('/api/users/:id/role', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { role } = req.body
    const { id } = req.params

    if (!['admin', 'officer', 'staff'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' })
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id])
    res.json({ message: 'User role updated successfully' })
  } catch (error) {
    console.error('Update role error:', error)
    res.status(500).json({ error: 'Failed to update user role' })
  }
})

// Archive user
app.put('/api/users/:id/archive', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params
    await pool.query('UPDATE users SET archived = TRUE, archived_at = NOW() WHERE id = ?', [id])
    res.json({ message: 'User archived successfully' })
  } catch (error) {
    console.error('Archive error:', error)
    res.status(500).json({ error: 'Failed to archive user' })
  }
})

// Restore user
app.put('/api/users/:id/restore', authMiddleware, adminOnly, async (req, res) => {
  try {
    const { id } = req.params
    await pool.query('UPDATE users SET archived = FALSE, archived_at = NULL WHERE id = ?', [id])
    res.json({ message: 'User restored successfully' })
  } catch (error) {
    console.error('Restore error:', error)
    res.status(500).json({ error: 'Failed to restore user' })
  }
})

// ─── STUDENT MANAGEMENT ROUTES ───────────────────────────────────────────────

// Get all students
app.get('/api/students', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM students ORDER BY created_at DESC')
    res.json(rows.map(row => ({
      id: row.id.toString(),
      student_id: row.student_id,
      student_name: row.student_name,
      email: row.email,
      phone: row.phone,
      course: row.course,
      year_level: row.year_level,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })))
  } catch (error) {
    console.error('Fetch students error:', error)
    res.status(500).json({ error: 'Failed to load students' })
  }
})

// Add student
app.post('/api/students', authMiddleware, async (req, res) => {
  try {
    const { student_id, student_name, email, phone, course, year_level } = req.body

    if (!student_id || !student_name) {
      return res.status(400).json({ error: 'Student ID and name are required' })
    }

    const [existing] = await pool.query('SELECT id FROM students WHERE student_id = ?', [student_id])
    if (existing.length > 0) {
      return res.status(400).json({ error: 'A student with this ID already exists' })
    }

    const [result] = await pool.query(
      'INSERT INTO students (student_id, student_name, email, phone, course, year_level) VALUES (?, ?, ?, ?, ?, ?)',
      [student_id, student_name, email, phone, course, year_level || '1st Year']
    )

    res.status(201).json({
      id: result.insertId.toString(),
      student_id,
      student_name,
      email,
      phone,
      course,
      year_level: year_level || '1st Year',
    })
  } catch (error) {
    console.error('Add student error:', error)
    res.status(500).json({ error: 'Failed to add student' })
  }
})

// Update student
app.put('/api/students/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { student_name, email, phone, course, year_level } = req.body

    await pool.query(
      'UPDATE students SET student_name = ?, email = ?, phone = ?, course = ?, year_level = ? WHERE id = ?',
      [student_name, email, phone, course, year_level, id]
    )

    res.json({ message: 'Student updated successfully' })
  } catch (error) {
    console.error('Update student error:', error)
    res.status(500).json({ error: 'Failed to update student' })
  }
})

// Delete student
app.delete('/api/students/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    await pool.query('DELETE FROM students WHERE id = ?', [id])
    res.json({ message: 'Student deleted successfully' })
  } catch (error) {
    console.error('Delete student error:', error)
    res.status(500).json({ error: 'Failed to delete student' })
  }
})

// ─── DISCIPLINARY CASES ROUTES ───────────────────────────────────────────────

// Get all cases
app.get('/api/cases', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM disciplinary_cases ORDER BY created_at DESC')

    // Fetch offense history for each case
    const casesWithHistory = await Promise.all(rows.map(async (row) => {
      const [offenses] = await pool.query(
        'SELECT * FROM case_offenses WHERE case_id = ? ORDER BY reported_at ASC',
        [row.id]
      )

      const offenseHistory = offenses.map(o => ({
        offense_level: o.offense_level,
        description: o.description,
        date_of_incident: o.date_of_incident ? o.date_of_incident.toISOString().split('T')[0] : null,
        location: o.location,
        reported_by: o.reported_by,
        reported_at: o.reported_at,
      }))

      return {
        id: row.id.toString(),
        case_number: row.case_number,
        student_name: row.student_name,
        student_id: row.student_id,
        violation_type: row.violation_type,
        description: row.description,
        date_of_incident: row.date_of_incident ? row.date_of_incident.toISOString().split('T')[0] : null,
        location: row.location,
        reported_by: row.reported_by,
        offense_count: row.offense_count,
        status: row.status,
        offense_history: offenseHistory,
        created_at: row.created_at,
        updated_at: row.updated_at,
      }
    }))

    res.json(casesWithHistory)
  } catch (error) {
    console.error('Fetch cases error:', error)
    res.status(500).json({ error: 'Failed to load cases' })
  }
})

// Create case (or update existing student's case)
app.post('/api/cases', authMiddleware, async (req, res) => {
  try {
    const {
      student_name, student_id, violation_type, description,
      date_of_incident, location, reported_by,
    } = req.body

    if (!student_name || !student_id || !violation_type || !description || !date_of_incident || !location || !reported_by) {
      return res.status(400).json({ error: 'All fields are required' })
    }

    // Check if student already has a case
    const [existing] = await pool.query('SELECT * FROM disciplinary_cases WHERE student_id = ?', [student_id])

    if (existing.length > 0) {
      // Update existing case - add new offense
      const existingCase = existing[0]
      const newOffenseCount = existingCase.offense_count + 1

      await pool.query(
        `UPDATE disciplinary_cases SET 
          violation_type = ?, description = ?, date_of_incident = ?, location = ?, 
          reported_by = ?, offense_count = ?, status = 'pending', updated_at = NOW() 
        WHERE id = ?`,
        [violation_type, description, date_of_incident, location, reported_by, newOffenseCount, existingCase.id]
      )

      // Add to offense history
      await pool.query(
        'INSERT INTO case_offenses (case_id, offense_level, description, date_of_incident, location, reported_by) VALUES (?, ?, ?, ?, ?, ?)',
        [existingCase.id, violation_type, description, date_of_incident, location, reported_by]
      )

      res.json({
        id: existingCase.id.toString(),
        case_number: existingCase.case_number,
        message: `Case updated! ${violation_type} added to Case #${existingCase.case_number}`,
      })
    } else {
      // Create new case
      const caseNumber = `CASE-${Date.now()}`
      const [result] = await pool.query(
        `INSERT INTO disciplinary_cases 
          (case_number, student_name, student_id, violation_type, description, date_of_incident, location, reported_by, offense_count, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 'pending')`,
        [caseNumber, student_name, student_id, violation_type, description, date_of_incident, location, reported_by]
      )

      // Add initial offense to history
      await pool.query(
        'INSERT INTO case_offenses (case_id, offense_level, description, date_of_incident, location, reported_by) VALUES (?, ?, ?, ?, ?, ?)',
        [result.insertId, violation_type, description, date_of_incident, location, reported_by]
      )

      res.status(201).json({
        id: result.insertId.toString(),
        case_number: caseNumber,
        message: `Incident reported successfully! Case #${caseNumber}`,
      })
    }
  } catch (error) {
    console.error('Create case error:', error)
    res.status(500).json({ error: 'Error submitting report. Please try again.' })
  }
})

// Update case status
app.put('/api/cases/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!['pending', 'active', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' })
    }

    await pool.query('UPDATE disciplinary_cases SET status = ?, updated_at = NOW() WHERE id = ?', [status, id])
    res.json({ message: `Case status updated to ${status}!` })
  } catch (error) {
    console.error('Update status error:', error)
    res.status(500).json({ error: 'Error updating case status' })
  }
})

// Merge duplicate cases
app.post('/api/cases/merge', authMiddleware, async (req, res) => {
  try {
    const [allCases] = await pool.query('SELECT * FROM disciplinary_cases ORDER BY created_at ASC')

    // Group by student_id
    const studentCases = {}
    allCases.forEach(c => {
      if (!studentCases[c.student_id]) studentCases[c.student_id] = []
      studentCases[c.student_id].push(c)
    })

    let mergedCount = 0

    for (const [studentId, caseList] of Object.entries(studentCases)) {
      if (caseList.length > 1) {
        const mainCase = caseList[0]
        const duplicates = caseList.slice(1)

        // Collect all offense history
        const allOffenses = []
        for (const c of caseList) {
          const [offenses] = await pool.query('SELECT * FROM case_offenses WHERE case_id = ?', [c.id])
          allOffenses.push(...offenses)
        }

        // Delete duplicate cases and their offenses (cascade)
        for (const dup of duplicates) {
          await pool.query('DELETE FROM disciplinary_cases WHERE id = ?', [dup.id])
        }

        // Update main case
        const latest = caseList[caseList.length - 1]
        await pool.query(
          'UPDATE disciplinary_cases SET offense_count = ?, violation_type = ?, description = ?, date_of_incident = ?, location = ?, reported_by = ?, status = ?, updated_at = NOW() WHERE id = ?',
          [caseList.length, latest.violation_type, latest.description, latest.date_of_incident, latest.location, latest.reported_by, latest.status, mainCase.id]
        )

        mergedCount++
      }
    }

    res.json({ message: `Successfully merged cases for ${mergedCount} students!`, merged: mergedCount })
  } catch (error) {
    console.error('Merge error:', error)
    res.status(500).json({ error: 'Failed to merge cases' })
  }
})

// ─── HEALTH CHECK ────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

// ─── START SERVER ────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})

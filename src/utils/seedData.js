import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Sample disciplinary cases data
const sampleCases = [
  {
    student_name: 'Juan Dela Cruz',
    student_id: '2024-00001',
    violation_type: '1st Offense',
    description: 'Caught cheating during midterm examination in Mathematics subject.',
    date_of_incident: '2024-01-15',
    location: 'Room 101, Main Building',
    reported_by: 'Prof. Maria Santos',
  },
  {
    student_name: 'Maria Garcia',
    student_id: '2024-00002',
    violation_type: '1st Offense',
    description: 'Disruptive behavior during class hours, repeatedly talking loudly and disturbing other students.',
    date_of_incident: '2024-01-20',
    location: 'Room 205, Science Building',
    reported_by: 'Prof. Jose Reyes',
  },
  {
    student_name: 'Pedro Santos',
    student_id: '2024-00003',
    violation_type: '1st Offense',
    description: 'Excessive absences without valid excuse. Missed 10 consecutive days of classes.',
    date_of_incident: '2024-02-01',
    location: 'Various Classrooms',
    reported_by: 'Prof. Ana Lopez',
  },
  {
    student_name: 'Sofia Ramos',
    student_id: '2024-00004',
    violation_type: '1st Offense',
    description: 'Wearing inappropriate attire not in accordance with university dress code policy.',
    date_of_incident: '2024-02-10',
    location: 'Campus Grounds',
    reported_by: 'Security Officer - Mr. Carlos Mendoza',
  },
  {
    student_name: 'Miguel Torres',
    student_id: '2024-00005',
    violation_type: '1st Offense',
    description: 'Used inappropriate language and showed disrespectful behavior towards faculty member.',
    date_of_incident: '2024-02-15',
    location: 'Faculty Office',
    reported_by: 'Prof. Linda Cruz',
  },
]

export async function seedDatabase() {
  try {
    console.log('Starting to seed database...')
    
    const token = localStorage.getItem('minsu_token')
    if (!token) {
      return { success: false, error: 'You must be logged in to seed data' }
    }

    let count = 0
    for (const caseData of sampleCases) {
      await axios.post(`${API_URL}/cases`, caseData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      console.log(`Added case for: ${caseData.student_name}`)
      count++
    }
    
    console.log('Database seeded successfully!')
    return { success: true, count }
  } catch (error) {
    console.error('Error seeding database:', error)
    return { success: false, error: error.response?.data?.error || error.message }
  }
}

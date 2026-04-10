import { useState } from 'react'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase'
import toast from 'react-hot-toast'
import { FaUser, FaIdCard, FaExclamationTriangle, FaFileAlt, FaCalendar, FaMapMarkerAlt, FaUserTie } from 'react-icons/fa'
import Modal from '../components/Modal'

export default function IncidentReport() {
  const [formData, setFormData] = useState({
    student_name: '',
    student_id: '',
    violation_type: '',
    description: '',
    date_of_incident: '',
    location: '',
    reported_by: '',
  })
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [generatedCaseNumber, setGeneratedCaseNumber] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const caseNumber = `CASE-${Date.now()}`
    
    try {
      await addDoc(collection(db, 'disciplinary_cases'), {
        case_number: caseNumber,
        ...formData,
        status: 'pending',
        created_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      })

      setGeneratedCaseNumber(caseNumber)
      setShowSuccessModal(true)
      toast.success(`Incident reported successfully! Case #${caseNumber}`)
      setFormData({
        student_name: '',
        student_id: '',
        violation_type: '',
        description: '',
        date_of_incident: '',
        location: '',
        reported_by: '',
      })
    } catch (error) {
      console.error('Error adding document:', error)
      toast.error('Error submitting report. Please try again.')
    }

    setLoading(false)
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900">Report Incident</h2>
        <p className="text-gray-600 mt-2">Submit a new disciplinary case report</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border-2 border-emerald-500 p-8 space-y-8">
        {/* Student Information Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <FaUser className="text-emerald-600" />
            <span>Student Information</span>
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="student_name"
                  value={formData.student_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="Enter student name"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Student ID *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaIdCard className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="e.g., 2024-00001"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Violation Details Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <FaExclamationTriangle className="text-emerald-600" />
            <span>Violation Details</span>
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Violation Type *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaExclamationTriangle className="text-gray-400" />
                </div>
                <select
                  name="violation_type"
                  value={formData.violation_type}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors appearance-none bg-white"
                  required
                >
                  <option value="">Select violation type</option>
                  <option value="Academic Dishonesty">Academic Dishonesty</option>
                  <option value="Misconduct">Misconduct</option>
                  <option value="Attendance Violation">Attendance Violation</option>
                  <option value="Dress Code Violation">Dress Code Violation</option>
                  <option value="Disrespect">Disrespect</option>
                  <option value="Bullying">Bullying</option>
                  <option value="Vandalism">Vandalism</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description *
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3 pointer-events-none">
                  <FaFileAlt className="text-gray-400" />
                </div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="5"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                  placeholder="Provide detailed description of the incident..."
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Incident Information Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <FaCalendar className="text-emerald-600" />
            <span>Incident Information</span>
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Date of Incident *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaCalendar className="text-gray-400" />
                </div>
                <input
                  type="date"
                  name="date_of_incident"
                  value={formData.date_of_incident}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Location *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaMapMarkerAlt className="text-gray-400" />
                </div>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                  placeholder="e.g., Room 101, Library"
                  required
                />
              </div>
            </div>
          </div>
        </div>

        {/* Reporter Information Section */}
        <div>
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center space-x-2">
            <FaUserTie className="text-emerald-600" />
            <span>Reporter Information</span>
          </h3>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Reported By *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUserTie className="text-gray-400" />
              </div>
              <input
                type="text"
                name="reported_by"
                value={formData.reported_by}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="Your name"
                required
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-4 pt-6 border-t-2 border-gray-200">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-lg"
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Submitting...</span>
              </span>
            ) : (
              'Submit Report'
            )}
          </button>
          <button
            type="button"
            onClick={() => setFormData({
              student_name: '',
              student_id: '',
              violation_type: '',
              description: '',
              date_of_incident: '',
              location: '',
              reported_by: '',
            })}
            className="px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-bold text-lg transition-all transform hover:scale-105"
          >
            Clear Form
          </button>
        </div>
      </form>

      {/* Success Modal */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title="Report Submitted Successfully"
        size="md"
      >
        <div className="text-center py-6">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-4">Incident Reported Successfully!</h3>
          <div className="bg-emerald-50 border-2 border-emerald-500 rounded-xl p-6 mb-6">
            <p className="text-sm text-gray-600 mb-2">Your Case Number:</p>
            <p className="text-3xl font-bold text-emerald-600">{generatedCaseNumber}</p>
          </div>
          <p className="text-gray-700 mb-6">
            The incident has been recorded in the system. The disciplinary officer will review the case shortly.
          </p>
          <button
            onClick={() => setShowSuccessModal(false)}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold transition-all transform hover:scale-105"
          >
            Close
          </button>
        </div>
      </Modal>
    </div>
  )
}

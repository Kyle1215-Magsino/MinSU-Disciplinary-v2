import { useState, useEffect } from 'react'
import { collection, query, orderBy, where, getDocs, doc, updateDoc } from 'firebase/firestore'
import { db } from '../lib/firebase'
import toast from 'react-hot-toast'
import Modal, { ConfirmModal } from '../components/Modal'
import DataTable from 'react-data-table-component'
import { FaEye, FaFilter, FaPrint } from 'react-icons/fa'

export default function CaseManagement() {
  const [cases, setCases] = useState([])
  const [filteredCases, setFilteredCases] = useState([])
  const [selectedCase, setSelectedCase] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingStatusUpdate, setPendingStatusUpdate] = useState(null)

  useEffect(() => {
    fetchCases()
  }, [])

  useEffect(() => {
    if (filter === 'all') {
      setFilteredCases(cases)
    } else {
      setFilteredCases(cases.filter(c => c.status === filter))
    }
  }, [filter, cases])

  const fetchCases = async () => {
    setLoading(true)
    try {
      const q = query(collection(db, 'disciplinary_cases'), orderBy('created_at', 'desc'))
      const querySnapshot = await getDocs(q)
      const casesData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      
      // Calculate violation count per student
      const studentViolations = {}
      casesData.forEach(case_ => {
        if (!studentViolations[case_.student_id]) {
          studentViolations[case_.student_id] = {
            count: 0,
            name: case_.student_name,
            cases: []
          }
        }
        studentViolations[case_.student_id].count++
        studentViolations[case_.student_id].cases.push(case_)
      })
      
      // Add violation count and eligibility to each case
      const casesWithViolationCount = casesData.map(case_ => ({
        ...case_,
        violationCount: studentViolations[case_.student_id].count,
        isEligibleForGoodMoral: studentViolations[case_.student_id].count === 1
      }))
      
      setCases(casesWithViolationCount)
      setFilteredCases(casesWithViolationCount)
    } catch (error) {
      console.error('Error fetching cases:', error)
    }
    setLoading(false)
  }

  const updateCaseStatus = async (caseId, newStatus) => {
    try {
      await updateDoc(doc(db, 'disciplinary_cases', caseId), {
        status: newStatus,
        updated_at: new Date()
      })
      toast.success(`Case status updated to ${newStatus}!`)
      fetchCases()
      setShowDetailsModal(false)
      setSelectedCase(null)
    } catch (error) {
      console.error('Error updating case:', error)
      toast.error('Error updating case status. Please try again.')
    }
  }

  const handleStatusChange = (caseId, newStatus) => {
    setPendingStatusUpdate({ caseId, newStatus })
    setShowConfirmModal(true)
  }

  const confirmStatusChange = () => {
    if (pendingStatusUpdate) {
      updateCaseStatus(pendingStatusUpdate.caseId, pendingStatusUpdate.newStatus)
      setPendingStatusUpdate(null)
    }
  }

  const openCaseDetails = (case_) => {
    setSelectedCase(case_)
    setShowDetailsModal(true)
  }

  const printGoodMoralCertificate = (studentCase) => {
    const printWindow = window.open('', '_blank')
    const currentDate = new Date().toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Good Moral Certificate - ${studentCase.student_name}</title>
          <style>
            @page {
              size: A4;
              margin: 0;
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: 'Times New Roman', serif;
              padding: 60px 80px;
              background: white;
              color: #000;
            }
            .certificate {
              border: 8px double #10b981;
              padding: 40px;
              position: relative;
              min-height: 90vh;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
              border-bottom: 3px solid #10b981;
              padding-bottom: 20px;
            }
            .logo {
              width: 100px;
              height: 100px;
              margin: 0 auto 15px;
              background: #10b981;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 48px;
              color: white;
            }
            .university-name {
              font-size: 28px;
              font-weight: bold;
              color: #10b981;
              margin-bottom: 5px;
            }
            .campus-name {
              font-size: 18px;
              color: #666;
              margin-bottom: 10px;
            }
            .office-name {
              font-size: 16px;
              color: #888;
              font-style: italic;
            }
            .certificate-title {
              text-align: center;
              font-size: 36px;
              font-weight: bold;
              color: #10b981;
              margin: 40px 0 30px;
              text-transform: uppercase;
              letter-spacing: 3px;
            }
            .content {
              text-align: justify;
              line-height: 2;
              font-size: 16px;
              margin: 30px 0;
            }
            .student-name {
              font-size: 24px;
              font-weight: bold;
              color: #10b981;
              text-decoration: underline;
              text-align: center;
              margin: 20px 0;
            }
            .student-id {
              text-align: center;
              font-size: 18px;
              color: #666;
              margin-bottom: 30px;
            }
            .footer {
              margin-top: 60px;
              display: flex;
              justify-content: space-between;
            }
            .signature-block {
              text-align: center;
              width: 45%;
            }
            .signature-line {
              border-top: 2px solid #000;
              margin-top: 60px;
              padding-top: 10px;
              font-weight: bold;
            }
            .signature-title {
              font-size: 14px;
              color: #666;
              margin-top: 5px;
            }
            .date {
              text-align: right;
              margin-top: 40px;
              font-style: italic;
            }
            .seal {
              position: absolute;
              bottom: 100px;
              left: 80px;
              width: 120px;
              height: 120px;
              border: 3px solid #10b981;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 12px;
              text-align: center;
              color: #10b981;
              font-weight: bold;
              transform: rotate(-15deg);
            }
            @media print {
              body {
                padding: 40px 60px;
              }
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <div class="logo">⚖️</div>
              <div class="university-name">MINDORO STATE UNIVERSITY</div>
              <div class="campus-name">Bongabong Campus</div>
              <div class="office-name">Office of Student Affairs</div>
            </div>
            
            <div class="certificate-title">Certificate of Good Moral Character</div>
            
            <div class="content">
              <p style="text-indent: 50px;">
                This is to certify that <strong>${studentCase.student_name}</strong>, 
                a bonafide student of Mindoro State University - Bongabong Campus, 
                has demonstrated good moral character and conduct during their stay in this institution.
              </p>
            </div>
            
            <div class="student-name">${studentCase.student_name}</div>
            <div class="student-id">Student ID: ${studentCase.student_id}</div>
            
            <div class="content">
              <p style="text-indent: 50px;">
                Based on our records, the above-named student has maintained satisfactory 
                disciplinary standing and has shown respect for university rules and regulations. 
                This certificate is issued upon request for whatever legal purpose it may serve.
              </p>
            </div>
            
            <div class="date">
              Issued this ${currentDate}
            </div>
            
            <div class="footer">
              <div class="signature-block">
                <div class="signature-line">_______________________</div>
                <div class="signature-title">Discipline Officer</div>
              </div>
              <div class="signature-block">
                <div class="signature-line">_______________________</div>
                <div class="signature-title">Director, Student Affairs</div>
              </div>
            </div>
            
            <div class="seal">
              OFFICIAL<br/>SEAL<br/>MinSU
            </div>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px;">
            <button onclick="window.print()" style="padding: 12px 24px; background: #10b981; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer; margin-right: 10px;">
              Print Certificate
            </button>
            <button onclick="window.close()" style="padding: 12px 24px; background: #6b7280; color: white; border: none; border-radius: 8px; font-size: 16px; cursor: pointer;">
              Close
            </button>
          </div>
        </body>
      </html>
    `)
    printWindow.document.close()
    toast.success('Good Moral Certificate opened in new window')
  }

  const columns = [
    {
      name: 'Case Number',
      selector: row => row.case_number,
      sortable: true,
      width: '160px',
      cell: row => <span className="font-semibold text-gray-900">{row.case_number}</span>
    },
    {
      name: 'Student Name',
      selector: row => row.student_name,
      sortable: true,
      grow: 1,
    },
    {
      name: 'Violation Type',
      selector: row => row.violation_type,
      sortable: true,
      grow: 1,
    },
    {
      name: 'Count',
      selector: row => row.violationCount,
      sortable: true,
      width: '90px',
      center: true,
      cell: row => (
        <span className={`px-2 py-1 rounded-full text-sm font-bold ${
          row.violationCount === 1 
            ? 'bg-green-100 text-green-800' 
            : row.violationCount === 2 
            ? 'bg-yellow-100 text-yellow-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.violationCount}
        </span>
      ),
    },
    {
      name: 'Good Moral',
      selector: row => row.isEligibleForGoodMoral,
      sortable: true,
      width: '140px',
      center: true,
      cell: row => (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
          row.isEligibleForGoodMoral 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {row.isEligibleForGoodMoral ? '✓ Eligible' : '✗ Not Eligible'}
        </span>
      ),
    },
    {
      name: 'Status',
      selector: row => row.status,
      sortable: true,
      width: '110px',
      center: true,
      cell: row => (
        <span
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${
            row.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : row.status === 'active'
              ? 'bg-orange-100 text-orange-800'
              : 'bg-green-100 text-green-800'
          }`}
        >
          {row.status}
        </span>
      ),
    },
    {
      name: 'Actions',
      width: '100px',
      center: true,
      cell: row => (
        <button
          onClick={() => openCaseDetails(row)}
          className="flex items-center space-x-1 px-3 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          title="View Details"
        >
          <FaEye />
          <span className="text-sm font-medium">View</span>
        </button>
      ),
    },
  ]

  const customStyles = {
    table: {
      style: {
        width: '100%',
      },
    },
    headRow: {
      style: {
        backgroundColor: '#f9fafb',
        borderBottom: '2px solid #e5e7eb',
        fontWeight: '600',
        fontSize: '13px',
        color: '#374151',
        minHeight: '48px',
      },
    },
    rows: {
      style: {
        fontSize: '14px',
        minHeight: '60px',
        '&:hover': {
          backgroundColor: '#f3f4f6',
        },
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #e5e7eb',
        minHeight: '56px',
      },
    },
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Case Management</h2>
          <p className="text-gray-600 mt-1">Review and manage disciplinary cases</p>
        </div>
        <div className="flex items-center space-x-2">
          <FaFilter className="text-gray-500" />
          {['all', 'pending', 'active', 'resolved'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === status
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* DataTable */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-emerald-500 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : filteredCases.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <p className="text-gray-500 font-medium">No cases found</p>
            <p className="text-sm text-gray-400 mt-2">
              {filter === 'all' ? 'No cases have been reported yet' : `No ${filter} cases found`}
            </p>
          </div>
        ) : (
          <div className="w-full">
            <DataTable
              columns={columns}
              data={filteredCases}
              customStyles={customStyles}
              pagination
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30, 50]}
              highlightOnHover
              responsive
              noDataComponent={<div className="p-4">No records found</div>}
            />
          </div>
        )}
      </div>

      {/* Case Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false)
          setSelectedCase(null)
        }}
        title="Case Details"
        size="lg"
      >
        {selectedCase && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Case Number</p>
                  <p className="text-xl font-bold text-gray-900">{selectedCase.case_number}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Status</p>
                  <span
                    className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                      selectedCase.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : selectedCase.status === 'active'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {selectedCase.status.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Violations</p>
                  <span className={`inline-block px-4 py-2 rounded-full text-lg font-bold mt-1 ${
                    selectedCase.violationCount === 1 
                      ? 'bg-green-100 text-green-800' 
                      : selectedCase.violationCount === 2 
                      ? 'bg-yellow-100 text-yellow-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedCase.violationCount} {selectedCase.violationCount === 1 ? 'Violation' : 'Violations'}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-600">Good Moral Status</p>
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold mt-1 ${
                    selectedCase.isEligibleForGoodMoral 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedCase.isEligibleForGoodMoral ? '✓ Eligible' : '✗ Not Eligible'}
                  </span>
                </div>
              </div>
            </div>

            {!selectedCase.isEligibleForGoodMoral && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">⚠️</span>
                  <div>
                    <h4 className="font-bold text-red-900 mb-1">Good Moral Certificate Not Available</h4>
                    <p className="text-sm text-red-700">
                      This student has {selectedCase.violationCount} violations and is not eligible for a Good Moral Certificate. 
                      Students must have only 1 violation to be eligible.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {selectedCase.isEligibleForGoodMoral && (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <span className="text-2xl">✅</span>
                    <div>
                      <h4 className="font-bold text-green-900 mb-1">Eligible for Good Moral Certificate</h4>
                      <p className="text-sm text-green-700">
                        This student has only 1 violation and is eligible to receive a Good Moral Certificate.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => printGoodMoralCertificate(selectedCase)}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all transform hover:scale-105 shadow-lg"
                  >
                    <FaPrint />
                    <span>Print Certificate</span>
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Student Name</p>
                <p className="text-lg font-semibold text-gray-900">{selectedCase.student_name}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Student ID</p>
                <p className="text-lg font-semibold text-gray-900">{selectedCase.student_id}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Violation Type</p>
              <p className="text-lg font-semibold text-gray-900">{selectedCase.violation_type}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500 mb-2">Description</p>
              <p className="text-gray-900 leading-relaxed">{selectedCase.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Date of Incident</p>
                <p className="text-gray-900 font-medium">{selectedCase.date_of_incident}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-500 mb-1">Location</p>
                <p className="text-gray-900 font-medium">{selectedCase.location}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-500 mb-1">Reported By</p>
              <p className="text-gray-900 font-medium">{selectedCase.reported_by}</p>
            </div>

            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm font-medium text-gray-700 mb-4">Update Case Status</p>
              <div className="flex space-x-3">
                {selectedCase.status !== 'active' && (
                  <button
                    onClick={() => handleStatusChange(selectedCase.id, 'active')}
                    className="flex-1 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    🔄 Mark as Active
                  </button>
                )}
                {selectedCase.status !== 'resolved' && (
                  <button
                    onClick={() => handleStatusChange(selectedCase.id, 'resolved')}
                    className="flex-1 px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold transition-colors"
                  >
                    ✅ Mark as Resolved
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirm Status Change Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false)
          setPendingStatusUpdate(null)
        }}
        onConfirm={confirmStatusChange}
        title="Confirm Status Change"
        message={`Are you sure you want to change the case status to "${pendingStatusUpdate?.newStatus}"? This action will be recorded in the system.`}
        confirmText="Yes, Update Status"
        cancelText="Cancel"
        type="info"
      />
    </div>
  )
}

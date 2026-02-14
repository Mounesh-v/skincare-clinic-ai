import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Eye, Edit2, Trash2, Download, UserCheck, UserX, Award } from 'lucide-react';
import DataTable from '../../../components/admin/DataTable';
import toast from 'react-hot-toast';

const DoctorList = () => {
  const navigate = useNavigate();

  const [doctors, setDoctors] = useState([
    {
      id: 'DOC-001',
      name: 'Dr. Priya Sharma',
      image: '/api/placeholder/100/100',
      specialization: 'Dermatologist',
      qualification: 'MBBS, MD (Dermatology)',
      experience: '15 years',
      rating: 4.9,
      consultations: 1250,
      status: 'Active',
      email: 'priya.sharma@clinic.com',
      phone: '+91 98765 43210',
      availability: 'Mon-Sat',
      languages: ['English', 'Hindi', 'Punjabi'],
    },
    {
      id: 'DOC-002',
      name: 'Dr. Rajesh Kumar',
      image: '/api/placeholder/100/100',
      specialization: 'Cosmetologist',
      qualification: 'MBBS, MD (Dermatology), Fellowship in Cosmetic Dermatology',
      experience: '12 years',
      rating: 4.8,
      consultations: 980,
      status: 'Active',
      email: 'rajesh.kumar@clinic.com',
      phone: '+91 98765 43211',
      availability: 'Mon-Fri',
      languages: ['English', 'Hindi'],
    },
    {
      id: 'DOC-003',
      name: 'Dr. Anita Desai',
      image: '/api/placeholder/100/100',
      specialization: 'Trichologist',
      qualification: 'MBBS, MD (Dermatology), Trichology Specialist',
      experience: '10 years',
      rating: 4.7,
      consultations: 756,
      status: 'Active',
      email: 'anita.desai@clinic.com',
      phone: '+91 98765 43212',
      availability: 'Tue-Sat',
      languages: ['English', 'Hindi', 'Marathi'],
    },
    {
      id: 'DOC-004',
      name: 'Dr. Vikram Singh',
      image: '/api/placeholder/100/100',
      specialization: 'Aesthetic Physician',
      qualification: 'MBBS, DNB (Dermatology)',
      experience: '8 years',
      rating: 4.6,
      consultations: 542,
      status: 'On Leave',
      email: 'vikram.singh@clinic.com',
      phone: '+91 98765 43213',
      availability: 'Mon-Thu',
      languages: ['English', 'Hindi'],
    },
    {
      id: 'DOC-005',
      name: 'Dr. Neha Patel',
      image: '/api/placeholder/100/100',
      specialization: 'Dermatologist',
      qualification: 'MBBS, MD (Dermatology)',
      experience: '6 years',
      rating: 4.5,
      consultations: 423,
      status: 'Inactive',
      email: 'neha.patel@clinic.com',
      phone: '+91 98765 43214',
      availability: 'Mon-Fri',
      languages: ['English', 'Hindi', 'Gujarati'],
    },
  ]);

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this doctor?')) {
      setDoctors(doctors.filter(doc => doc.id !== id));
      toast.success('Doctor deleted successfully');
    }
  };

  const handleToggleStatus = (id, currentStatus) => {
    const newStatus = currentStatus === 'Active' ? 'Inactive' : 'Active';
    setDoctors(doctors.map(doc => 
      doc.id === id ? { ...doc, status: newStatus } : doc
    ));
    toast.success(`Doctor ${newStatus === 'Active' ? 'activated' : 'deactivated'} successfully`);
  };

  const handleExport = () => {
    toast.success('Exporting doctor data...');
  };

  const columns = [
    {
      header: 'Doctor',
      accessor: 'name',
      render: (value, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image}
            alt={value}
            className="w-12 h-12 rounded-full object-cover border-2 border-emerald-100"
          />
          <div>
            <div className="font-semibold text-slate-900">{value}</div>
            <div className="text-sm text-slate-500">{row.specialization}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Qualification',
      accessor: 'qualification',
      render: (value) => (
        <span className="text-sm text-slate-700 max-w-xs block truncate" title={value}>
          {value}
        </span>
      ),
    },
    {
      header: 'Experience',
      accessor: 'experience',
      render: (value) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {value}
        </span>
      ),
    },
    {
      header: 'Rating',
      accessor: 'rating',
      render: (value, row) => (
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <span className="text-yellow-500">⭐</span>
            <span className="font-semibold text-slate-900">{value}</span>
          </div>
          <span className="text-xs text-slate-500">({row.consultations})</span>
        </div>
      ),
    },
    {
      header: 'Consultations',
      accessor: 'consultations',
      render: (value) => (
        <span className="font-semibold text-slate-900">{value.toLocaleString()}</span>
      ),
    },
    {
      header: 'Availability',
      accessor: 'availability',
      render: (value) => (
        <span className="text-sm text-slate-700">{value}</span>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const statusColors = {
          'Active': 'bg-green-100 text-green-700',
          'Inactive': 'bg-slate-100 text-slate-700',
          'On Leave': 'bg-yellow-100 text-yellow-700',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[value]}`}>
            {value}
          </span>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Management</h1>
          <p className="text-slate-600 mt-1">Manage all doctors and their profiles</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Export</span>
          </button>
          <button
            onClick={() => navigate('/admin/doctors/create')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all shadow-lg"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Doctor</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Doctors</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{doctors.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <Award className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Active Doctors</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {doctors.filter(d => d.status === 'Active').length}
              </p>
            </div>
            <UserCheck className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Consultations</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {doctors.reduce((sum, d) => sum + d.consultations, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-3xl">👨‍⚕️</div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {(doctors.reduce((sum, d) => sum + d.rating, 0) / doctors.length).toFixed(1)} ⭐
              </p>
            </div>
            <div className="text-3xl">🏆</div>
          </div>
        </div>
      </div>

      {/* Doctors Table */}
      <DataTable
        columns={columns}
        data={doctors}
        onRowClick={(row) => navigate(`/admin/doctors/${row.id}`)}
        searchPlaceholder="Search doctors by name, specialization, or qualification..."
        actions={(row) => (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/doctors/${row.id}`);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4 text-slate-600" />
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/doctors/${row.id}/edit`);
              }}
              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
              title="Edit"
            >
              <Edit2 className="w-4 h-4 text-blue-600" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                handleToggleStatus(row.id, row.status);
              }}
              className={`p-2 hover:${row.status === 'Active' ? 'bg-red-50' : 'bg-green-50'} rounded-lg transition-colors`}
              title={row.status === 'Active' ? 'Deactivate' : 'Activate'}
            >
              {row.status === 'Active' ? (
                <UserX className="w-4 h-4 text-red-600" />
              ) : (
                <UserCheck className="w-4 h-4 text-green-600" />
              )}
            </button>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDelete(row.id);
              }}
              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </>
        )}
      />
    </div>
  );
};

export default DoctorList;
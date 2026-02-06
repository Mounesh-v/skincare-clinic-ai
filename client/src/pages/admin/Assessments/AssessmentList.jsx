import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, Download, CheckCircle, Clock, XCircle } from 'lucide-react';
import DataTable from '../../../components/admin/DataTable';
import toast from 'react-hot-toast';

const AssessmentList = () => {
  const navigate = useNavigate();

  const [assessments, setAssessments] = useState([
    {
      id: 'ASS-001',
      userName: 'Priya Sharma',
      email: 'priya@example.com',
      skinType: 'Combination',
      concerns: ['Acne', 'Dark Spots'],
      status: 'Completed',
      date: '2024-02-06',
      confidence: 95,
    },
    {
      id: 'ASS-002',
      userName: 'Rahul Kumar',
      email: 'rahul@example.com',
      skinType: 'Oily',
      concerns: ['Acne', 'Large Pores'],
      status: 'In Progress',
      date: '2024-02-06',
      confidence: 88,
    },
    {
      id: 'ASS-003',
      userName: 'Anita Desai',
      email: 'anita@example.com',
      skinType: 'Dry',
      concerns: ['Aging', 'Fine Lines'],
      status: 'Completed',
      date: '2024-02-05',
      confidence: 92,
    },
    {
      id: 'ASS-004',
      userName: 'Vikram Singh',
      email: 'vikram@example.com',
      skinType: 'Sensitive',
      concerns: ['Redness', 'Irritation'],
      status: 'Pending Review',
      date: '2024-02-05',
      confidence: 85,
    },
    {
      id: 'ASS-005',
      userName: 'Neha Patel',
      email: 'neha@example.com',
      skinType: 'Normal',
      concerns: ['Dullness'],
      status: 'Completed',
      date: '2024-02-04',
      confidence: 97,
    },
  ]);

  const handleExport = () => {
    toast.success('Exporting assessment data...');
  };

  const columns = [
    {
      header: 'Assessment ID',
      accessor: 'id',
      render: (value) => (
        <span className="font-mono text-sm font-semibold text-slate-900">{value}</span>
      ),
    },
    {
      header: 'User',
      accessor: 'userName',
      render: (value, row) => (
        <div>
          <div className="font-medium text-slate-900">{value}</div>
          <div className="text-sm text-slate-500">{row.email}</div>
        </div>
      ),
    },
    {
      header: 'Skin Type',
      accessor: 'skinType',
      render: (value) => (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
          {value}
        </span>
      ),
    },
    {
      header: 'Concerns',
      accessor: 'concerns',
      render: (value) => (
        <div className="flex flex-wrap gap-1">
          {value.map((concern, idx) => (
            <span
              key={idx}
              className="px-2 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700"
            >
              {concern}
            </span>
          ))}
        </div>
      ),
    },
    {
      header: 'Confidence',
      accessor: 'confidence',
      render: (value) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-slate-200 rounded-full h-2 max-w-[80px]">
            <div
              className={`h-2 rounded-full ${
                value >= 90 ? 'bg-green-500' : value >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${value}%` }}
            ></div>
          </div>
          <span className="text-sm font-semibold text-slate-900">{value}%</span>
        </div>
      ),
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (value) => {
        const statusColors = {
          'Completed': 'bg-green-100 text-green-700',
          'In Progress': 'bg-blue-100 text-blue-700',
          'Pending Review': 'bg-yellow-100 text-yellow-700',
          'Rejected': 'bg-red-100 text-red-700',
        };
        return (
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[value]}`}>
            {value}
          </span>
        );
      },
    },
    {
      header: 'Date',
      accessor: 'date',
      render: (value) => (
        <span className="text-sm text-slate-600">{value}</span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Skin Assessments</h1>
          <p className="text-slate-600 mt-1">Review and manage customer skin assessments</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Download className="w-5 h-5" />
            <span className="font-medium">Export</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Total Assessments</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">{assessments.length}</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-green-600 mt-1">
                {assessments.filter(a => a.status === 'Completed').length}
              </p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {assessments.filter(a => a.status === 'In Progress').length}
              </p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600 mt-1">
                {assessments.filter(a => a.status === 'Pending Review').length}
              </p>
            </div>
            <XCircle className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Assessments Table */}
      <DataTable
        columns={columns}
        data={assessments}
        onRowClick={(row) => navigate(`/admin/assessments/${row.id}`)}
        searchPlaceholder="Search assessments by ID, user, or skin type..."
        actions={(row) => (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/admin/assessments/${row.id}`);
              }}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye className="w-4 h-4 text-slate-600" />
            </button>
            
            {row.status === 'Pending Review' && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.success('Assessment approved');
                  }}
                  className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                  title="Approve"
                >
                  <CheckCircle className="w-4 h-4 text-green-600" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toast.error('Assessment rejected');
                  }}
                  className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Reject"
                >
                  <XCircle className="w-4 h-4 text-red-600" />
                </button>
              </>
            )}
          </>
        )}
      />
    </div>
  );
};

export default AssessmentList;
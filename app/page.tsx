// app/page.tsx
"use client";

import { useState, useEffect, useCallback } from 'react';
import { Patient, PatientsApiResponse } from '@/types/patient';
import { Search, List, LayoutGrid, ChevronRight, ChevronLeft, ArrowUpDown, Download } from 'lucide-react';
import { MapPin, Phone, Mail } from 'lucide-react';
export default function PatientDirectory() {
  const [view, setView] = useState<'table' | 'card'>('table');
  const [data, setData] = useState<PatientsApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [issueFilter, setIssueFilter] = useState('');
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(1);

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: '12',
        search: debouncedSearch,
        issue: issueFilter,
        sortBy,
        sortOrder
      });
      const res = await fetch(`/api/patients?${query.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch patients');
      const result = await res.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, issueFilter, sortBy, sortOrder]);

  useEffect(() => {
    fetchPatients();
  }, [fetchPatients]);

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <header className="bg-blue-600 text-white p-8 relative overflow-hidden h-30 flex flex-col justify-end">
        <div className="z-10 container mx-auto px-4">
          <h1 className="text-3xl font-bold">Patient Directory</h1>
          <p className="text-blue-100 mt-2">{data?.total || 0} Patient Found</p>
        </div>
        {/* Decorative background crosses */}
        <div className="absolute top-0 right-0 opacity-20 pointer-events-none">
          <LayoutGrid size={200} />
        </div>
      </header>

      <div className="container mx-auto px-4 -mt-1 pb-12">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Tabs & Top Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between p-4 border-b gap-4">
            <div className="flex bg-gray-100 p-1 rounded-lg w-fit">
              <button 
                onClick={() => setView('table')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${view === 'table' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                <List size={18} /> Table View
              </button>
              <button 
                onClick={() => setView('card')}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${view === 'card' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                <LayoutGrid size={18} /> Card View
              </button>
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
               <span className="text-blue-600">Active Filters: {issueFilter ? 1 : 0}</span>
            </div>
          </div>

          {/* Search & Sort Bar */}
          <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
            <div className="md:col-span-6 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search by Name or ID..."
                className="w-full pl-10 pr-4 py-2 border rounded-lg outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="md:col-span-3">
              <select 
                className="w-full p-2 border rounded-lg text-gray-600 outline-none"
                value={issueFilter}
                onChange={(e) => setIssueFilter(e.target.value)}
              >
                <option value="">All Medical Issues</option>
                <option value="fever">Fever</option>
                <option value="headache">Headache</option>
                <option value="sinusitis">Sinusitis</option>
                <option value="rash">Rash</option>
                <option value="sprained ankle">Sprained Ankle</option>
              </select>
            </div>

            <div className="md:col-span-3 flex justify-end gap-2">
              <button onClick={() => toggleSort('name')} className="flex items-center gap-1 text-sm border p-2 rounded hover:bg-gray-50 transition">
                Sort by Name <ArrowUpDown size={14} />
              </button>
              <button className="flex items-center gap-1 text-sm border p-2 rounded bg-gray-50 text-gray-700">
                PDF <Download size={14} />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="min-h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center p-20 text-blue-600">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : error ? (
              <div className="p-20 text-center text-red-500 font-medium">{error}</div>
            ) : view === 'table' ? (
              <TableView patients={data?.patients || []} />
            ) : (
              <CardView patients={data?.patients || []} />
            )}
          </div>

          {/* Pagination */}
        {data && (
  <div className="p-6 border-t flex flex-wrap items-center justify-center gap-2">
    <button 
      disabled={page === 1}
      onClick={() => setPage(p => Math.max(1, p - 1))}
      className="flex items-center px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
    >
      <ChevronLeft size={16} /> Previous
    </button>
    
    {(() => {
      const maxButtons = 5;
      const totalPages = data.totalPages;
      
      // Calculate start and end numbers
      let startPage = Math.max(1, page - Math.floor(maxButtons / 2));
      let endPage = startPage + maxButtons - 1;

      // Adjust if we hit the end
      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxButtons + 1);
      }

      const pages = [];
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }

      return pages.map((pageNum) => (
        <button
          key={pageNum}
          onClick={() => setPage(pageNum)}
          className={`w-8 h-8 rounded flex items-center justify-center border transition ${
            page === pageNum 
              ? 'bg-blue-600 text-white border-blue-600' 
              : 'hover:bg-gray-50 text-gray-600'
          }`}
        >
          {pageNum}
        </button>
      ));
    })()}
    
    <button 
      disabled={page === data.totalPages}
      onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
      className="flex items-center px-3 py-1 rounded border hover:bg-gray-50 disabled:opacity-50"
    >
      Next <ChevronRight size={16} />
    </button>
  </div>
)}
        
        </div>
      </div>
    </main>
  );
}

// Sub-component: Table View
function TableView({ patients }: { patients: Patient[] }) {
  const getIssueColor = (issue: string) => {
    const colors: Record<string, string> = {
      fever: 'bg-red-100 text-red-600 border-red-200',
      headache: 'bg-orange-100 text-orange-600 border-orange-200',
      sinusitis: 'bg-blue-100 text-blue-600 border-blue-200',
      'sprained ankle': 'bg-teal-100 text-teal-600 border-teal-200',
      'ear infection': 'bg-indigo-100 text-indigo-600 border-indigo-200',
      rash: 'bg-pink-100 text-pink-600 border-pink-200',
    };
    return colors[issue.toLowerCase()] || 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead className="bg-gray-50 text-gray-500 font-semibold uppercase tracking-wider">
          <tr>
            <th className="px-6 py-4">ID</th>
            <th className="px-6 py-4">Name</th>
            <th className="px-6 py-4">Age</th>
            <th className="px-6 py-4">Medical Issue</th>
            <th className="px-6 py-4">Address</th>
            <th className="px-6 py-4">Phone Number</th>
            <th className="px-6 py-4">Email ID</th>
            <th className="px-6 py-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {patients.map((patient) => (
            <tr key={patient.patient_id} className="hover:bg-blue-50/30 transition group">
              <td className="px-6 py-4 text-gray-500">ID-{patient.patient_id.toString().padStart(4, '0')}</td>
              <td className="px-6 py-4 font-medium flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden border">
                  {patient.photo_url ? (
                    // Inside TableView map function
<div className="w-8 h-8 rounded-full bg-blue-100 flex-shrink-0 overflow-hidden border">
  <img 
    src={`https://i.pravatar.cc/150?u=${patient.patient_id}`} 
    alt={patient.patient_name} 
    className="w-full h-full object-cover"
  />
</div>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-blue-600">
                      {patient.patient_name.charAt(0)}
                    </div>
                  )}
                </div>
                {patient.patient_name}
              </td>
              <td className="px-6 py-4">{patient.age}</td>
              <td className="px-6 py-4">
                <span className={`px-3 py-1 rounded-md border text-[11px] font-semibold ${getIssueColor(patient.medical_issue)}`}>
                  {patient.medical_issue}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-1000 max-w-xs truncate">
                {patient.contact[0]?.address || <span className="text-red-400">N/A</span>}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {patient.contact[0]?.number || <span className="text-red-400">N/A</span>}
              </td>
              <td className="px-6 py-4 text-gray-600">
                {patient.contact[0]?.email || <span className="text-red-400">N/A</span>}
              </td>
              <td className="px-6 py-4 text-right">
                <ChevronRight className="text-gray-300 group-hover:text-blue-500 transition cursor-pointer" size={20} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Sub-component: Card View

function CardView({ patients }: { patients: Patient[] }) {
  const getIssueColor = (issue: string) => {
    const colors: Record<string, string> = {
      fever: 'bg-red-100 text-red-600',
      headache: 'bg-orange-100 text-orange-600',
      'sore throat': 'bg-yellow-100 text-yellow-700',
      'sprained ankle': 'bg-emerald-100 text-emerald-600',
      'ear infection': 'bg-cyan-100 text-cyan-600',
      rash: 'bg-pink-100 text-pink-600',
    };
    return colors[issue.toLowerCase()] || 'bg-gray-100 text-gray-600';
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 bg-gray-50 w-full">
      {patients.map((patient) => (
        <div 
          key={patient.patient_id} 
          className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden flex flex-col transition-transform hover:scale-[1.02]"
        >
          {/* Top Blue Header Section */}
          <div className="bg-blue-50/80 p-4 flex justify-between items-start border-b border-blue-100">
            <div className="flex gap-3 items-center">
              {/* Profile Image */}
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-white">
                <img 
                  src={`https://i.pravatar.cc/150?u=${patient.patient_id}`} 
                  alt={patient.patient_name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-sm leading-tight">
                  {patient.patient_name}
                </h3>
                <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                  ID-{patient.patient_id.toString().padStart(4, '0')}
                </p>
              </div>
            </div>
            
            {/* Age Badge */}
            <div className="bg-blue-500 text-white text-[10px] px-2 py-1 rounded-lg font-bold shadow-sm">
              Age:{patient.age}
            </div>
          </div>

          {/* Card Body Section */}
          <div className="p-4 flex flex-col gap-4 flex-grow">
            {/* Medical Issue Tag */}
            <div>
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${getIssueColor(patient.medical_issue)}`}>
                {patient.medical_issue}
              </span>
            </div>

            {/* Contact Details with Icons */}
            <div className="space-y-3">
              <div className="flex items-start gap-2 text-gray-1000">
                <MapPin size={14} className="text-gray-1000 mt-0.5 flex-shrink-0" />
                <p className="text-[11px] font-medium leading-tight">
                  {patient.contact[0]?.address || <span className="text-red-400">N/A</span>}
                </p>
              </div>

              <div className="flex items-center gap-2 text-gray-1000">
                <Phone size={14} className="text-gray-1000 flex-shrink-0" />
                <p className="text-[11px] font-medium">
                  {patient.contact[0]?.number || <span className="text-red-400">N/A</span>}
                </p>
              </div>

              <div className="flex items-center gap-2 text-gray-1000">
                <Mail size={14} className="text-gray-1000 flex-shrink-0" />
                <p className="text-[11px] font-medium truncate">
                  {patient.contact[0]?.email || <span className="text-red-400">N/A</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
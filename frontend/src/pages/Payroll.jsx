import { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY = { EmpID: '', GrossSalary: '', Deductions: '', PayDate: '' };

const Payroll = () => {
  const [salaries, setSalaries] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [salRes, empRes] = await Promise.all([
        api.get('/salaries'),
        api.get('/employees'),
      ]);
      setSalaries(salRes.data.data);
      setEmployees(empRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const netPreview =
    form.GrossSalary && form.Deductions
      ? Number(form.GrossSalary) - Number(form.Deductions)
      : null;

  const filtered = salaries.filter((s) => {
    const q = search.toLowerCase();
    const empName = `${s.EmpID?.EmpFirstName ?? ''} ${s.EmpID?.EmpLastName ?? ''}`.toLowerCase();
    return empName.includes(q) || (s.DepartmentName ?? '').toLowerCase().includes(q);
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (s) => {
    setEditing(s._id);
    setForm({
      EmpID: s.EmpID?._id || s.EmpID,
      GrossSalary: s.GrossSalary,
      Deductions: s.Deductions,
      PayDate: s.PayDate?.split('T')[0] || '',
    });
    setError(''); setShowModal(true);
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = { ...form, GrossSalary: Number(form.GrossSalary), Deductions: Number(form.Deductions) };
      if (editing) {
        await api.put(`/salaries/${editing}`, payload);
      } else {
        await api.post('/salaries', payload);
      }
      setShowModal(false); fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this payroll record?')) return;
    try {
      await api.delete(`/salaries/${id}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;

  const summaryCards = [
    { label: 'Total Gross', value: fmt(salaries.reduce((s, r) => s + r.GrossSalary, 0)), colorClass: 'text-gray-800' },
    { label: 'Total Deductions', value: fmt(salaries.reduce((s, r) => s + r.Deductions, 0)), colorClass: 'text-red-700' },
    { label: 'Total Net', value: fmt(salaries.reduce((s, r) => s + r.NetSalary, 0)), colorClass: 'text-green-700' },
  ];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Payroll Records</h2>
          <p className="text-gray-500 text-[13px]">{filtered.length} of {salaries.length} records</p>
        </div>
        <button id="add-payroll-btn" onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white border-none text-sm cursor-pointer">
          + Process Payroll
        </button>
      </div>

      <div className="mb-3">
        <input type="text" placeholder="Search by employee name or department..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 text-sm box-border" />
      </div>

      {salaries.length > 0 && (
        <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-2 mb-3">
          {summaryCards.map(({ label, value, colorClass }) => (
            <div key={label} className="px-4 py-3 bg-white border border-gray-300">
              <div className="text-xs text-gray-400 mb-1">{label}</div>
              <div className={`text-base font-bold ${colorClass}`}>{value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="overflow-x-auto bg-white border border-gray-300">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              {['Employee', 'Department', 'Gross Salary', 'Deductions', 'Net Salary', 'Pay Date', 'Processed By', 'Actions'].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 text-gray-800">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={8} className="p-6 text-center text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={8} className="p-6 text-center text-gray-400">No payroll records found.</td></tr>
            ) : (
              filtered.map((s) => (
                <tr key={s._id} className="border-b border-gray-200">
                  <td className="px-3 py-2.5">
                    <span className="font-semibold">{s.EmpID?.EmpFirstName} {s.EmpID?.EmpLastName}</span>
                    <div className="text-xs text-gray-400">{s.EmpID?.Position}</div>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className="bg-indigo-100 px-2 py-0.5 text-xs">
                      {s.DepartmentName || s.EmpID?.DepartmentCode}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-800">{fmt(s.GrossSalary)}</td>
                  <td className="px-3 py-2.5 text-red-700">{fmt(s.Deductions)}</td>
                  <td className="px-3 py-2.5 font-semibold text-green-700">{fmt(s.NetSalary)}</td>
                  <td className="px-3 py-2.5 text-gray-500">
                    {s.PayDate ? new Date(s.PayDate).toLocaleDateString() : '---'}
                  </td>
                  <td className="px-3 py-2.5 text-gray-400">{s.ProcessedBy || '---'}</td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => openEdit(s)}
                      className="px-2.5 py-1 bg-blue-600 text-white border-none text-xs cursor-pointer mr-1">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(s._id)}
                      className="px-2.5 py-1 bg-red-700 text-white border-none text-xs cursor-pointer">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 w-full max-w-[450px] mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editing ? 'Edit Payroll Record' : 'Process Payroll'}
            </h3>
            {error && (
              <div className="px-3 py-2 bg-red-50 border border-red-300 text-red-700 text-[13px] mb-3">{error}</div>
            )}
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">Employee</label>
                <select name="EmpID" value={form.EmpID} onChange={handleChange} required
                  className="w-full p-2 border border-gray-400 text-[13px] box-border">
                  <option value="">Select employee...</option>
                  {employees.map((e) => (
                    <option key={e._id} value={e._id}>{e.EmpFirstName} {e.EmpLastName} - {e.DepartmentName || e.DepartmentCode}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block mb-1 text-[13px] font-semibold text-gray-800">Gross Salary (RWF)</label>
                  <input name="GrossSalary" type="number" min="0" value={form.GrossSalary} onChange={handleChange} required placeholder="0"
                    className="w-full p-2 border border-gray-400 text-[13px] box-border" />
                </div>
                <div>
                  <label className="block mb-1 text-[13px] font-semibold text-gray-800">Deductions (RWF)</label>
                  <input name="Deductions" type="number" min="0" value={form.Deductions} onChange={handleChange} required placeholder="0"
                    className="w-full p-2 border border-gray-400 text-[13px] box-border" />
                </div>
              </div>
              {netPreview !== null && (
                <div className={`px-3 py-2 border mb-3 text-[13px] font-semibold ${
                  netPreview >= 0
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-red-50 border-red-300 text-red-700'
                }`}>
                  Net Salary: RWF {netPreview.toLocaleString()}
                </div>
              )}
              <div className="mb-4">
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">Pay Date</label>
                <input name="PayDate" type="date" value={form.PayDate} onChange={handleChange} required
                  className="w-full p-2 border border-gray-400 text-[13px] box-border" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-gray-200 border-none text-sm cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className={`flex-1 py-2.5 text-white border-none text-sm ${
                    saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 cursor-pointer'
                  }`}>
                  {saving ? 'Saving...' : editing ? 'Update' : 'Process'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Payroll;

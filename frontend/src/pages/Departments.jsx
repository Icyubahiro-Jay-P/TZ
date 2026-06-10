import { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY = { DepartmentCode: '', DepartmentName: '', GrossSalary: '', Deductions: '' };

const Departments = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/departments');
      setDepartments(data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDepts(); }, []);

  const filtered = departments.filter((d) =>
    d.DepartmentCode.toLowerCase().includes(search.toLowerCase()) ||
    d.DepartmentName.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => { setEditing(null); setForm(EMPTY); setError(''); setShowModal(true); };
  const openEdit = (dept) => {
    setEditing(dept.DepartmentCode);
    setForm({
      DepartmentCode: dept.DepartmentCode,
      DepartmentName: dept.DepartmentName,
      GrossSalary: dept.GrossSalary,
      Deductions: dept.Deductions,
    });
    setError(''); setShowModal(true);
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      const payload = { ...form, GrossSalary: Number(form.GrossSalary), Deductions: Number(form.Deductions) };
      if (editing) {
        await api.put(`/departments/${editing}`, payload);
      } else {
        await api.post('/departments', payload);
      }
      setShowModal(false); fetchDepts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (code) => {
    if (!window.confirm(`Delete department "${code}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/departments/${code}`);
      fetchDepts();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  const fmt = (n) => `RWF ${Number(n).toLocaleString()}`;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Departments</h2>
          <p className="text-gray-500 text-[13px]">{departments.length} departments</p>
        </div>
        <button id="add-department-btn" onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white border-none text-sm cursor-pointer">
          + Add Department
        </button>
      </div>

      <div className="mb-3">
        <input type="text" placeholder="Search departments..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 text-sm box-border" />
      </div>

      <div className="overflow-x-auto bg-white border border-gray-300">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              {['Code', 'Name', 'Gross Salary', 'Deductions', 'Net Salary', 'Actions'].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 text-gray-800">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">No departments found.</td></tr>
            ) : (
              filtered.map((dept) => (
                <tr key={dept.DepartmentCode} className="border-b border-gray-200">
                  <td className="px-3 py-2.5">
                    <span className="bg-indigo-100 px-2 py-0.5 text-xs font-bold">
                      {dept.DepartmentCode}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 font-semibold text-gray-800">{dept.DepartmentName}</td>
                  <td className="px-3 py-2.5 text-gray-800">{fmt(dept.GrossSalary)}</td>
                  <td className="px-3 py-2.5 text-red-700">{fmt(dept.Deductions)}</td>
                  <td className="px-3 py-2.5 font-semibold text-green-700">
                    {fmt(dept.GrossSalary - dept.Deductions)}
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => openEdit(dept)}
                      className="px-2.5 py-1 bg-blue-600 text-white border-none text-xs cursor-pointer mr-1">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(dept.DepartmentCode)}
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
              {editing ? 'Edit Department' : 'New Department'}
            </h3>
            {error && (
              <div className="px-3 py-2 bg-red-50 border border-red-300 text-red-700 text-[13px] mb-3">
                {error}
              </div>
            )}
            <form onSubmit={handleSave}>
              <div className="mb-3">
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">Department Code</label>
                <input name="DepartmentCode" value={form.DepartmentCode} onChange={handleChange} required readOnly={!!editing}
                  placeholder="e.g. HR"
                  className="w-full p-2 border border-gray-400 text-[13px] box-border uppercase" />
              </div>
              <div className="mb-3">
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">Department Name</label>
                <input name="DepartmentName" value={form.DepartmentName} onChange={handleChange} required placeholder="e.g. Human Resources"
                  className="w-full p-2 border border-gray-400 text-[13px] box-border" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block mb-1 text-[13px] font-semibold text-gray-800">Gross Salary (RWF)</label>
                  <input name="GrossSalary" type="number" min="0" value={form.GrossSalary} onChange={handleChange} required
                    className="w-full p-2 border border-gray-400 text-[13px] box-border" />
                </div>
                <div>
                  <label className="block mb-1 text-[13px] font-semibold text-gray-800">Deductions (RWF)</label>
                  <input name="Deductions" type="number" min="0" value={form.Deductions} onChange={handleChange} required
                    className="w-full p-2 border border-gray-400 text-[13px] box-border" />
                </div>
              </div>
              {form.GrossSalary && form.Deductions && (
                <div className="px-3 py-2 bg-green-50 border border-green-300 mb-3 text-[13px] font-semibold text-green-700">
                  Net Salary: RWF {(Number(form.GrossSalary) - Number(form.Deductions)).toLocaleString()}
                </div>
              )}
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 bg-gray-200 border-none text-sm cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className={`flex-1 py-2.5 text-white border-none text-sm ${
                    saving ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 cursor-pointer'
                  }`}>
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Departments;

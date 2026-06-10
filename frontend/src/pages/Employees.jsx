import { useEffect, useState } from 'react';
import api from '../api/axios';

const EMPTY = {
  EmpFirstName: '', EmpLastName: '', Position: '', Address: '',
  Telephone: '', Gender: '', hiredDate: '', DepartmentCode: '',
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [empRes, deptRes] = await Promise.all([
        api.get('/employees'),
        api.get('/departments'),
      ]);
      setEmployees(empRes.data.data);
      setDepartments(deptRes.data.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = employees.filter((e) => {
    const q = search.toLowerCase();
    const matchSearch =
      e.EmpFirstName.toLowerCase().includes(q) ||
      e.EmpLastName.toLowerCase().includes(q) ||
      e.Position.toLowerCase().includes(q) ||
      e.Telephone.includes(q);
    const matchDept = deptFilter ? e.DepartmentCode === deptFilter : true;
    return matchSearch && matchDept;
  });

  const openCreate = () => {
    setEditing(null); setForm(EMPTY); setError(''); setShowModal(true);
  };
  const openEdit = (emp) => {
    setEditing(emp._id);
    setForm({
      EmpFirstName: emp.EmpFirstName,
      EmpLastName: emp.EmpLastName,
      Position: emp.Position,
      Address: emp.Address,
      Telephone: emp.Telephone,
      Gender: emp.Gender,
      hiredDate: emp.hiredDate?.split('T')[0] || '',
      DepartmentCode: emp.DepartmentCode,
    });
    setError(''); setShowModal(true);
  };

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault(); setError(''); setSaving(true);
    try {
      if (editing) {
        await api.put(`/employees/${editing}`, form);
      } else {
        await api.post('/employees', form);
      }
      setShowModal(false); fetchAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete employee "${name}"?`)) return;
    try {
      await api.delete(`/employees/${id}`);
      fetchAll();
    } catch (err) {
      alert(err.response?.data?.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Employees</h2>
          <p className="text-gray-500 text-[13px]">{filtered.length} of {employees.length} employees</p>
        </div>
        <button id="add-employee-btn" onClick={openCreate}
          className="px-4 py-2 bg-blue-600 text-white border-none text-sm cursor-pointer">
          + Add Employee
        </button>
      </div>

      <div className="flex gap-2 mb-3">
        <input type="text" placeholder="Search by name, position, telephone..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 text-sm" />
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 text-sm min-w-[160px]">
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d.DepartmentCode} value={d.DepartmentCode}>{d.DepartmentName}</option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto bg-white border border-gray-300">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              {['Name', 'Position', 'Department', 'Gender', 'Telephone', 'Hired Date', 'Actions'].map((h) => (
                <th key={h} className="text-left px-3 py-2.5 text-gray-800">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">Loading...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="p-6 text-center text-gray-400">No employees found.</td></tr>
            ) : (
              filtered.map((emp) => (
                <tr key={emp._id} className="border-b border-gray-200">
                  <td className="px-3 py-2.5">
                    <span className="font-semibold">{emp.EmpFirstName} {emp.EmpLastName}</span>
                    <div className="text-xs text-gray-400">{emp.Address}</div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-800">{emp.Position}</td>
                  <td className="px-3 py-2.5">
                    <span className="bg-indigo-100 px-2 py-0.5 text-xs">
                      {emp.DepartmentName || emp.DepartmentCode}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">{emp.Gender}</td>
                  <td className="px-3 py-2.5 text-gray-800">{emp.Telephone}</td>
                  <td className="px-3 py-2.5 text-gray-500">
                    {emp.hiredDate ? new Date(emp.hiredDate).toLocaleDateString() : '---'}
                  </td>
                  <td className="px-3 py-2.5">
                    <button onClick={() => openEdit(emp)}
                      className="px-2.5 py-1 bg-blue-600 text-white border-none text-xs cursor-pointer mr-1">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(emp._id, `${emp.EmpFirstName} ${emp.EmpLastName}`)}
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
          <div className="bg-white p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              {editing ? 'Edit Employee' : 'New Employee'}
            </h3>
            {error && (
              <div className="px-3 py-2 bg-red-50 border border-red-300 text-red-700 text-[13px] mb-3">
                {error}
              </div>
            )}
            <form onSubmit={handleSave}>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block mb-1 text-[13px] font-semibold text-gray-800">First Name</label>
                  <input name="EmpFirstName" value={form.EmpFirstName} onChange={handleChange} required placeholder="First name"
                    className="w-full p-2 border border-gray-400 text-[13px] box-border" />
                </div>
                <div>
                  <label className="block mb-1 text-[13px] font-semibold text-gray-800">Last Name</label>
                  <input name="EmpLastName" value={form.EmpLastName} onChange={handleChange} required placeholder="Last name"
                    className="w-full p-2 border border-gray-400 text-[13px] box-border" />
                </div>
              </div>
              <div className="mb-3">
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">Position</label>
                <input name="Position" value={form.Position} onChange={handleChange} required placeholder="Job title"
                  className="w-full p-2 border border-gray-400 text-[13px] box-border" />
              </div>
              <div className="mb-3">
                <label className="block mb-1 text-[13px] font-semibold text-gray-800">Address</label>
                <input name="Address" value={form.Address} onChange={handleChange} required placeholder="Physical address"
                  className="w-full p-2 border border-gray-400 text-[13px] box-border" />
              </div>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="block mb-1 text-[13px] font-semibold text-gray-800">Telephone</label>
                  <input name="Telephone" value={form.Telephone} onChange={handleChange} required placeholder="+250 7xx xxx xxx"
                    className="w-full p-2 border border-gray-400 text-[13px] box-border" />
                </div>
                <div>
                  <label className="block mb-1 text-[13px] font-semibold text-gray-800">Gender</label>
                  <select name="Gender" value={form.Gender} onChange={handleChange} required
                    className="w-full p-2 border border-gray-400 text-[13px] box-border">
                    <option value="">Select...</option>
                    <option>Male</option>
                    <option>Female</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="block mb-1 text-[13px] font-semibold text-gray-800">Hire Date</label>
                  <input name="hiredDate" type="date" value={form.hiredDate} onChange={handleChange} required
                    className="w-full p-2 border border-gray-400 text-[13px] box-border" />
                </div>
                <div>
                  <label className="block mb-1 text-[13px] font-semibold text-gray-800">Department</label>
                  <select name="DepartmentCode" value={form.DepartmentCode} onChange={handleChange} required
                    className="w-full p-2 border border-gray-400 text-[13px] box-border">
                    <option value="">Select...</option>
                    {departments.map((d) => (
                      <option key={d.DepartmentCode} value={d.DepartmentCode}>{d.DepartmentName}</option>
                    ))}
                  </select>
                </div>
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

export default Employees;

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';

const StatCard = ({ label, value, to }) => (
  <Link to={to} className="block p-4 bg-white border border-gray-300 no-underline text-gray-800">
    <div className="text-[26px] font-bold">{value ?? '---'}</div>
    <div className="text-[13px] text-gray-500">{label}</div>
  </Link>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ employees: 0, departments: 0, salaries: 0, totalPaid: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [empRes, deptRes, salRes] = await Promise.all([
          api.get('/employees'),
          api.get('/departments'),
          api.get('/salaries'),
        ]);
        const totalPaid = salRes.data.data.reduce((s, r) => s + (r.NetSalary || 0), 0);
        setStats({
          employees: empRes.data.count,
          departments: deptRes.data.count,
          salaries: salRes.data.count,
          totalPaid,
        });
      } catch {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const fmt = (n) => `${Number(n).toLocaleString()} RWF`;

  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-1">
        Welcome, {user?.UserName}
      </h2>
      <p className="text-gray-500 text-sm mb-5">Dashboard</p>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-3 mb-6">
        <StatCard label="Total Employees" value={stats.employees} to="/employees" />
        <StatCard label="Departments" value={stats.departments} to="/departments" />
        <StatCard label="Payroll Records" value={stats.salaries} to="/payroll" />
        <StatCard label="Total Net Paid" value={fmt(stats.totalPaid)} to="/reports" />
      </div>

      <div className="mb-6">
        <h3 className="text-base font-semibold text-gray-800 mb-2">Quick Actions</h3>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(130px,1fr))] gap-2">
          {[
            { label: 'Add Employee', to: '/employees' },
            { label: 'New Department', to: '/departments' },
            { label: 'Process Payroll', to: '/payroll' },
            { label: 'View Report', to: '/reports' },
          ].map(({ label, to }) => (
            <Link key={to} to={to} className="block p-3 bg-blue-600 text-white no-underline text-sm text-center">
              {label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

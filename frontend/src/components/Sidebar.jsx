import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard',   label: 'Dashboard',  },
  { to: '/employees',   label: 'Employees',  },
  { to: '/departments', label: 'Departments' },
  { to: '/payroll',     label: 'Payroll',    },
  { to: '/reports',     label: 'Reports',    },
];

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="w-[200px] bg-slate-700 text-white flex flex-col min-h-screen">
      <div className="p-4 border-b-2 border-slate-600 text-center">
        <h2 className="m-0 text-base">DAB Enterprise</h2>
      </div>

      <nav className="flex-1">
        {navItems.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `block px-4 py-2.5 text-sm border-b border-slate-600 no-underline ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300'
              }`
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-3 border-t-2 border-slate-600">
        <p className="m-0 mb-1 text-[13px] font-semibold">{user?.UserName}</p>
        <button
          onClick={handleLogout}
          className="w-full p-2 bg-red-600 text-white border-none text-[13px] cursor-pointer mt-1"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

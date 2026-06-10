import { useEffect, useState } from 'react';
import api from '../api/axios';

const Reports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [fetched, setFetched] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const params = {};
      if (month) params.month = month;
      if (year) params.year = year;
      const { data } = await api.get('/salaries/report', { params });
      setReport(data.data);
      setFetched(true);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReport(); }, []);

  const fmt = (n) => `RWF ${Number(n || 0).toLocaleString()}`;

  const grandTotal = report?.deptTotals?.reduce((s, d) => s + d.TotalNetSalary, 0) || 0;

  const handlePrint = () => window.print();

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Payroll Report</h2>
          <p className="text-gray-500 text-[13px]">Employee salary summary by department</p>
        </div>
        <button onClick={handlePrint}
          className="px-4 py-2 bg-green-700 text-white border-none text-sm cursor-pointer">
          Print Report
        </button>
      </div>

      <div className="p-3 bg-white border border-gray-300 mb-4">
        <div className="flex gap-2 flex-wrap">
          <select value={month} onChange={(e) => setMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 text-sm">
            <option value="">All Months</option>
            {['January','February','March','April','May','June',
              'July','August','September','October','November','December'].map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>
          <select value={year} onChange={(e) => setYear(e.target.value)}
            className="px-3 py-2 border border-gray-300 text-sm">
            <option value="">All Years</option>
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
          <button onClick={fetchReport}
            className="px-4 py-2 bg-blue-600 text-white border-none text-sm cursor-pointer">
            Generate
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center p-10 bg-white border border-gray-300 text-gray-500">Loading...</div>
      ) : fetched && (
        <div className="bg-white border border-gray-300 p-6">
          <div className="text-center mb-5">
            <h3 className="text-base font-bold text-gray-800 m-0">DAB Enterprise LTD</h3>
            <p className="text-gray-500 text-[13px] my-0.5">Kigali City, Rwanda</p>
            <h4 className="text-[15px] font-semibold text-blue-600 mt-2 mb-0">
              Employee Payroll Report
              {month && year ? ` - ${['January','February','March','April','May','June','July','August','September','October','November','December'][month-1]} ${year}` : ''}
            </h4>
            <p className="text-gray-400 text-[11px] mt-1 mb-0">Generated: {new Date().toLocaleString()}</p>
          </div>

          <div className="overflow-x-auto mb-6">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="bg-gray-100 border-b-2 border-gray-300">
                  {['#', 'Employee Name', 'Position', 'Department', 'Gross Salary', 'Deductions', 'Net Salary', 'Pay Date'].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-gray-800">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {report?.rows?.length === 0 ? (
                  <tr><td colSpan={8} className="p-5 text-center text-gray-400">No payroll records for the selected period.</td></tr>
                ) : (
                  report?.rows?.map((row, idx) => (
                    <tr key={row._id} className="border-b border-gray-200">
                      <td className="px-3 py-2 text-gray-500">{idx + 1}</td>
                      <td className="px-3 py-2 font-semibold text-gray-800">{row.EmpName}</td>
                      <td className="px-3 py-2 text-gray-800">{row.Position}</td>
                      <td className="px-3 py-2">
                        <span className="bg-indigo-100 px-2 py-0.5 text-xs">{row.Department}</span>
                      </td>
                      <td className="px-3 py-2 text-gray-800">{fmt(row.GrossSalary)}</td>
                      <td className="px-3 py-2 text-red-700">{fmt(row.Deductions)}</td>
                      <td className="px-3 py-2 font-semibold text-green-700">{fmt(row.NetSalary)}</td>
                      <td className="px-3 py-2 text-gray-500">
                        {row.PayDate ? new Date(row.PayDate).toLocaleDateString() : '---'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {report?.deptTotals?.length > 0 && (
            <>
              <h4 className="text-sm font-semibold text-gray-800 mb-2">Total Monthly Salary Paid per Department</h4>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-[13px]">
                  <thead>
                    <tr className="bg-gray-100 border-b-2 border-gray-300">
                      <th className="text-left px-3 py-2 text-gray-800">Department</th>
                      <th className="text-left px-3 py-2 text-gray-800">Employees Paid</th>
                      <th className="text-left px-3 py-2 text-gray-800">Total Net Salary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.deptTotals.map((d) => (
                      <tr key={d.DepartmentCode} className="border-b border-gray-200">
                        <td className="px-3 py-2">
                          <span className="bg-indigo-100 px-1.5 py-0.5 text-xs font-bold">{d.DepartmentCode}</span>
                          <span className="ml-1.5 font-semibold">{d.DepartmentName}</span>
                        </td>
                        <td className="px-3 py-2 text-gray-800">{d.count}</td>
                        <td className="px-3 py-2 font-semibold text-green-700">{fmt(d.TotalNetSalary)}</td>
                      </tr>
                    ))}
                    <tr className="bg-indigo-100 border-t-2 border-blue-600">
                      <td className="px-3 py-2 font-bold text-gray-800" colSpan={2}>Grand Total</td>
                      <td className="px-3 py-2 font-bold text-green-700 text-sm">{fmt(grandTotal)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Reports;

import Salary from '../models/Salary.js';
import Employee from '../models/Employee.js';
import Department from '../models/Department.js';

export const getSalaries = async (req, res) => {
  try {
    const { search, empId } = req.query;
    const filter = {};
    if (empId) filter.EmpID = empId;

    let salaries = await Salary.find(filter)
      .populate('EmpID', 'EmpFirstName EmpLastName Position DepartmentCode')
      .sort({ PayDate: -1 });

    if (search) {
      const q = search.toLowerCase();
      salaries = salaries.filter((s) => {
        const name = `${s.EmpID?.EmpFirstName} ${s.EmpID?.EmpLastName}`.toLowerCase();
        return name.includes(q) || s.EmpID?.Position?.toLowerCase().includes(q);
      });
    }

    const departments = await Department.find();
    const deptMap = {};
    departments.forEach((d) => (deptMap[d.DepartmentCode] = d.DepartmentName));

    const enriched = salaries.map((s) => {
      const obj = s.toObject();
      obj.DepartmentName = deptMap[s.EmpID?.DepartmentCode] || s.EmpID?.DepartmentCode;
      return obj;
    });

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSalary = async (req, res) => {
  try {
    const salary = await Salary.findById(req.params.id).populate(
      'EmpID',
      'EmpFirstName EmpLastName Position DepartmentCode'
    );
    if (!salary) return res.status(404).json({ success: false, message: 'Salary record not found' });
    res.status(200).json({ success: true, data: salary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createSalary = async (req, res) => {
  try {
    const { EmpID, GrossSalary, Deductions, PayDate } = req.body;

    if (!EmpID || GrossSalary === undefined || Deductions === undefined || !PayDate) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const gross = Number(GrossSalary);
    const deductions = Number(Deductions);
    if (isNaN(gross) || isNaN(deductions)) {
      return res.status(400).json({ success: false, message: 'Gross salary and deductions must be valid numbers' });
    }

    const emp = await Employee.findById(EmpID);
    if (!emp) return res.status(400).json({ success: false, message: 'Employee not found' });

    const salary = await Salary.create({
      EmpID,
      GrossSalary: gross,
      Deductions: deductions,
      NetSalary: gross - deductions,
      PayDate,
      ProcessedBy: req.user?.UserName || 'system',
    });

    res.status(201).json({ success: true, data: salary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSalary = async (req, res) => {
  try {
    const { GrossSalary, Deductions, PayDate } = req.body;
    const netSalary = GrossSalary - Deductions;

    const salary = await Salary.findByIdAndUpdate(
      req.params.id,
      { GrossSalary, Deductions, NetSalary: netSalary, PayDate },
      { new: true, runValidators: true }
    );
    if (!salary) return res.status(404).json({ success: false, message: 'Salary record not found' });
    res.status(200).json({ success: true, data: salary });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteSalary = async (req, res) => {
  try {
    const salary = await Salary.findByIdAndDelete(req.params.id);
    if (!salary) return res.status(404).json({ success: false, message: 'Salary record not found' });
    res.status(200).json({ success: true, message: 'Salary record deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPayrollReport = async (req, res) => {
  try {
    const { month, year } = req.query;

    let dateFilter = {};
    if (month && year) {
      const start = new Date(year, month - 1, 1);
      const end   = new Date(year, month, 0, 23, 59, 59);
      dateFilter = { PayDate: { $gte: start, $lte: end } };
    }

    const salaries = await Salary.find(dateFilter)
      .populate('EmpID', 'EmpFirstName EmpLastName Position DepartmentCode')
      .sort({ PayDate: -1 });

    const departments = await Department.find();
    const deptMap = {};
    departments.forEach((d) => (deptMap[d.DepartmentCode] = d.DepartmentName));

    const groupedByDept = {};
    const reportRows = [];

    salaries.forEach((s) => {
      const emp = s.EmpID;
      if (!emp) return;

      const deptCode = emp.DepartmentCode;
      const deptName = deptMap[deptCode] || deptCode;

      reportRows.push({
        _id:            s._id,
        EmpName:        `${emp.EmpFirstName} ${emp.EmpLastName}`,
        Position:       emp.Position,
        Department:     deptName,
        DepartmentCode: deptCode,
        GrossSalary:    s.GrossSalary,
        Deductions:     s.Deductions,
        NetSalary:      s.NetSalary,
        PayDate:        s.PayDate,
        ProcessedBy:    s.ProcessedBy,
      });

      if (!groupedByDept[deptCode]) {
        groupedByDept[deptCode] = { DepartmentCode: deptCode, DepartmentName: deptName, TotalNetSalary: 0, count: 0 };
      }
      groupedByDept[deptCode].TotalNetSalary += s.NetSalary;
      groupedByDept[deptCode].count += 1;
    });

    res.status(200).json({
      success: true,
      data: {
        rows:       reportRows,
        deptTotals: Object.values(groupedByDept),
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

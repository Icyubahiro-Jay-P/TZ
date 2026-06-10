import Employee from '../models/Employee.js';
import Department from '../models/Department.js';

export const getEmployees = async (req, res) => {
  try {
    const { search, department } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { EmpFirstName:  { $regex: search, $options: 'i' } },
        { EmpLastName:   { $regex: search, $options: 'i' } },
        { Position:      { $regex: search, $options: 'i' } },
        { Telephone:     { $regex: search, $options: 'i' } },
      ];
    }

    if (department) filter.DepartmentCode = department.toUpperCase();

    const employees = await Employee.find(filter).sort({ createdAt: -1 });

    const departments = await Department.find();
    const deptMap = {};
    departments.forEach((d) => (deptMap[d.DepartmentCode] = d.DepartmentName));

    const enriched = employees.map((emp) => ({
      ...emp.toObject(),
      DepartmentName: deptMap[emp.DepartmentCode] || emp.DepartmentCode,
    }));

    res.status(200).json({ success: true, count: enriched.length, data: enriched });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getEmployee = async (req, res) => {
  try {
    const emp = await Employee.findById(req.params.id);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.status(200).json({ success: true, data: emp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createEmployee = async (req, res) => {
  try {
    const dept = await Department.findOne({ DepartmentCode: req.body.DepartmentCode?.toUpperCase() });
    if (!dept) return res.status(400).json({ success: false, message: 'Department not found' });

    const emp = await Employee.create(req.body);
    res.status(201).json({ success: true, data: emp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateEmployee = async (req, res) => {
  try {
    const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.status(200).json({ success: true, data: emp });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteEmployee = async (req, res) => {
  try {
    const emp = await Employee.findByIdAndDelete(req.params.id);
    if (!emp) return res.status(404).json({ success: false, message: 'Employee not found' });
    res.status(200).json({ success: true, message: 'Employee deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

import Department from '../models/Department.js';

export const getDepartments = async (_req, res) => {
  try {
    const departments = await Department.find().sort({ DepartmentCode: 1 });
    res.status(200).json({ success: true, count: departments.length, data: departments });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDepartment = async (req, res) => {
  try {
    const dept = await Department.findOne({ DepartmentCode: req.params.code.toUpperCase() });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, data: dept });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createDepartment = async (req, res) => {
  try {
    const dept = await Department.create(req.body);
    res.status(201).json({ success: true, data: dept });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: 'Department code already exists' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateDepartment = async (req, res) => {
  try {
    const dept = await Department.findOneAndUpdate(
      { DepartmentCode: req.params.code.toUpperCase() },
      req.body,
      { new: true, runValidators: true }
    );
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, data: dept });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteDepartment = async (req, res) => {
  try {
    const dept = await Department.findOneAndDelete({ DepartmentCode: req.params.code.toUpperCase() });
    if (!dept) return res.status(404).json({ success: false, message: 'Department not found' });
    res.status(200).json({ success: true, message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

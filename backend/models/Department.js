import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    DepartmentCode: {
      type: String,
      required: [true, 'Department code is required'],
      unique: true,
      uppercase: true,
      trim: true,
    },
    DepartmentName: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
    },
    GrossSalary: {
      type: Number,
      required: [true, 'Gross salary is required'],
      min: 0,
    },
    Deductions: {
      type: Number,
      required: [true, 'Deductions amount is required'],
      min: 0,
    },
  },
  { timestamps: true }
);

// Virtual field for NetSalary
departmentSchema.virtual('NetSalary').get(function () {
  return this.GrossSalary - this.Deductions;
});

export default mongoose.model('Department', departmentSchema);

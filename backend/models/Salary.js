import mongoose from 'mongoose';

const salarySchema = new mongoose.Schema(
  {
    // FK → Employee
    EmpID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Employee',
      required: [true, 'Employee ID is required'],
    },
    GrossSalary: {
      type: Number,
      required: [true, 'Gross salary is required'],
      min: 0,
    },
    Deductions: {
      type: Number,
      required: [true, 'Deductions are required'],
      min: 0,
    },
    NetSalary: {
      type: Number,
    },
    PayDate: {
      type: Date,
      required: [true, 'Pay date is required'],
    },
    // Reference to the user who processed this salary
    ProcessedBy: {
      type: String,
      ref: 'User',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Salary', salarySchema);

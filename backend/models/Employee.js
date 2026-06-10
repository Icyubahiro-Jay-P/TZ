import mongoose from 'mongoose';

const employeeSchema = new mongoose.Schema(
  {
    EmpFirstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    EmpLastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    Position: {
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    Address: {
      type: String,
      required: [true, 'Address is required'],
      trim: true,
    },
    Telephone: {
      type: String,
      required: [true, 'Telephone is required'],
      trim: true,
    },
    Gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: [true, 'Gender is required'],
    },
    hiredDate: {
      type: Date,
      required: [true, 'Hire date is required'],
    },
    // FK → Department
    DepartmentCode: {
      type: String,
      ref: 'Department',
      required: [true, 'Department is required'],
      uppercase: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Employee', employeeSchema);

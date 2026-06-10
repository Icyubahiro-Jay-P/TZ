import Department from '../models/Department.js';

/**
 * Seeds the initial department records from the exam specification.
 * Only inserts if the collection is empty to avoid duplicates.
 */
export const seedDepartments = async () => {
  const count = await Department.countDocuments();
  if (count > 0) return; // Already seeded

  const departments = [
    { DepartmentCode: 'MS', DepartmentName: 'Masonry',        GrossSalary: 300000, Deductions: 20000 },
    { DepartmentCode: 'SS', DepartmentName: 'Sales',          GrossSalary: 200000, Deductions: 5000  },
    { DepartmentCode: 'MC', DepartmentName: 'Procurement',    GrossSalary: 450000, Deductions: 40000 },
    { DepartmentCode: 'AN', DepartmentName: 'Administration', GrossSalary: 600000, Deductions: 70000 },
  ];

  await Department.insertMany(departments);
  console.log('✅ Departments seeded successfully');
};

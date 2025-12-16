import { Sheet } from './types';

export const INITIAL_SHEETS: Sheet[] = [
  {
    id: 'sheet-1',
    name: 'Employees (Master)',
    primaryKeyColumn: 'EmployeeID',
    columns: [
      { id: 'col-1', name: 'EmployeeID', type: 'text' },
      { id: 'col-2', name: 'FullName', type: 'text' },
      { id: 'col-3', name: 'Department', type: 'select', options: ['Engineering', 'Sales', 'HR', 'Marketing'] },
      { id: 'col-4', name: 'Email', type: 'text' },
    ],
    rows: [
      { id: 'row-1', EmployeeID: 'EMP001', FullName: 'Alice Johnson', Department: 'Engineering', Email: 'alice@company.com' },
      { id: 'row-2', EmployeeID: 'EMP002', FullName: 'Bob Smith', Department: 'Sales', Email: 'bob@company.com' },
      { id: 'row-3', EmployeeID: 'EMP003', FullName: 'Charlie Brown', Department: 'Marketing', Email: 'charlie@company.com' },
    ]
  },
  {
    id: 'sheet-2',
    name: 'Payroll Data',
    primaryKeyColumn: 'EmployeeID',
    columns: [
      { id: 'col-1', name: 'EmployeeID', type: 'text' },
      { id: 'col-2', name: 'Salary', type: 'number' },
      { id: 'col-3', name: 'Bonus', type: 'number' },
      { id: 'col-4', name: 'Department', type: 'text' }, // Linked attribute
    ],
    rows: [
      { id: 'row-1', EmployeeID: 'EMP001', Salary: 95000, Bonus: 5000, Department: 'Engineering' },
      { id: 'row-2', EmployeeID: 'EMP002', Salary: 65000, Bonus: 12000, Department: 'Sales' },
    ]
  },
  {
    id: 'sheet-3',
    name: 'Project Assignments',
    primaryKeyColumn: 'EmployeeID',
    columns: [
      { id: 'col-1', name: 'ProjectName', type: 'text' },
      { id: 'col-2', name: 'EmployeeID', type: 'text' },
      { id: 'col-3', name: 'FullName', type: 'text' }, // Linked attribute
      { id: 'col-4', name: 'Status', type: 'select', options: ['Active', 'Completed', 'Pending'] },
    ],
    rows: [
      { id: 'row-1', ProjectName: 'Alpha Revamp', EmployeeID: 'EMP001', FullName: 'Alice Johnson', Status: 'Active' },
      { id: 'row-2', ProjectName: 'Sales Q3', EmployeeID: 'EMP002', FullName: 'Bob Smith', Status: 'Pending' },
    ]
  }
];

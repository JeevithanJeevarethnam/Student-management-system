/**
 * Student Service Layer with Dual Mode (Mock Adapter & Live REST API)
 * 
 * Switching to live backend:
 * Set USE_MOCK_DATA = false when backend /api/students endpoints become available.
 * No UI components will need any changes.
 */

import { request } from './client.js';

// Toggle flag: set to false once the backend developer implements /api/students
export const USE_MOCK_DATA = true;

const MOCK_STORAGE_KEY = 'sms_mock_students';

const INITIAL_MOCK_STUDENTS = [
  {
    id: 'std_001',
    studentId: 'STU-2026-001',
    name: 'Amina Zahra',
    email: 'amina.zahra@university.edu',
    department: 'Computer Science',
    status: 'Active',
    enrollmentDate: '2024-09-01',
  },
  {
    id: 'std_002',
    studentId: 'STU-2026-002',
    name: 'Kevin Chen',
    email: 'kevin.chen@university.edu',
    department: 'Electrical Engineering',
    status: 'Active',
    enrollmentDate: '2024-09-01',
  },
  {
    id: 'std_003',
    studentId: 'STU-2026-003',
    name: 'Priya Sharma',
    email: 'priya.sharma@university.edu',
    department: 'Information Technology',
    status: 'Active',
    enrollmentDate: '2025-01-15',
  },
  {
    id: 'std_004',
    studentId: 'STU-2026-004',
    name: 'Marcus Williams',
    email: 'marcus.w@university.edu',
    department: 'Mechanical Engineering',
    status: 'Inactive',
    enrollmentDate: '2023-09-01',
  },
  {
    id: 'std_005',
    studentId: 'STU-2026-005',
    name: 'Elena Rostova',
    email: 'elena.rostova@university.edu',
    department: 'Business Administration',
    status: 'Active',
    enrollmentDate: '2025-02-01',
  },
];

// Helper: Read mock database from localStorage
function getMockDatabase() {
  try {
    const raw = localStorage.getItem(MOCK_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_STUDENTS));
      return [...INITIAL_MOCK_STUDENTS];
    }
    return JSON.parse(raw);
  } catch {
    return [...INITIAL_MOCK_STUDENTS];
  }
}

// Helper: Save mock database to localStorage
function saveMockDatabase(data) {
  localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(data));
}

// ==========================================
// MOCK IMPLEMENTATIONS
// ==========================================

async function mockGetStudents(searchQuery = '', departmentFilter = '') {
  const students = getMockDatabase();
  const query = searchQuery.trim().toLowerCase();

  const filtered = students.filter((s) => {
    const matchesQuery =
      !query ||
      s.name.toLowerCase().includes(query) ||
      s.studentId.toLowerCase().includes(query) ||
      s.email.toLowerCase().includes(query) ||
      s.department.toLowerCase().includes(query);

    const matchesDept = !departmentFilter || s.department === departmentFilter;

    return matchesQuery && matchesDept;
  });

  return {
    students: filtered,
    total: filtered.length,
  };
}

async function mockGetStudentById(id) {
  const students = getMockDatabase();
  const student = students.find((s) => s.id === id);
  if (!student) {
    throw new Error('Student not found.');
  }
  return student;
}

async function mockCreateStudent(studentData) {
  const students = getMockDatabase();
  
  // Validation
  if (!studentData.name || !studentData.email || !studentData.department) {
    throw new Error('Name, email, and department are required.');
  }

  const newId = `std_${Date.now().toString(36)}`;
  const studentId = studentData.studentId?.trim() || `STU-${new Date().getFullYear()}-${String(students.length + 1).padStart(3, '0')}`;

  const newStudent = {
    id: newId,
    studentId,
    name: studentData.name.trim(),
    email: studentData.email.trim(),
    department: studentData.department.trim(),
    status: studentData.status || 'Active',
    enrollmentDate: studentData.enrollmentDate || new Date().toISOString().split('T')[0],
  };

  students.unshift(newStudent);
  saveMockDatabase(students);
  return { message: 'Student created successfully.', student: newStudent };
}

async function mockUpdateStudent(id, studentData) {
  const students = getMockDatabase();
  const index = students.findIndex((s) => s.id === id);
  if (index === -1) {
    throw new Error('Student not found.');
  }

  const updated = {
    ...students[index],
    ...studentData,
    id, // Preserve ID
  };

  students[index] = updated;
  saveMockDatabase(students);
  return { message: 'Student updated successfully.', student: updated };
}

async function mockDeleteStudent(id) {
  const students = getMockDatabase();
  const filtered = students.filter((s) => s.id !== id);
  if (filtered.length === students.length) {
    throw new Error('Student not found.');
  }
  saveMockDatabase(filtered);
  return { message: 'Student deleted successfully.' };
}

// ==========================================
// PUBLIC SERVICE API
// ==========================================

export async function getStudents(searchQuery = '', departmentFilter = '') {
  if (USE_MOCK_DATA) {
    return mockGetStudents(searchQuery, departmentFilter);
  }
  const params = new URLSearchParams();
  if (searchQuery) params.append('search', searchQuery);
  if (departmentFilter) params.append('department', departmentFilter);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/api/students${query}`);
}

export async function getStudentById(id) {
  if (USE_MOCK_DATA) {
    return mockGetStudentById(id);
  }
  return request(`/api/students/${id}`);
}

export async function createStudent(studentData) {
  if (USE_MOCK_DATA) {
    return mockCreateStudent(studentData);
  }
  return request('/api/students', {
    method: 'POST',
    body: JSON.stringify(studentData),
  });
}

export async function updateStudent(id, studentData) {
  if (USE_MOCK_DATA) {
    return mockUpdateStudent(id, studentData);
  }
  return request(`/api/students/${id}`, {
    method: 'PUT',
    body: JSON.stringify(studentData),
  });
}

export async function deleteStudent(id) {
  if (USE_MOCK_DATA) {
    return mockDeleteStudent(id);
  }
  return request(`/api/students/${id}`, {
    method: 'DELETE',
  });
}

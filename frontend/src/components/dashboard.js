/**
 * Authenticated Dashboard Component Controller
 * Manages Stats, Student Directory Table, Search/Filters, and Add/Edit Modals.
 */

import {
  getStudents,
  createStudent,
  updateStudent,
  deleteStudent,
} from '../api/students.js';

let currentSearch = '';
let currentDepartment = '';
let editingStudentId = null;

export function setupDashboard() {
  const dashboardContainer = document.getElementById('appDashboard');
  const studentModal = document.getElementById('studentModal');
  const studentForm = document.getElementById('studentForm');
  const closeStudentModal = document.getElementById('closeStudentModal');
  const cancelStudentBtn = document.getElementById('cancelStudentBtn');
  const modalTitle = document.getElementById('studentModalTitle');
  const studentModalMessage = document.getElementById('studentModalMessage');

  // Initialize inner dashboard HTML structure
  if (dashboardContainer) {
    dashboardContainer.innerHTML = `
      <div class="dashboard-header">
        <div>
          <h2>Academic & Student Directory</h2>
          <p class="dashboard-subtitle">Manage enrolled students, departments, and academic status.</p>
        </div>
        <button id="addStudentBtn" class="primary-btn add-student-btn">
          <span>+</span> Add New Student
        </button>
      </div>

      <!-- Quick Metrics Grid -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">🎓</div>
          <div>
            <div id="statTotalStudents" class="stat-value">0</div>
            <div class="stat-label">Total Enrolled</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div>
            <div id="statActiveStudents" class="stat-value">0</div>
            <div class="stat-label">Active Status</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">⏸️</div>
          <div>
            <div id="statInactiveStudents" class="stat-value">0</div>
            <div class="stat-label">Inactive / On Leave</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🏛️</div>
          <div>
            <div id="statDepartments" class="stat-value">0</div>
            <div class="stat-label">Departments</div>
          </div>
        </div>
      </div>

      <!-- Controls & Filter Toolbar -->
      <div class="toolbar">
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            id="studentSearchInput"
            placeholder="Search by name, student ID, email, or department..."
            autocomplete="off"
          />
        </div>
        <div class="filter-box">
          <select id="departmentFilter">
            <option value="">All Departments</option>
            <option value="Computer Science">Computer Science</option>
            <option value="Information Technology">Information Technology</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Business Administration">Business Administration</option>
          </select>
        </div>
      </div>

      <!-- Student Directory Table -->
      <div class="table-container">
        <table class="students-table">
          <thead>
            <tr>
              <th>Student ID</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Department</th>
              <th>Enrollment Date</th>
              <th>Status</th>
              <th style="text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody id="studentsTableBody">
            <tr>
              <td colspan="7" class="table-loading">Loading student records...</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div id="toastNotification" class="toast-notification"></div>
    `;
  }

  // Bind Toolbar Events
  const searchInput = document.getElementById('studentSearchInput');
  const departmentFilter = document.getElementById('departmentFilter');
  const addStudentBtn = document.getElementById('addStudentBtn');

  searchInput?.addEventListener('input', (e) => {
    currentSearch = e.target.value;
    loadAndRenderStudents();
  });

  departmentFilter?.addEventListener('change', (e) => {
    currentDepartment = e.target.value;
    loadAndRenderStudents();
  });

  addStudentBtn?.addEventListener('click', () => {
    openAddModal();
  });

  // Modal Close Handlers
  closeStudentModal?.addEventListener('click', () => closeAddEditModal());
  cancelStudentBtn?.addEventListener('click', () => closeAddEditModal());
  studentModal?.addEventListener('click', (e) => {
    if (e.target === studentModal) closeAddEditModal();
  });

  // Form Submit Handler
  studentForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    await handleFormSubmit();
  });

  function showModalMessage(msg, type = 'error') {
    if (!studentModalMessage) return;
    studentModalMessage.textContent = msg;
    studentModalMessage.className = `modal-message ${type}`;
    studentModalMessage.style.display = msg ? 'block' : 'none';
  }

  function showToast(msg, type = 'success') {
    const toast = document.getElementById('toastNotification');
    if (!toast) return;
    toast.textContent = msg;
    toast.className = `toast-notification ${type} show`;
    setTimeout(() => {
      toast.className = 'toast-notification';
    }, 3500);
  }

  function openAddModal() {
    editingStudentId = null;
    studentForm.reset();
    showModalMessage('');
    if (modalTitle) modalTitle.textContent = 'Add New Student';
    const dateInput = document.getElementById('studentEnrollmentDate');
    if (dateInput) dateInput.value = new Date().toISOString().split('T')[0];
    studentModal.style.display = 'flex';
    document.getElementById('studentName')?.focus();
  }

  function openEditModal(student) {
    editingStudentId = student.id;
    showModalMessage('');
    if (modalTitle) modalTitle.textContent = 'Edit Student Record';

    document.getElementById('studentCustomId').value = student.studentId || '';
    document.getElementById('studentName').value = student.name || '';
    document.getElementById('studentEmail').value = student.email || '';
    document.getElementById('studentDepartment').value = student.department || 'Computer Science';
    document.getElementById('studentStatus').value = student.status || 'Active';
    document.getElementById('studentEnrollmentDate').value = student.enrollmentDate || '';

    studentModal.style.display = 'flex';
    document.getElementById('studentName')?.focus();
  }

  function closeAddEditModal() {
    if (studentModal) studentModal.style.display = 'none';
    editingStudentId = null;
    studentForm?.reset();
    showModalMessage('');
  }

  async function handleFormSubmit() {
    const submitBtn = studentForm.querySelector('button[type="submit"]');
    const name = document.getElementById('studentName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const studentId = document.getElementById('studentCustomId').value.trim();
    const department = document.getElementById('studentDepartment').value;
    const status = document.getElementById('studentStatus').value;
    const enrollmentDate = document.getElementById('studentEnrollmentDate').value;

    if (!name || !email) {
      showModalMessage('Please fill in student name and email.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      if (editingStudentId) {
        await updateStudent(editingStudentId, {
          name,
          email,
          studentId: studentId || undefined,
          department,
          status,
          enrollmentDate,
        });
        showToast(`Student record for ${name} updated successfully!`);
      } else {
        await createStudent({
          name,
          email,
          studentId: studentId || undefined,
          department,
          status,
          enrollmentDate,
        });
        showToast(`Student ${name} successfully enrolled!`);
      }

      closeAddEditModal();
      await loadAndRenderStudents();
    } catch (err) {
      showModalMessage(err.message || 'Operation failed. Please try again.');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = editingStudentId ? 'Save Changes' : 'Enroll Student';
    }
  }

  async function loadAndRenderStudents() {
    const tbody = document.getElementById('studentsTableBody');
    if (!tbody) return;

    try {
      const response = await getStudents(currentSearch, currentDepartment);
      const students = response.students || [];

      // Update Quick Metrics
      updateStats(students);

      if (students.length === 0) {
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="table-empty">
              <div class="empty-state">
                <span class="empty-icon">📂</span>
                <p>No student records found matching your query.</p>
                ${currentSearch || currentDepartment ? '<button id="clearFilterBtn" class="link-btn">Clear filters</button>' : ''}
              </div>
            </td>
          </tr>
        `;
        document.getElementById('clearFilterBtn')?.addEventListener('click', () => {
          if (searchInput) searchInput.value = '';
          if (departmentFilter) departmentFilter.value = '';
          currentSearch = '';
          currentDepartment = '';
          loadAndRenderStudents();
        });
        return;
      }

      tbody.innerHTML = students
        .map(
          (student) => `
          <tr data-id="${student.id}">
            <td class="font-mono text-bold">${escapeHtml(student.studentId)}</td>
            <td>
              <div class="student-name-cell">
                <span class="avatar-circle">${escapeHtml(student.name.charAt(0).toUpperCase())}</span>
                <span>${escapeHtml(student.name)}</span>
              </div>
            </td>
            <td>${escapeHtml(student.email)}</td>
            <td><span class="dept-tag">${escapeHtml(student.department)}</span></td>
            <td>${escapeHtml(student.enrollmentDate || '—')}</td>
            <td>
              <span class="status-badge ${student.status === 'Active' ? 'status-active' : 'status-inactive'}">
                ● ${escapeHtml(student.status)}
              </span>
            </td>
            <td style="text-align: right;">
              <div class="row-actions">
                <button class="action-btn edit-btn" data-action="edit" data-id="${student.id}" title="Edit student">
                  ✏️ Edit
                </button>
                <button class="action-btn delete-btn" data-action="delete" data-id="${student.id}" title="Delete student">
                  🗑️
                </button>
              </div>
            </td>
          </tr>
        `
        )
        .join('');

      // Attach row action listeners
      tbody.querySelectorAll('button[data-action="edit"]').forEach((btn) => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const student = students.find((s) => s.id === id);
          if (student) openEditModal(student);
        });
      });

      tbody.querySelectorAll('button[data-action="delete"]').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.getAttribute('data-id');
          const student = students.find((s) => s.id === id);
          const confirmMsg = `Are you sure you want to remove ${student?.name || 'this student'}?`;
          if (window.confirm(confirmMsg)) {
            try {
              await deleteStudent(id);
              showToast('Student record deleted successfully.');
              loadAndRenderStudents();
            } catch (err) {
              showToast(err.message || 'Failed to delete student.', 'error');
            }
          }
        });
      });
    } catch (err) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="table-error">
            Unable to load student directory: ${escapeHtml(err.message)}
          </td>
        </tr>
      `;
    }
  }

  function updateStats(students) {
    const totalEl = document.getElementById('statTotalStudents');
    const activeEl = document.getElementById('statActiveStudents');
    const inactiveEl = document.getElementById('statInactiveStudents');
    const deptEl = document.getElementById('statDepartments');

    if (!totalEl) return;

    const total = students.length;
    const active = students.filter((s) => s.status === 'Active').length;
    const inactive = total - active;
    const depts = new Set(students.map((s) => s.department)).size;

    totalEl.textContent = String(total);
    activeEl.textContent = String(active);
    inactiveEl.textContent = String(inactive);
    deptEl.textContent = String(depts);
  }

  return {
    loadStudents: loadAndRenderStudents,
  };
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// กำหนด URL ของ Backend และรหัสผ่าน
const API_URL = 'http://localhost:3000/api/notes';
const SECRET_TOKEN = 'my_super_secret_token_123'; // ต้องตรงกับในไฟล์ .env ของ Backend

let notes = [];
let editingNoteId = null;

// 1. ดึงข้อมูลโน้ตจาก Backend (GET)
async function loadNotes() {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch notes');
    notes = await response.json();
    renderNotes();
  } catch (error) {
    console.error('Error loading notes:', error);
    // ตามโจทย์บอกว่าถ้ามี Error ให้แจ้งเตือนผู้ใช้ด้วย [cite: 41]
    alert('ไม่สามารถดึงข้อมูลโน้ตได้ กรุณาตรวจสอบว่าเซิร์ฟเวอร์ Backend รันอยู่หรือไม่');
  }
}

// 2. บันทึกโน้ตใหม่ไปที่ Backend (POST)
async function saveNote(event) {
  event.preventDefault();

  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();

  // ปิดโหมด Edit ไปก่อนเพราะโจทย์ Backend บังคับทำแค่ GET, POST, DELETE 
  if(editingNoteId) {
    alert("โหมดแก้ไขยังไม่รองรับใน API ปัจจุบัน");
    closeNoteDialog();
    return;
  }

  const newNoteData = { title, content };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': SECRET_TOKEN // ส่ง Token ไปยืนยันตัวตน [cite: 28]
      },
      body: JSON.stringify(newNoteData)
    });

    if (response.status === 401) {
      alert('Unauthorized: รหัส SECRET_TOKEN ไม่ถูกต้อง'); // จัดการ Error [cite: 41]
      return;
    }

    if (!response.ok) throw new Error('Failed to save note');

    // ถ้าบันทึกสำเร็จ ให้โหลดโน้ตใหม่ทั้งหมดมาแสดง
    await loadNotes();
    closeNoteDialog();

  } catch (error) {
    console.error('Error saving note:', error);
    alert('เกิดข้อผิดพลาดในการบันทึกโน้ต');
  }
}

// 3. ลบโน้ตจาก Backend (DELETE)
async function deleteNote(noteId) {
  // แจ้งเตือนยืนยันการลบ
  if (!confirm('คุณแน่ใจหรือไม่ว่าต้องการลบโน้ตนี้?')) return;

  try {
    const response = await fetch(`${API_URL}/${noteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': SECRET_TOKEN // ส่ง Token ไปยืนยันตัวตน [cite: 29]
      }
    });

    if (response.status === 401) {
      alert('Unauthorized: รหัส SECRET_TOKEN ไม่ถูกต้อง'); // จัดการ Error [cite: 41]
      return;
    }

    if (!response.ok) throw new Error('Failed to delete note');

    // ถ้าลบสำเร็จ ให้โหลดโน้ตใหม่ทั้งหมดมาแสดง
    await loadNotes();

  } catch (error) {
    console.error('Error deleting note:', error);
    alert('เกิดข้อผิดพลาดในการลบโน้ต');
  }
}

// --- ฟังก์ชันส่วน UI เดิม (ไม่มีการเปลี่ยนแปลงตรรกะหลัก) ---
function renderNotes() {
  const notesContainer = document.getElementById('notesContainer');

  if(notes.length === 0) {
    notesContainer.innerHTML = `
      <div class="empty-state">
        <h2>No notes yet</h2>
        <p>Create your first note to get started!</p>
        <button class="add-note-btn" onclick="openNoteDialog()">+ Add Your First Note</button>
      </div>
    `;
    return;
  }

  notesContainer.innerHTML = notes.map(note => `
    <div class="note-card">
      <h3 class="note-title">${note.title}</h3>
      <p class="note-content">${note.content}</p>
      <div class="note-actions">
        <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete Note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.88c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
          </svg>
        </button>
      </div>
    </div>
    `).join('');
}

function openNoteDialog(noteId = null) {
  const dialog = document.getElementById('noteDialog');
  const titleInput = document.getElementById('noteTitle');
  const contentInput = document.getElementById('noteContent');

  editingNoteId = null;
  document.getElementById('dialogTitle').textContent = 'Add New Note';
  titleInput.value = '';
  contentInput.value = '';

  dialog.showModal();
  titleInput.focus();
}

function closeNoteDialog() {
  document.getElementById('noteDialog').close();
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  document.getElementById('themeToggleBtn').textContent = isDark ? '☀️' : '🌙';
}

function applyStoredTheme() {
  if(localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme');
    document.getElementById('themeToggleBtn').textContent = '☀️';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  applyStoredTheme();
  loadNotes(); // เปลี่ยนมาเรียกใช้ loadNotes() แทนการกำหนดค่าตรงๆ

  document.getElementById('noteForm').addEventListener('submit', saveNote);
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme);

  document.getElementById('noteDialog').addEventListener('click', function(event) {
    if(event.target === this) {
      closeNoteDialog();
    }
  });
});
let notes = []
let editingNoteId = null

const API_URL = 'https://secure-note-app-rust.vercel.app/api/notes';
const SECRET_TOKEN = 'my_super_secret_token_12345'; // ต้องตรงกับในไฟล์ .env ของ Backend

async function loadNotes() {
  const notesContainer = document.getElementById('notesContainer');
  
  // 1. แสดงข้อความ/แอนิเมชัน Loading ก่อนเริ่ม Fetch
  notesContainer.innerHTML = `
    <div style="text-align: center; width: 100%; grid-column: 1 / -1; padding: 3rem;">
      <h2 style="color: var(--brand-color);">⏳ กำลังโหลดข้อมูลโน้ตของคุณ...</h2>
    </div>
  `;

  try {
    const response = await fetch(API_URL);
    if (!response.ok) {
      throw new Error('ไม่สามารถโหลดข้อมูลได้');
    }
    const data = await response.json();
    notes = data;
    renderNotes();
  } catch (error) {
    console.error('Error:', error);
    // แจ้งเตือนบนหน้าจอถ้า Backend มีปัญหา
    document.getElementById('notesContainer').innerHTML = `<p style="color:red; text-align:center;">เกิดข้อผิดพลาดในการโหลดข้อมูล: ${error.message}</p>`;
  }
}

async function saveNote(event) {
  event.preventDefault();

  const title = document.getElementById('noteTitle').value.trim();
  const content = document.getElementById('noteContent').value.trim();

  // ตรวจสอบว่าเป็นโหมดแก้ไข (มี editingNoteId) หรือโหมดสร้างใหม่ (null)
  const isEditMode = editingNoteId !== null;
  const url = isEditMode ? `${API_URL}/${editingNoteId}` : API_URL;
  const method = isEditMode ? 'PATCH' : 'POST'; // ✨ ใช้ PATCH ถ้าเป็นการแก้ไข

  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': SECRET_TOKEN
      },
      body: JSON.stringify({ title, content })
    });

    if (!response.ok) {
      const errData = await response.json();
      alert(`ดำเนินการไม่สำเร็จ: ${errData.error || response.statusText}`);
      return;
    }

    // เมื่อสำเร็จ ให้รีโหลดข้อมูลใหม่ (ล้างหน้าจอแล้ววาดใหม่)
    await loadNotes();
    closeNoteDialog();
    editingNoteId = null; // รีเซ็ต ID หลังจากเซฟเสร็จ

  } catch (error) {
    console.error('Error:', error);
    alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
  }
}

function generateId() {
  return Date.now().toString()
}

function saveNotes() {
  localStorage.setItem('quickNotes', JSON.stringify(notes))
}

async function deleteNote(noteId) {
  // เพิ่มการยืนยันก่อนลบเพื่อประสบการณ์ใช้งานที่ดี
  if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการลบโน้ตนี้?")) return;

  try {
    // ส่ง Request ไปที่ API พร้อมระบุ ID ของโน้ตที่ต้องการลบ
    const response = await fetch(`${API_URL}/${noteId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': SECRET_TOKEN // ต้องแนบรหัสลับไปด้วยเสมอ
      }
    });

    if (!response.ok) {
      // ดักจับ Error หากรหัสความลับไม่ถูกต้อง (เช่น 401 Unauthorized)
      const errData = await response.json();
      alert(`ลบไม่สำเร็จ: ${errData.error || response.statusText}`);
      return;
    }

    // ถ้าลบสำเร็จ (Status 200) ให้โหลดข้อมูลโน้ตใหม่จากเซิร์ฟเวอร์มาแสดงผล
    await loadNotes();

  } catch (error) {
    console.error('Error:', error);
    alert('ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
  }
}

function renderNotes() {
  const notesContainer = document.getElementById('notesContainer');

  if(notes.length === 0) {
    // show some fall back elements
    notesContainer.innerHTML = `
      <div class="empty-state">
        <h2>No notes yet</h2>
        <p>Create your first note to get started!</p>
        <button class="add-note-btn" onclick="openNoteDialog()">+ Add Your First Note</button>
      </div>
    `
    return
  }

  notesContainer.innerHTML = notes.map(note => `
    <div class="note-card">
      <h3 class="note-title">${note.title}</h3>
      <p class="note-content">${note.content}</p>
      <div class="note-actions">
        <button class="edit-btn" onclick="openNoteDialog('${note.id}')" title="Edit Note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
          </svg>
        </button>
        <button class="delete-btn" onclick="deleteNote('${note.id}')" title="Delete Note">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.88c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.38-.38.38-1.02 0-1.4z"/>
          </svg>
        </button>
      </div>

    </div>
    `).join('')
}

function openNoteDialog(noteId = null) {
  const dialog = document.getElementById('noteDialog');
  const titleInput = document.getElementById('noteTitle');
  const contentInput = document.getElementById('noteContent');

  if(noteId) {
    // Edit Mode
    const noteToEdit = notes.find(note => note.id === noteId)
    editingNoteId = noteId
    document.getElementById('dialogTitle').textContent = 'Edit Note'
    titleInput.value = noteToEdit.title
    contentInput.value = noteToEdit.content
  }
  else {
    // Add Mode
    editingNoteId = null
    document.getElementById('dialogTitle').textContent = 'Add New Note'
    titleInput.value = ''
    contentInput.value = ''
  }

  dialog.showModal()
  titleInput.focus()

}

function closeNoteDialog() {
  document.getElementById('noteDialog').close()
}

function toggleTheme() {
  const isDark = document.body.classList.toggle('dark-theme')
  localStorage.setItem('theme', isDark ? 'dark' : 'light')
  document.getElementById('themeToggleBtn').textContent = isDark ? '☀️' : '🌙'
}

function applyStoredTheme() {
  if(localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-theme')
    document.getElementById('themeToggleBtn').textContent = '☀️'
  }
}

document.addEventListener('DOMContentLoaded', function() {
  applyStoredTheme()
  loadNotes()

  document.getElementById('noteForm').addEventListener('submit', saveNote)
  document.getElementById('themeToggleBtn').addEventListener('click', toggleTheme)

  document.getElementById('noteDialog').addEventListener('click', function(event) {
    if(event.target === this) {
      closeNoteDialog()
    }
  })
})
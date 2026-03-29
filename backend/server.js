const express = require('express');
const cors = require('cors');
require('dotenv').config(); // โหลดตัวแปรจากไฟล์ .env

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET_TOKEN = process.env.SECRET_TOKEN;

// --- Middleware ---
// อนุญาตให้ Frontend (ซึ่งอาจจะเปิดจากไฟล์ index.html ตรงๆ หรือ Live Server) เรียก API ข้ามพอร์ตได้
app.use(cors()); 
// อนุญาตให้ Express อ่านข้อมูลที่ส่งมาเป็น JSON ได้
app.use(express.json()); 

// จำลอง Database ด้วย Array ไปก่อน (ตอนที่เซิร์ฟเวอร์ดับ ข้อมูลจะหาย ถ้าอยากได้คะแนนโบนัสค่อยเปลี่ยนเป็นบันทึกลงไฟล์ทีหลัง)
let notes = [];

// ฟังก์ชัน Middleware สำหรับเช็ค Token
const checkAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader === SECRET_TOKEN) {
    next(); // รหัสผ่านถูกต้อง ให้ทำงานใน Endpoint ถัดไป
  } else {
    // รหัสผ่านผิด หรือไม่ได้ส่งมา ส่ง Status 401 Unauthorized
    res.status(401).json({ error: 'Unauthorized: Invalid or missing token' });
  }
};

// --- API Endpoints ---

// 1. GET /api/notes - ดึงข้อมูลโน้ตทั้งหมด [cite: 27] (ไม่ต้องเช็ค Auth ตามโจทย์)
app.get('/api/notes', (req, res) => {
  res.status(200).json(notes);
});

// 2. POST /api/notes - สร้างโน้ตใหม่ [cite: 28] (ต้องผ่าน checkAuth ก่อน)
app.post('/api/notes', checkAuth, (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const newNote = {
    id: Date.now().toString(),
    title: title,
    content: content
  };

  notes.unshift(newNote); // นำโน้ตใหม่ไปไว้หน้าสุด
  res.status(201).json(newNote); // 201 Created
});

// 3. DELETE /api/notes/:id - ลบโน้ต [cite: 29] (ต้องผ่าน checkAuth ก่อน)
app.delete('/api/notes/:id', checkAuth, (req, res) => {
  const { id } = req.params;
  
  const noteIndex = notes.findIndex(note => note.id === id);

  if (noteIndex === -1) {
    return res.status(404).json({ error: 'Note not found' }); // 404 Not Found
  }

  notes.splice(noteIndex, 1);
  res.status(200).json({ message: 'Note deleted successfully' }); // 200 OK
});

// --- Start Server ---
app.listen(PORT, () => {
  console.log(`Backend Server is running on http://localhost:${PORT}`);
});
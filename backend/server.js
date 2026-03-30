const express = require('express');
const cors = require('cors');
require('dotenv').config();

const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(__dirname, 'notes.json');

// ฟังก์ชันสำหรับ Backup ข้อมูลลง JSON
const backupToJSON = async () => {
    try {
        const response = await fetch(POCKETHOST_URL, {
            headers: { 'Authorization': AUTH_HEADER }
        });
        const data = await response.json();
        fs.writeFileSync(DB_PATH, JSON.stringify(data.items || [], null, 2));
        console.log("📂 Backup to JSON successful");
    } catch (err) {
        console.error("❌ Backup failed", err);
    }
};

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const SECRET_TOKEN = process.env.SECRET_TOKEN; 

const POCKETHOST_URL = 'https://app-tracking.pockethost.io/api/collections/notes/records';
const AUTH_HEADER = 'Bearer 20260301eink'; // รหัสผ่านตามตัวอย่างอาจารย์

// Middleware ตรวจรหัส SECRET_TOKEN (สำหรับ POST, PATCH, DELETE)
const authenticate = (req, res, next) => {
    if (req.headers.authorization === SECRET_TOKEN) {
        next(); 
    } else {
        res.status(401).json({ error: 'Unauthorized: รหัสความลับไม่ถูกต้อง!' }); 
    }
};

// 1. List/Search (GET) - ดึงข้อมูลทั้งหมด
app.get('/api/notes', async (req, res) => {
    try {
        const response = await fetch(POCKETHOST_URL, {
            headers: { 'Authorization': AUTH_HEADER }
        });
        const data = await response.json();
        res.status(200).json(data.items || []); 
    } catch (error) {
        res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลได้' });
    }
});

// 2. View (GET by id) - ดูโน้ตตัวเดียวตาม ID ✨ (โจทย์ต้องการข้อนี้เพิ่ม)
app.get('/api/notes/:id', async (req, res) => {
    try {
        const response = await fetch(`${POCKETHOST_URL}/${req.params.id}`, {
            headers: { 'Authorization': AUTH_HEADER }
        });
        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(404).json({ error: 'ไม่พบโน้ตนี้' });
    }
});

// 3. Create (POST) - สร้างโน้ตใหม่
app.post('/api/notes', authenticate, async (req, res) => {
    const { title, content } = req.body;
    try {
        const response = await fetch(POCKETHOST_URL, {
            method: 'POST',
            headers: {
                'Authorization': AUTH_HEADER,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                title: title || "No Title", 
                content: content || "",
                user_id: 2 
            })
        });
        const result = await response.json();
        
        await backupToJSON();

        res.status(201).json(result); 
    } catch (error) {
        res.status(500).json({ error: 'สร้างโน้ตไม่สำเร็จ' });
    }
});

// 4. Update (PATCH) - แก้ไขข้อมูลโน้ต ✨ (โจทย์ต้องการข้อนี้เพิ่ม)
app.patch('/api/notes/:id', authenticate, async (req, res) => {
    const { title, content } = req.body;
    try {
        const response = await fetch(`${POCKETHOST_URL}/${req.params.id}`, {
            method: 'PATCH',
            headers: {
                'Authorization': AUTH_HEADER,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ title, content })
        });
        const result = await response.json();

        await backupToJSON();

        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ error: 'แก้ไขไม่สำเร็จ' });
    }
});

// 5. Delete (DELETE) - ลบโน้ต
app.delete('/api/notes/:id', authenticate, async (req, res) => {
    try {
        await fetch(`${POCKETHOST_URL}/${req.params.id}`, {
            method: 'DELETE',
            headers: { 'Authorization': AUTH_HEADER }
        });

        await backupToJSON();

        res.status(200).json({ message: 'ลบโน้ตสำเร็จ' });
    } catch (error) {
        res.status(500).json({ error: 'ลบไม่สำเร็จ' });
    }
});

app.get('/', (req, res) => {
    res.send('SecureNote Backend is running with Full CRUD on PocketHost!');
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
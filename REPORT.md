# SecureNote - Conceptual Report

## 1. JS Engine vs. Runtime
* [cite_start]**JS Engine:** คือตัวแปลภาษาและรันโค้ด JavaScript (เช่น V8 Engine ที่อยู่ใน Chrome และ Node.js) หน้าที่ของมันคือการทำความเข้าใจโค้ดที่เราเขียน [cite: 44, 45]
* [cite_start]**Runtime Environment:** คือสภาพแวดล้อมที่โค้ดไปรันอยู่ ซึ่งจะเตรียมเครื่องมือ (APIs) ต่างๆ ไว้ให้ Engine เรียกใช้ [cite: 44, 45]
  * [cite_start]**Frontend (Browser Runtime):** โค้ดฝั่งหน้าบ้านของโปรเจกต์นี้รันบน Browser ซึ่งมี API อย่าง `window`, `document` (DOM) และ `fetch` ให้ใช้งาน [cite: 44, 45]
  * [cite_start]**Backend (Node.js Runtime):** โค้ดฝั่งหลังบ้านรันบน Node.js ซึ่งไม่มี DOM แต่มีเครื่องมือสำหรับทำ Server เช่น การจัดการ File System หรือการเข้าถึงตัวแปรผ่าน `process.env` [cite: 44, 45]

## 2. DOM Manipulation
[cite_start]โปรเจกต์นี้ใช้ Vanilla JS ในการอัปเดตหน้าจอ [cite: 46] 
[cite_start]เมื่อมีการดึงข้อมูลโน้ตสำเร็จ โค้ดจะใช้ฟังก์ชันอย่าง `document.getElementById('notesContainer')` เพื่อเข้าถึง DOM element บนหน้าเว็บ จากนั้นใช้การกำหนดค่า `.innerHTML` เพื่ออัปเดตโครงสร้าง HTML ภายใน ทำให้หน้าจอเปลี่ยนแปลงและแสดงข้อมูลโน้ตใหม่ได้ทันทีโดยที่ผู้ใช้ไม่ต้องกด Refresh หน้าเว็บ (Dynamic UI) [cite: 46]

## 3. HTTP/HTTPS Request/Response Cycle
* [cite_start]**เมื่อกดปุ่ม "Submit":** โค้ดฝั่ง Frontend จะใช้ `fetch()` ส่ง **HTTP POST Request** ไปยัง Backend [cite: 48]
* [cite_start]**Headers ที่ส่งไป:** ใน Request จะมีการแนบ Header สำคัญไปด้วย คือ `Content-Type: application/json` (เพื่อบอกว่าส่งข้อมูลเป็น JSON) และ `Authorization: <SECRET_TOKEN>` (เพื่อยืนยันตัวตน) [cite: 48]
* [cite_start]**ความสำคัญของ HTTPS:** แม้ว่าตอนพัฒนาเราจะใช้ HTTP (localhost) แต่ใน Production เราจำเป็นต้องใช้ HTTPS เสมอ เพราะ HTTPS จะเข้ารหัสข้อมูลที่ส่งไปมาระหว่าง Client และ Server ป้องกันไม่ให้แฮกเกอร์ดักจับข้อมูลกลางทางได้ (เช่น ดักจับรหัส SECRET_TOKEN หรือเนื้อหาของโน้ต) [cite: 49]

## 4. Environment Variables
* [cite_start]**เหตุผลที่เก็บ SECRET_TOKEN ไว้ใน Backend:** เราเก็บรหัสผ่านไว้ในไฟล์ `.env` ที่ฝั่ง Backend เพื่อให้ข้อมูลความลับนี้อยู่แค่บนเซิร์ฟเวอร์เท่านั้น [cite: 50]
* **ถ้าเอาไปไว้ใน Frontend จะเกิดอะไรขึ้น?:** โค้ด Frontend ทั้งหมดจะถูกดาวน์โหลดไปรันที่เครื่องของผู้ใช้ (Browser) หากเราใส่ Token ไว้ในโค้ด Frontend ผู้ใช้ทุกคนจะสามารถกดคลิกขวา -> "View Page Source" หรือดูผ่าน Developer Tools เพื่อขโมยรหัสผ่านนี้ไปลบโน้ตหรือเจาะระบบของเราได้อย่างง่ายดาย [cite: 51]
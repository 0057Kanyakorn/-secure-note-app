# SecureNote - Conceptual Report

## 1. JS Engine vs. Runtime Environment
* **JS Engine:** คือโปรแกรมที่มีหน้าที่ในการแปลภาษา (Parse) และประมวลผล (Execute) โค้ด JavaScript ให้กลายเป็นภาษาเครื่อง (Machine Code) ตัวอย่างที่ชัดเจนคือ V8 Engine ที่อยู่เบื้องหลัง Google Chrome และ Node.js หน้าที่หลักของมันคือการทำความเข้าใจ Syntax และ Logic ของโค้ดที่เราเขียน
* **Runtime Environment:** คือสภาพแวดล้อมที่ JS Engine เข้าไปทำงานอยู่ ซึ่งจะทำหน้าที่จัดเตรียมเครื่องมือ (APIs) ต่างๆ เพิ่มเติมให้โค้ด JavaScript สามารถนำไปเรียกใช้งานได้
  * **Frontend (Browser Runtime):** โค้ดฝั่งหน้าบ้านของโปรเจกต์นี้ทำงานบน Browser ซึ่งมี Web APIs เตรียมไว้ให้ เช่น `window`, `document` (DOM) และ `fetch` สำหรับการจัดการหน้าเว็บและการดึงข้อมูล
  * **Backend (Node.js Runtime):** โค้ดฝั่งหลังบ้านทำงานบน Node.js ซึ่งจะไม่มี DOM ให้ใช้งาน แต่จะเตรียมเครื่องมือสำหรับการทำเซิร์ฟเวอร์มาให้แทน เช่น การจัดการ File System หรือการเข้าถึงตัวแปรผ่าน `process.env`

## 2. DOM Manipulation
โปรเจกต์นี้ใช้ Vanilla JS ในการอัปเดตและควบคุมหน้าจอผู้ใช้ (User Interface)
การทำงานเริ่มต้นเมื่อมีการดึงข้อมูลโน้ตสำเร็จ โค้ดจะใช้ฟังก์ชันอย่าง `document.getElementById('notesContainer')` เพื่ออ้างอิงไปยัง DOM Element บนหน้าเว็บ จากนั้นจะใช้การกำหนดค่าผ่าน `.innerHTML` เพื่ออัปเดตโครงสร้าง HTML ภายใน Element นั้นๆ กระบวนการนี้ทำให้หน้าจอเกิดการเปลี่ยนแปลงและแสดงข้อมูลโน้ตใหม่ได้ทันทีแบบ Dynamic UI โดยที่ผู้ใช้ไม่จำเป็นต้องกด Refresh หน้าเว็บใหม่

## 3. HTTP/HTTPS Request/Response Cycle
* **การทำงานเมื่อผู้ใช้กด "Submit":** โค้ดฝั่ง Frontend จะใช้ `Fetch API` ในการสร้างและส่ง **HTTP POST Request** ไปยังเซิร์ฟเวอร์ (Backend)
* **Headers ที่สำคัญ:** ใน Request จะมีการแนบ Header ที่จำเป็นไปด้วย ได้แก่ `Content-Type: application/json` เพื่อแจ้งให้เซิร์ฟเวอร์ทราบว่ารูปแบบข้อมูลที่ส่งไปคือ JSON และ `Authorization` เพื่อใช้ส่ง Token สำหรับการยืนยันตัวตนว่าผู้ใช้มีสิทธิ์สร้างหรือลบโน้ต
* **ความสำคัญของ HTTPS:** แม้ว่าในขั้นตอนการพัฒนา (Development) เราจะใช้ HTTP (localhost) แต่ในระดับ Production การใช้ HTTPS เป็นสิ่งจำเป็นอย่างยิ่ง เนื่องจาก HTTPS จะทำการเข้ารหัส (Encryption) ข้อมูลที่รับส่งระหว่าง Client และ Server เพื่อป้องกันไม่ให้ผู้ไม่หวังดีสามารถดักจับข้อมูล (Man-in-the-middle attack) ระหว่างทางได้ โดยเฉพาะข้อมูลที่ละเอียดอ่อนเช่น `SECRET_TOKEN` หรือเนื้อหาของโน้ต

## 4. Environment Variables & Security
* **เหตุผลที่ต้องเก็บ Configuration ไว้ใน Backend:** เราจำเป็นต้องเก็บข้อมูลที่เป็นความลับ เช่น `SECRET_TOKEN` หรือพอร์ตการเชื่อมต่อ ไว้ในไฟล์ `.env` ที่ฝั่ง Backend เสมอ เพื่อให้ข้อมูลความลับเหล่านี้อยู่บนเซิร์ฟเวอร์อย่างปลอดภัยและไม่ถูกเปิดเผยสู่สาธารณะ
* **ความเสี่ยงหากเก็บไว้ใน Frontend:** โค้ด Frontend ทั้งหมดจะต้องถูกดาวน์โหลดไปประมวลผลที่เครื่องของผู้ใช้ (Browser) หากเราใส่ข้อมูลความลับจำพวก API Keys หรือ Token ไว้ในโค้ด Frontend ผู้ใช้ทุกคนจะสามารถเข้าถึงรหัสผ่านเหล่านั้นได้อย่างง่ายดายผ่านการดู "Page Source" หรือใช้ Developer Tools ซึ่งอาจนำไปสู่การถูกขโมยสิทธิ์เพื่อเข้าไปลบข้อมูลหรือเจาะระบบของเราได้

## 5. Cloud Deployment & HTTPS (Bonus)
โปรเจกต์นี้ได้รับการออกแบบให้สามารถ Deploy ขึ้น Cloud Host Provider (เช่น Render หรือ Vercel) ได้ กระบวนการมีดังนี้:
1. **แยกการ Deploy:** นำโค้ดฝั่ง Backend (Node.js) ไป Deploy เป็น Web Service (เช่น บน Render.com) และนำฝั่ง Frontend ไป Deploy บนบริการ Static Site (เช่น Vercel หรือ GitHub Pages)
2. **Environment Variables:** ในหน้า Dashboard ของ Cloud Provider เราจะตั้งค่าตัวแปร `PORT`, `SECRET_TOKEN` และ `POCKETHOST_TOKEN` ไว้ใน Environment Setting เพื่อไม่ให้ความลับหลุดไปอยู่ใน Source Code
3. **HTTPS โดยอัตโนมัติ:** Cloud Provider เหล่านี้จะบังคับใช้และออก Certificate `HTTPS` ให้อัตโนมัติ (Automated TLS/SSL) ซึ่งตรงกับเงื่อนไขการนำไปใช้จริงบน Production เพื่อเข้ารหัสข้อมูล Headers และ Payloads ทั้งหมดระหว่าง Frontend และ Backend

*(หมายเหตุ: ในการทดสอบโปรเจกต์นี้ อาจมีการจำลองใส่ Token ลงในตัวแปรฝั่ง Frontend เพื่อความสะดวกในการทดสอบ แต่ในระบบจริง Token ควรได้มาจากการ Login ของผู้ใช้ ไม่ใช่การ Hardcode ลงใน Source Code)*
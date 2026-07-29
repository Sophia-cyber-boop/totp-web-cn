const express = require('express');
const crypto = require('crypto');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ========== 新增：根路径响应 ==========
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
// ======================================

function generateTOTP(hexKey) {
    const step = 30;
    const digits = 8;
    const time = Math.floor(Date.now() / 1000);
    const timeSlice = Math.floor(time / step);
    const buffer = Buffer.alloc(8);
    buffer.writeBigUInt64BE(BigInt(timeSlice));
    const keyBuffer = Buffer.from(hexKey, 'hex');
    const hmac = crypto.createHmac('sha1', keyBuffer);
    hmac.update(buffer);
    const result = hmac.digest();
    const offset = result[result.length - 1] & 0x0f;
    const code = (result.readUInt32BE(offset) & 0x7fffffff) % 100000000;
    return code.toString().padStart(8, '0');
}

app.post('/api/generate', (req, res) => {
    const { key } = req.body;
    if (!/^[0-9a-fA-F]{40}$/.test(key)) {
        return res.status(400).json({ error: '必须是40位十六进制密钥' });
    }
    const code = generateTOTP(key);
    res.json({ code });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("服务器启动成功，端口：" + PORT);
});

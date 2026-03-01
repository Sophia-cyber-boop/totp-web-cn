const express = require("express");
const speakeasy = require("speakeasy");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 关键：托管 public 目录
app.use(express.static("public"));

app.post("/api/generate", (req, res) => {
    const { key } = req.body;

    if (!key || !/^[0-9a-fA-F]{40}$/.test(key)) {
        return res.json({ error: "无效密钥" });
    }

    try {
        const token = speakeasy.totp({
            secret: key,
            encoding: "hex",
            step: 30
        });

        res.json({ code: token });
    } catch (err) {
        res.json({ error: "生成失败" });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("服务器已启动，端口：" + PORT);
});

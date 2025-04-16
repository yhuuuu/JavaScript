接下来我会提供以下文件内容：
✅ users.json（初始空数组）

✅ public/index.html（登录 + 注册页面）

✅ public/script.js（表单验证 + 发送请求）

✅ JWT 登录状态处理（在你的 server.js 上加一点）

✅ .env 文件 + dotenv 用于读取密钥

Register
-----------
[ 🧑 用户 ]
    ↓ 输入用户名、邮箱、密码
    ↓
[ 🌐 前端 JavaScript (register.js) ]
    - 实时表单验证
    - 点击提交 → 触发 fetch('/register')
    ↓
fetch('/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, email, password })
})
    ↓
[ 🛠 Node.js + Express 后端 ]
    - 接收到 POST /register 请求
    - 解析 JSON 数据（req.body）
    - 检查用户名/邮箱是否已存在
    - 加密密码（bcrypt.hash）
    - 保存进 users.json 文件
    ↓
fs.writeFileSync('users.json', 新用户数组)
    ↓
返回 JSON 响应 → { message: 'User registered successfully' }
    ↓
[ 🌐 前端 JavaScript ]
    - 用 await 等待服务器响应
    - 显示 success ✅ 或 error ❌ 消息

    

Login
---------
[ 🧑 用户 ]
    ↓ 输入用户名和密码
    ↓ 点击登录按钮
    ↓
[ 🌐 前端 JavaScript (login.js) ]
    - 执行 fetch('/login', { method: 'POST', body: JSON.stringify(...) })
    ↓
fetch('/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
})
    ↓
[ 🛠 Node.js + Express 后端 ]
    - 接收到 POST /login 请求
    - 使用 readUsers() 读取 users.json
    - 查找匹配的用户名：
        const user = users.find(u => u.username === username)
    ↓
  找不到用户？
    → 返回 400: { message: 'User not found' }
  找到用户？→ 继续比对密码：
    await bcrypt.compare(输入密码, 用户存的 hash 密码)
        ↓
    如果密码匹配 ✅
      → 返回 200: { message: 'Login successful' }
    如果密码错误 ❌
      → 返回 401: { message: 'Invalid password' }
    ↓
[ 🌐 前端 JavaScript ]
    - 用 await 等待服务器响应
    - 显示成功 ✅ 或失败 ❌ 消息
    - 可选：登录成功后跳转到 dashboard 页面



    💡 提示：登录成功后你可以做什么？
你可以：

设置 Cookie 来保存登录状态（需要 express-session 或 cookie-parser）

返回一个 JWT（JSON Web Token）来实现“持久登录”

临时存储登录信息到浏览器的 localStorage/sessionStorage


// server.js
const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = 3000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/user-auth', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('✅ Connected to MongoDB');
});

// User schema
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String
});
const User = mongoose.model('User', userSchema);

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// Register route
app.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  const existingUser = await User.findOne({ $or: [{ username }, { email }] });
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = new User({ username, email, password: hashedPassword });

  await newUser.save();
  res.status(201).json({ message: 'User registered successfully' });
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) return res.status(400).json({ message: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid password' });

  res.json({ message: 'Login successful' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
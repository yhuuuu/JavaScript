// server.js

//用来搭建 Web 服务器的核心框架（处理请求、响应等）
const express = require('express');
//Node.js 自带的文件系统模块，用来读写本地文件（比如 users.json）
const fs = require('fs');
//Node.js 自带模块，处理文件路径
const path = require('path');
//密码加密工具，保护用户密码
const bcrypt = require('bcrypt');
//解析从前端发送来的 JSON 数据
const bodyParser = require('body-parser');
//允许跨域请求（前端可能在 localhost:5500，后端在 localhost:3000）
const cors = require('cors');

//	初始化一个 Express 应用
const app = express();
// 设置服务器监听的端口号（之后访问就是 http://localhost:3000）
const PORT = 3000;
// 设置用户数据文件的路径（路径为当前文件夹下的 users.json）
const USERS_FILE = path.join(__dirname, 'users.json');

//允许浏览器从不同源发送请求（不然会被阻止）
app.use(cors());
//解析前端发送的 JSON 数据（req.body 才能读到内容）
app.use(bodyParser.json()); 
//让浏览器能直接访问 public 文件夹中的内容（HTML、JS、CSS）
app.use(express.static('public'));

// Helper: read users.json
function readUsers() {
  //检查 users.json 文件是否存在
  if (!fs.existsSync(USERS_FILE)) return [];
  // 如果文件存在，它会用 fs.readFileSync() 读取整个 users.json 文件的内容
  const data = fs.readFileSync(USERS_FILE);
  //把读取到的字符串转换成 JavaScript 数组（对象数组），方便我们在后续中查找、添加用户等操作
  return JSON.parse(data);
}

// Helper: write users.json
//这个函数将用户数据数组 users 写入 本地的 users.json 文件
function writeUsers(users) {
  //把 JavaScript 对象数组转换成格式化的 JSON 字符串（2 表示缩进 2 个空格，方便看）
  //用 Node.js 的文件系统模块同步地写入文件（也就是说，写完文件这行代码才结束）
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Register route
app.post('/register', async (req, res) => {
  //解构用户提交的数据
  const { username, email, password } = req.body;
  //从本地 JSON 文件 users.json 读取所有注册用户数据
  const users = readUsers();

  const existingUser = users.find(
    u => u.username === username || u.email === email
  );
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }
  //使用 bcrypt 给用户密码加密
  const hashedPassword = await bcrypt.hash(password, 10);
  //把新的用户数据（含加密密码）添加到数组里。
  users.push({ username, email, password: hashedPassword });
  // 把更新后的用户列表写回 users.json 文件，完成持久保存。
  writeUsers(users);

  res.status(201).json({ message: 'User registered successfully' });
});

// Login route
app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const users = readUsers();

  const user = users.find(u => u.username === username);
  if (!user) return res.status(400).json({ message: 'User not found' });

  const match = await bcrypt.compare(password, user.password);
  if (!match) return res.status(401).json({ message: 'Invalid password' });

  res.json({ message: 'Login successful' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
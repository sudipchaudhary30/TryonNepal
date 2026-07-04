const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/tryonnepal';
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

function createToken(userId) {
  return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: '7d' });
}

function setAuthCookie(res, token) {
  res.cookie('token', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

function clearAuthCookie(res) {
  res.clearCookie('token', {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
  });
}

function getUserFromRequest(req) {
  const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    return payload.sub;
  } catch {
    return null;
  }
}

app.get('/health', (_req, res) => res.json({ ok: true }));

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'An account with this email already exists.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash });
    const token = createToken(user._id.toString());
    setAuthCookie(res, token);

    return res.status(201).json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: null,
        age: null,
        heightCm: null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const token = createToken(user._id.toString());
    setAuthCookie(res, token);

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        avatarUrl: null,
        age: null,
        heightCm: null,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.createdAt.toISOString(),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Login failed.' });
  }
});

app.post('/api/auth/logout', (_req, res) => {
  clearAuthCookie(res);
  return res.json({ ok: true });
});

app.get('/api/auth/me', async (req, res) => {
  const userId = getUserFromRequest(req);
  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const user = await User.findById(userId).lean();
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  return res.json({
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      avatarUrl: null,
      age: null,
      heightCm: null,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.createdAt.toISOString(),
    },
  });
});

app.patch('/api/users/me', async (req, res) => {
  const userId = getUserFromRequest(req);
  if (!userId) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const user = await User.findById(userId);
  if (!user) {
    return res.status(401).json({ message: 'Not authenticated.' });
  }

  const updates = req.body || {};
  if (typeof updates.name === 'string') user.name = updates.name;
  if (typeof updates.heightCm === 'number') user.heightCm = updates.heightCm;
  if (typeof updates.age === 'number') user.age = updates.age;
  await user.save();

  return res.json({
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    avatarUrl: null,
    age: user.age ?? null,
    heightCm: user.heightCm ?? null,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt?.toISOString?.() || user.createdAt.toISOString(),
  });
});

async function start() {
  await mongoose.connect(MONGODB_URI);
  app.listen(PORT, () => {
    console.log(`Auth server listening on port ${PORT}`);
  });
}

if (require.main === module) {
  start().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

module.exports = { app, start, User };

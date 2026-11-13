import { Router, Request, Response } from 'express';
import { store } from '../data/store.js';
import { UserRole } from '../types/index.js';

const router = Router();

// Login
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  const user = store.getUserByEmail(email);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Demo simple check
  if (password && user.password && user.password !== password) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { password: _, ...userWithoutPassword } = user;
  return res.json({
    user: userWithoutPassword,
    token: `demo-token-${user.id}-${Date.now()}`
  });
});

// Demo 1-click Quick Login
router.post('/demo-login', (req: Request, res: Response) => {
  const { role } = req.body as { role: UserRole };
  const user = store.getUsers().find(u => u.role === role);

  if (!user) {
    return res.status(404).json({ error: 'Demo user not found for role' });
  }

  const { password: _, ...userWithoutPassword } = user;
  return res.json({
    user: userWithoutPassword,
    token: `demo-token-${user.id}-${Date.now()}`
  });
});

// Register
router.post('/register', (req: Request, res: Response) => {
  const { name, email, password, role = 'student', phone, village, institution } = req.body;
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  const existing = store.getUserByEmail(email);
  if (existing) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  const newUser = store.addUser({
    id: `user-${Date.now()}`,
    name,
    email,
    password: password || 'password123',
    role: role as UserRole,
    phone: phone || '+91 99000 00000',
    village: village || 'Kinnigoli',
    institution: institution || "Alva's College",
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: new Date().toISOString()
  });

  const { password: _, ...userWithoutPassword } = newUser;
  return res.status(201).json({
    user: userWithoutPassword,
    token: `demo-token-${newUser.id}-${Date.now()}`
  });
});

export default router;

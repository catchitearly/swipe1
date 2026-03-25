import express from 'express';
import bcrypt from 'bcryptjs';
import { generateToken } from '../middleware/auth.js';

const router = express.Router();

// Register influencer
router.post('/register/influencer', async (req, res) => {
  const prisma = req.app.get('prisma');
  const { email, password, name } = req.body;

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'influencer'
      }
    });

    const token = generateToken(user);
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role: user.role,
        isVerified: user.isVerified
      }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Register brand
router.post('/register/brand', async (req, res) => {
  const prisma = req.app.get('prisma');
  const { email, password, name, description } = req.body;

  try {
    const existingBrand = await prisma.brand.findUnique({ where: { email } });
    if (existingBrand) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const brand = await prisma.brand.create({
      data: {
        email,
        password: hashedPassword,
        name,
        description
      }
    });

    const token = generateToken({ ...brand, role: 'brand' });
    res.json({ 
      brand: { 
        id: brand.id, 
        email: brand.email, 
        name: brand.name,
        role: 'brand'
      }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  const prisma = req.app.get('prisma');
  const { email, password } = req.body;

  try {
    // Try influencer first
    let user = await prisma.user.findUnique({ where: { email } });
    let role = 'influencer';

    // If not found, try brand
    if (!user) {
      user = await prisma.brand.findUnique({ where: { email } });
      role = 'brand';
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken({ ...user, role });
    
    res.json({ 
      user: { 
        id: user.id, 
        email: user.email, 
        name: user.name, 
        role,
        ...(role === 'influencer' ? { 
          isVerified: user.isVerified,
          followerCount: user.followerCount
        } : {})
      }, 
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
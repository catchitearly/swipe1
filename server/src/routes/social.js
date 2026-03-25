import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Social login - Google
router.post('/google', async (req, res) => {
  try {
    const { googleToken, name, email, avatar } = req.body;
    
    // In production, verify the Google token with Google API
    // For now, we accept the token and create/find user
    
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatar,
          role: 'influencer',
          isVerified: false,
          password: await bcrypt.hash(googleToken.slice(0, 20), 10), // Placeholder
        },
      });
    } else {
      // Update avatar and name if provided
      if (name || avatar) {
        user = await prisma.user.update({
          where: { id: user.id },
          data: { ...(name && { name }), ...(avatar && { avatar }) },
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
      },
      token,
      message: 'Logged in with Google',
    });
  } catch (error) {
    res.status(500).json({ error: 'Google login failed', details: error.message });
  }
});

// Social login - Facebook
router.post('/facebook', async (req, res) => {
  try {
    const { facebookToken, name, email, avatar } = req.body;
    
    // In production, verify the Facebook token with Facebook API
    
    let user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          name,
          avatar,
          role: 'influencer',
          isVerified: false,
          password: await bcrypt.hash(facebookToken.slice(0, 20), 10),
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
        avatar: user.avatar,
      },
      token,
      message: 'Logged in with Facebook',
    });
  } catch (error) {
    res.status(500).json({ error: 'Facebook login failed', details: error.message });
  }
});

// Social login - Apple
router.post('/apple', async (req, res) => {
  try {
    const { appleToken, name, email } = req.body;
    
    // Apple sign-in returns a user identifier
    
    let user;
    if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    }
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: email || `apple-${Date.now()}@placeholder.com`,
          name: name || 'Apple User',
          role: 'influencer',
          isVerified: true, // Apple verification is trusted
          password: await bcrypt.hash(appleToken.slice(0, 20), 10),
        },
      });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default-secret',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isVerified: user.isVerified,
      },
      token,
      message: 'Logged in with Apple',
    });
  } catch (error) {
    res.status(500).json({ error: 'Apple login failed', details: error.message });
  }
});

export default router;
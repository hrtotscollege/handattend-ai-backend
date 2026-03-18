import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-prod';

export async function getUserFromRequest(req: NextRequest | Request) {
  const cookieHeader = req.headers.get('cookie');
  const token = cookieHeader?.includes('auth-token=') 
    ? cookieHeader.split('auth-token=')[1].split(';')[0] 
    : null;
  
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded || !decoded.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, role: true, isActive: true }
    });

    if (!user || !user.isActive) return null;

    return user;
  } catch (e) {
    return null;
  }
}

export async function requireAuth(req: NextRequest | Request) {
  const user = await getUserFromRequest(req);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}

export async function requireAdmin(req: NextRequest | Request) {
  const user = await requireAuth(req);
  if (user.role !== 'ADMIN') {
    throw new Error('Forbidden');
  }
  return user;
}

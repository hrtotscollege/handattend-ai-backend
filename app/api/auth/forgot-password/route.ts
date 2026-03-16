import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Initialize Resend lazily
    const resend = new Resend(process.env.RESEND_API_KEY || 'dummy_key');

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (user) {
      // 1. Generate a secure token
      const token = crypto.randomBytes(32).toString('hex');
      const expiry = new Date(Date.now() + 3600000); // 1 hour from now

      // 2. Save it to the database
      // Note: We're using the fields we added to the schema earlier
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetToken: token,
          resetTokenExpiry: expiry
        }
      });

      // 3. Send the email
      const resetLink = `${process.env.APP_URL}/reset-password?token=${token}`;
      
      if (process.env.RESEND_API_KEY) {
        await resend.emails.send({
          from: 'HandAttend AI <onboarding@resend.dev>',
          to: email,
          subject: 'Reset your password',
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>Password Reset Request</h2>
              <p>You requested a password reset for your HandAttend AI account.</p>
              <p>Click the button below to reset your password. This link will expire in 1 hour.</p>
              <div style="margin: 30px 0;">
                <a href="${resetLink}" style="background-color: #000; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
              </div>
              <p>If you didn't request this, you can safely ignore this email.</p>
              <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
              <p style="font-size: 12px; color: #666;">HandAttend AI - Attendance Management System</p>
            </div>
          `
        });
      } else {
        console.warn('RESEND_API_KEY is not set. Email not sent.');
        console.log(`Reset link for ${email}: ${resetLink}`);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'If an account exists for this email, you will receive a password reset link shortly.' 
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    if (error.code) {
      console.error('Prisma Error Code:', error.code);
      console.error('Prisma Error Meta:', error.meta);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

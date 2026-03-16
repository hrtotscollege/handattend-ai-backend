import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  response.cookies.set({
    name: 'auth-token',
    value: '',
    httpOnly: true,
    path: '/',
    secure: true,
    sameSite: 'none',
    expires: new Date(0)
  });

  return response;
}

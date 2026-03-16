'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, ArrowLeft, Mail } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      setMessage('If an account exists for this email, you will receive a password reset link shortly.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4">
      <div className="w-full max-w-md space-y-8 rounded-xl bg-background p-8 shadow-md">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary" />
            <span className="ml-2 text-2xl font-bold">HandAttend AI</span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
          <p className="text-sm text-muted-foreground">
            Enter your email address and we&apos;ll send you a link to reset your password.
          </p>
        </div>

        {message ? (
          <div className="space-y-6">
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-700 border border-green-200">
              <div className="flex">
                <Mail className="h-5 w-5 mr-2" />
                <span>{message}</span>
              </div>
            </div>
            <Link 
              href="/login" 
              className="flex items-center justify-center text-sm font-medium text-primary hover:underline"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/15 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="m@example.com"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Sending link...' : 'Send reset link'}
            </Button>

            <div className="text-center">
              <Link 
                href="/login" 
                className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary hover:underline"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to login
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

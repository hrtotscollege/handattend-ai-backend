import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const user = await requireAuth(req);

    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(employees);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await requireAuth(req);

    const data = await req.json();
    
    // Validate required fields
    if (!data.employeeId || !data.nameArabic) {
      return NextResponse.json({ error: 'Employee ID and Name are required' }, { status: 400 });
    }

    const employee = await prisma.employee.create({
      data: {
        employeeId: data.employeeId,
        nameArabic: data.nameArabic,
        department: data.department || null,
      }
    });
    
    return NextResponse.json(employee);
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('Error creating employee:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Employee ID already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}

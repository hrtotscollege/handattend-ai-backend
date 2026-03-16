import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    return NextResponse.json({ error: 'Failed to fetch employees' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
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
    console.error('Error creating employee:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Employee ID already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create employee' }, { status: 500 });
  }
}

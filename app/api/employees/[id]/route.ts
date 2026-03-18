import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);

    const { id } = await params;
    const data = await req.json();

    const employee = await prisma.employee.update({
      where: { id },
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
    console.error('Error updating employee:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Employee ID already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update employee' }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);

    const { id } = await params;

    await prisma.$transaction(async (tx) => {
      // Set employeeId to null in RecognizedData
      await tx.recognizedData.updateMany({
        where: { employeeId: id },
        data: { employeeId: null }
      });

      // Delete AttendanceRecords
      await tx.attendanceRecord.deleteMany({
        where: { employeeId: id }
      });

      // Delete the employee
      await tx.employee.delete({
        where: { id }
      });
    });

    return NextResponse.json({ success: true, message: 'Employee deleted successfully' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    console.error('Error deleting employee:', error);
    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'Employee not found' }, { status: 404 });
    }
    return NextResponse.json({ error: 'Failed to delete employee' }, { status: 500 });
  }
}

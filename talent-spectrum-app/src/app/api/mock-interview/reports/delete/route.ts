// talent-spectrum-app/src/app/api/mock-interview/reports/delete/route.ts

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id parameter is required' }, { status: 400 });
    }

    const response = await fetch(
      `${BACKEND_URL}/mock-interview/reports/${encodeURIComponent(id)}`,
      {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any));
      return NextResponse.json(
        { error: (errorData as any).detail || 'Failed to delete report' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error deleting mock interview report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


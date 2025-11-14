// talent-spectrum-app/src/app/api/mock-interview/reports/highest-score/route.ts

import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    if (!email) {
      return NextResponse.json({ error: 'email parameter is required' }, { status: 400 });
    }

    const response = await fetch(
      `${BACKEND_URL}/mock-interview/reports/${encodeURIComponent(email)}/highest-score`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({} as any));
      return NextResponse.json(
        { error: (errorData as any).detail || 'Failed to fetch highest score report' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching highest score mock interview report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


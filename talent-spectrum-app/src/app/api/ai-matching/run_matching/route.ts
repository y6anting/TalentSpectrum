import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateEmail = searchParams.get('candidate_email');
    
    // Build URL with optional candidate_email query parameter
    let url = `${BACKEND_URL}/ai-matching/run_matching`;
    if (candidateEmail) {
      url += `?candidate_email=${encodeURIComponent(candidateEmail)}`;
    }
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ detail: 'Unknown error' }));
      return NextResponse.json(
        { error: errorData.detail || 'Failed to run AI matching' },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error running AI matching:', error);
    return NextResponse.json(
      { error: 'Failed to run AI matching' },
      { status: 500 }
    );
  }
}
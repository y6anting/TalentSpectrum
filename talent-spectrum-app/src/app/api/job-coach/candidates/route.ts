import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://127.0.0.1:8000';

// Get assigned candidates for a job coach
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coachEmail = searchParams.get('coachEmail');
    
    if (!coachEmail) {
      return NextResponse.json(
        { error: 'Coach email is required' },
        { status: 400 }
      );
    }

    console.log('Fetching assigned candidates for coach:', coachEmail);
    
    const response = await fetch(`${BACKEND_URL}/job-coach/profile/${encodeURIComponent(coachEmail)}/candidates`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend response not ok:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch assigned candidates' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Assigned candidates fetched successfully');
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching assigned candidates:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


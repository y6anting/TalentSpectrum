import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || process.env.BACKEND_URL || 'http://127.0.0.1:8000';

// Get job coach profile
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

    console.log('Fetching job coach profile for:', coachEmail);
    
    const response = await fetch(`${BACKEND_URL}/job-coach/profile/${encodeURIComponent(coachEmail)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // Profile doesn't exist yet, return null
        return NextResponse.json(null);
      }
      const errorData = await response.json();
      console.error('Backend response not ok:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch job coach profile' },
        { status: response.status }
      );
    }

    const profile = await response.json();
    console.log('Job coach profile fetched successfully');
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching job coach profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create or update job coach profile
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const coachEmail = searchParams.get('coachEmail');
    
    if (!coachEmail) {
      return NextResponse.json(
        { error: 'Coach email is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log('Creating/updating job coach profile for:', coachEmail);
    
    const response = await fetch(`${BACKEND_URL}/job-coach/profile/${encodeURIComponent(coachEmail)}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend response not ok:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Failed to create/update job coach profile' },
        { status: response.status }
      );
    }

    const profile = await response.json();
    console.log('Job coach profile created/updated successfully');
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error creating/updating job coach profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


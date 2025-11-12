import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://127.0.0.1:8000';

// Get profile by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    console.log('Fetching profile for:', email);
    
    const response = await fetch(`${BACKEND_URL}/profiles/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend response not ok:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Failed to fetch profile' },
        { status: response.status }
      );
    }

    const profile = await response.json();
    console.log('Profile fetched successfully');
    
    return NextResponse.json(profile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create or update profile
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating/Updating profile:', body.email);
    
    const response = await fetch(`${BACKEND_URL}/profiles/`, {
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
        { error: errorData.detail || 'Failed to create/update profile' },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Profile created/updated successfully');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update profile (PATCH)
export async function PATCH(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const updateType = searchParams.get('type'); // neurodivergent_strengths, environment, etc.
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log(`Updating profile ${updateType} for:`, email);
    
    let endpoint = `${BACKEND_URL}/profiles/${encodeURIComponent(email)}`;
    if (updateType) {
      endpoint = `${BACKEND_URL}/profiles/${encodeURIComponent(email)}/${updateType}`;
    }
    
    const response = await fetch(endpoint, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Backend response not ok:', response.status, errorData);
      return NextResponse.json(
        { error: errorData.detail || 'Failed to update profile' },
        { status: response.status }
      );
    }

    const result = await response.json();
    console.log('Profile updated successfully');
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


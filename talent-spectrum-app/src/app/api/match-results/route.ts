import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    // Get candidate_email from query params
    const searchParams = request.nextUrl.searchParams;
    const candidateEmail = searchParams.get('candidate_email');
    
    if (!candidateEmail) {
      return NextResponse.json(
        { error: 'candidate_email parameter is required' },
        { status: 400 }
      );
    }

    // Fetch match results from backend
    const response = await fetch(
      `${BACKEND_URL}/match_results/candidate/${encodeURIComponent(candidateEmail)}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      // If endpoint doesn't exist yet, return empty array
      if (response.status === 404) {
        console.warn('Match results endpoint not found, returning empty array');
        return NextResponse.json([]);
      }
      
      const errorText = await response.text();
      console.error('Backend error:', errorText);
      return NextResponse.json(
        { error: `Backend error: ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error fetching match results:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch match results' },
      { status: 500 }
    );
  }
}

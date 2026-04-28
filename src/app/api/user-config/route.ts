import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongoose';
import UserConfig from '@/models/UserConfig';

/**
 * GET /api/user-config
 * Retrieves the current user configuration (singleton).
 */
export async function GET() {
  try {
    await connectToDatabase();
    
    // Retrieves the current user configuration (first record)
    const config = await UserConfig.findOne().lean();
    
    if (!config) {
      // Return default config if none exists in database
      return NextResponse.json({ 
        white: { provider: 'Human', model: '' },
        black: { provider: 'OpenAI', model: 'gpt-4o' }
      });
    }
    
    return NextResponse.json(config);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Error fetching user config:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * POST /api/user-config
 * Updates or creates the user configuration (singleton).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    await connectToDatabase();
    
    // Updates or creates the user configuration (singleton pattern)
    const config = await UserConfig.findOneAndUpdate(
      {}, 
      { 
        white: body.white,
        black: body.black
      },
      { upsert: true, new: true, runValidators: true }
    );
    
    return NextResponse.json(config);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error("Error updating user config:", error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

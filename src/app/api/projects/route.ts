import { NextRequest, NextResponse } from 'next/server';

// Projects API - Works without database on serverless

// Sample projects for demo
const SAMPLE_PROJECTS = [
  {
    id: 'demo-1',
    name: 'My First Animation',
    description: 'A simple animation demo',
    data: '{}',
    thumbnail: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

// Get all projects
export async function GET() {
  // Return empty projects on serverless (user can import/export manually)
  return NextResponse.json({ projects: [] });
}

// Save a project
export async function POST(request: NextRequest) {
  try {
    const { name, description, data, thumbnail } = await request.json();
    
    // Return the project data back for client-side storage
    return NextResponse.json({ 
      success: true, 
      project: {
        id: `project-${Date.now()}`,
        name: name || 'Untitled Project',
        description: description || '',
        data: data,
        thumbnail: thumbnail,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      message: 'Project saved to browser storage'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a project
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    
    return NextResponse.json({ 
      success: true,
      message: 'Project deleted from browser storage'
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

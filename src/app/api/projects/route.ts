import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// Get all projects
export async function GET() {
  try {
    const projects = await db.animationProject.findMany({
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ projects });
  } catch (error: any) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create or update a project
export async function POST(request: NextRequest) {
  try {
    const { id, name, description, data, thumbnail } = await request.json();

    if (!name || !data) {
      return NextResponse.json({ error: 'Name and data are required' }, { status: 400 });
    }

    let project;

    if (id) {
      // Update existing project
      project = await db.animationProject.update({
        where: { id },
        data: {
          name,
          description,
          data: JSON.stringify(data),
          thumbnail,
        },
      });
    } else {
      // Create new project
      project = await db.animationProject.create({
        data: {
          name,
          description,
          data: JSON.stringify(data),
          thumbnail,
        },
      });
    }

    return NextResponse.json({ success: true, project });
  } catch (error: any) {
    console.error('Save project error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete a project
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await db.animationProject.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { connectDB } from '@/lib/mongodb';
import Dream from '@/models/Dream';
import { Types } from 'mongoose';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const dream = await Dream.findOne({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId((session.user as any).id),
    });

    if (!dream) {
      return NextResponse.json(
        { error: 'Dream not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(dream);
  } catch (error: any) {
    console.error('Get dream error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { title, content, mood, tags } = await request.json();

    await connectDB();

    const dream = await Dream.findOneAndUpdate(
      {
        _id: new Types.ObjectId(id),
        userId: new Types.ObjectId((session.user as any).id),
      },
      {
        title,
        content,
        mood,
        tags,
      },
      { new: true }
    );

    if (!dream) {
      return NextResponse.json(
        { error: 'Dream not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(dream);
  } catch (error: any) {
    console.error('Update dream error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const dream = await Dream.findOneAndDelete({
      _id: new Types.ObjectId(id),
      userId: new Types.ObjectId((session.user as any).id),
    });

    if (!dream) {
      return NextResponse.json(
        { error: 'Dream not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Dream deleted successfully' });
  } catch (error: any) {
    console.error('Delete dream error:', error);
    return NextResponse.json(
      { error: error.message || 'An error occurred' },
      { status: 500 }
    );
  }
}

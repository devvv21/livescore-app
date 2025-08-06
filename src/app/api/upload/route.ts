import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
  const data = await req.formData();
  // Handles 'image' from EditorJS and 'file' from other components
  const file: File | null = (data.get('image') as File) || (data.get('file') as File);

  if (!file) {
    return NextResponse.json({ success: false, message: 'No file found.' }, { status: 400 });
  }

  try {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Create a unique, sanitized filename
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, '');
    const uniqueFilename = `${uuidv4()}-${sanitizedFilename}`;
    const path = join(uploadDir, uniqueFilename);

    await writeFile(path, buffer);

    const publicUrl = `/uploads/${uniqueFilename}`;

    // This logic checks the source of the upload and returns the correct response
    if (data.has('image')) {
      // Correct response format for the EditorJS Image Tool
      return NextResponse.json({
        success: 1,
        file: {
          url: publicUrl,
        },
      });
    }

    // Default response for other uploaders (e.g., Featured Image)
    return NextResponse.json({ success: true, url: publicUrl });

  } catch (error) {
    console.error('Error saving file:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    // Send a response that EditorJS can understand as an error
    return NextResponse.json({ success: 0, message: `Server Error: ${errorMessage}` }, { status: 500 });
  }
}
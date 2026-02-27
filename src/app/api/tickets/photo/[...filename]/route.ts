import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const filename = resolvedParams.filename.join('/');
    const filepath = path.join(process.cwd(), 'public', filename);

    const imageBuffer = await readFile(filepath);

    // Déterminer le type MIME basé sur l'extension
    const ext = filename.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg';

    switch (ext) {
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
    }

    return new NextResponse(new Uint8Array(imageBuffer), {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000', // Cache pour 1 an
      },
    });
  } catch (error) {
    console.error('Erreur lors de la lecture de l\'image:', error);
    return NextResponse.json(
      { error: 'Image non trouvée' },
      { status: 404 }
    );
  }
}
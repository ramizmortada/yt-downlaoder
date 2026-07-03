import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const filepath = searchParams.get('file');

  if (!filepath || !fs.existsSync(filepath)) {
    return NextResponse.json({ error: 'File not found' }, { status: 404 });
  }

  const stat = fs.statSync(filepath);
  const filename = path.basename(filepath);

  const fileStream = fs.createReadStream(filepath);

  // Use a ReadableStream for the response
  const stream = new ReadableStream({
    start(controller) {
      fileStream.on('data', (chunk) => controller.enqueue(chunk));
      fileStream.on('end', () => controller.close());
      fileStream.on('error', (err) => controller.error(err));
    },
    cancel() {
      fileStream.destroy();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Disposition': `attachment; filename="${encodeURIComponent(filename)}"`,
      'Content-Type': 'application/octet-stream',
      'Content-Length': stat.size.toString(),
    },
  });
}

import { NextResponse } from 'next/server';
import { YtDlp } from 'ytdlp-nodejs';
import path from 'path';
import os from 'os';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const { url, isAudio, quality, type } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const ytdlp = new YtDlp({
        ffmpegPath: path.resolve(process.cwd(), 'ffmpeg.exe'),
      });

      try {
        // Use a safe temporary directory
        const tempDir = os.tmpdir();
        
        let dl = ytdlp.download(url).output(path.join(tempDir, '%(title)s.%(ext)s'));
        
        if (isAudio) {
          dl = dl.extractAudio().audioFormat('mp3').audioQuality('0');
        } else {
          dl = dl.format({ filter: 'mergevideo', quality: `${quality}p`, type: type || 'mp4' });
        }

        dl.on('progress', (p) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', data: p })}\n\n`));
        });

        const result = await dl.run();
        
        // Pass the downloaded file path to the frontend
        if (result.filePaths && result.filePaths.length > 0) {
          const finalFilePath = result.filePaths[0];
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'finish', file: finalFilePath })}\n\n`));
        } else {
          throw new Error('Download failed, no file paths returned.');
        }
        
        controller.close();
      } catch (error: any) {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', data: error.message })}\n\n`));
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}

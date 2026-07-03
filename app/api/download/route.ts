import { YtDlp } from 'ytdlp-nodejs';
import path from 'path';

export async function POST(req: Request) {
  const { url, outputDir, isAudio, quality, type } = await req.json();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const ytdlp = new YtDlp({
        ffmpegPath: path.resolve(process.cwd(), 'ffmpeg.exe'),
      });

      try {
        let dl = ytdlp.download(url).output(path.join(outputDir, '%(title)s.%(ext)s'));
        
        if (isAudio) {
          dl = dl.extractAudio().audioFormat('mp3').audioQuality('0');
        } else {
          // If no quality specified, use '1080p', type 'mp4'
          dl = dl.format({ filter: 'mergevideo', quality: quality || '1080p', type: type || 'mp4' });
        }

        dl.on('progress', (p) => {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'progress', data: p })}\n\n`));
        });

        const result = await dl.run();
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'finish', data: result })}\n\n`));
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
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

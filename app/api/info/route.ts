import { NextResponse } from 'next/server';
import { YtDlp } from 'ytdlp-nodejs';
import path from 'path';

export async function POST(req: Request) {
  try {
    const { url } = await req.json();
    const ytdlp = new YtDlp({
      ffmpegPath: path.resolve(process.cwd(), 'ffmpeg.exe'),
    });
    const info = await ytdlp.getInfoAsync(url);
    return NextResponse.json(info);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

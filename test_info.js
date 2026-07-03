const { YtDlp } = require('ytdlp-nodejs');
const path = require('path');

async function testInfo() {
  const ytdlp = new YtDlp({ ffmpegPath: path.resolve(process.cwd(), 'ffmpeg.exe') });
  console.log("Fetching info...");
  
  try {
    const info = await ytdlp.getInfoAsync('https://www.youtube.com/watch?v=jNQXAC9IVRw');
    
    // Group by height/quality to find sizes
    const sizes = {};
    for (const f of info.formats) {
      if (f.vcodec !== 'none' && f.height) {
        if (!sizes[f.height]) sizes[f.height] = [];
        sizes[f.height].push({
          ext: f.ext,
          vcodec: f.vcodec,
          size: f.filesize || f.filesize_approx
        });
      }
    }
    
    console.log(JSON.stringify(sizes, null, 2));
    
  } catch(e) {
    console.error("Error:", e);
  }
}
testInfo();

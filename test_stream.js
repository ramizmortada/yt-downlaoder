const { YtDlp } = require('ytdlp-nodejs');
const path = require('path');
const fs = require('fs');

async function testStream() {
  const ytdlp = new YtDlp({ ffmpegPath: path.resolve(process.cwd(), 'ffmpeg.exe') });
  console.log("Starting stream...");
  
  try {
    const streamObj = ytdlp.stream('https://www.youtube.com/watch?v=jNQXAC9IVRw')
      .format({ filter: 'mergevideo', quality: '1080p', type: 'mp4' });
    
    streamObj.on('progress', p => console.log(p.percentage_str));
    
    await streamObj.pipeAsync(fs.createWriteStream('test_stream.mp4'));
    console.log("Done streaming!");
  } catch(e) {
    console.error("Error:", e);
  }
}
testStream();

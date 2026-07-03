const { YtDlp } = require('ytdlp-nodejs');
const path = require('path');
const os = require('os');

const ytdlp = new YtDlp({ ffmpegPath: path.resolve(process.cwd(), 'ffmpeg.exe') });
const tempDir = os.tmpdir();

let dl = ytdlp.download('https://www.youtube.com/watch?v=jNQXAC9IVRw')
  .output(path.join(tempDir, '%(title)s_test.%(ext)s'))
  .format({ filter: 'mergevideo', quality: '360p', type: 'mp4' });

dl.on('progress', (p) => {
  console.log(JSON.stringify(p));
});

dl.run().then(() => console.log('Done')).catch(console.error);

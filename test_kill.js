const { YtDlp } = require('ytdlp-nodejs');
const path = require('path');
const os = require('os');

const ytdlp = new YtDlp({ ffmpegPath: path.resolve(process.cwd(), 'ffmpeg.exe') });
const dl = ytdlp.download('https://www.youtube.com/watch?v=jNQXAC9IVRw').output(path.join(os.tmpdir(), 'test.mp4'));

console.log(Object.keys(dl));

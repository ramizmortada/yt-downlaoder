const { YtDlp } = require('ytdlp-nodejs');
const path = require('path');

const ytdlp = new YtDlp({ ffmpegPath: path.resolve(process.cwd(), 'ffmpeg.exe') });
const dl = ytdlp.stream('https://www.youtube.com/watch?v=jNQXAC9IVRw').format({ filter: 'mergevideo', quality: '1080p', type: 'mp4' });

console.log("Has on('data'):", typeof dl.on === 'function');
console.log("Is stream:", typeof dl.pipe === 'function');

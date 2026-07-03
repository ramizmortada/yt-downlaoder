# Modern YouTube Downloader

A sleek, premium, and lightning-fast YouTube video and audio downloader built with Next.js, React, Tailwind CSS, and `yt-dlp`. 

This application features a strictly monochromatic, cinematic user interface and utilizes server-sent events (SSE) to stream live progress directly to the browser. Designed with zero server footprint in mind, downloads are streamed to the browser and immediately purged from the server to prevent cache buildup.

## Features

- **Cinematic UI:** Built with Shadcn UI, Framer Motion, and Tailwind CSS.
- **Real-Time Progress:** View exact download percentages via Server-Sent Events (SSE).
- **Direct Streaming (Zero Cache):** Videos are built on the server and streamed straight to your browser. Temporary files are automatically deleted upon completion to ensure zero disk leak.
- **Multiple Qualities:** Choose from 4K down to 360p, or download Audio Only.
- **Smart Local Storage:** Remembers your last downloaded video so you don't lose it on page refresh.

## Prerequisites

Before running the application, ensure you have the following installed on your Windows machine:

1. **Node.js** (v18 or higher)
2. **FFmpeg**: The application requires `ffmpeg.exe` to merge video and audio streams seamlessly. 
   - *Note: Ensure `ffmpeg.exe` is placed directly in the root directory of this project.*

## Installation

1. Clone or download this repository.
2. Open a terminal in the root directory of the project.
3. Install the dependencies:
   ```bash
   npm install
   ```
   *(Or use `yarn install` / `pnpm install`)*

## Running the App

### Option 1: Quick Start (Windows)
Simply double-click the `run.bat` file located in the root directory. This script will automatically start the development server and open the application in your default web browser.

### Option 2: Command Line
Start the development server using npm:
```bash
npm run dev
```
Once the server starts, open your browser and navigate to `http://localhost:3000`.

## Technologies Used

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Frontend:** React, Tailwind CSS, Framer Motion, Lucide Icons
- **UI Components:** [Shadcn UI](https://ui.shadcn.com/)
- **Backend/Downloader:** [ytdlp-nodejs](https://github.com/ytdlp-nodejs/ytdlp-nodejs) (wrapper for yt-dlp)

## Troubleshooting

- **Downloads are failing:** Ensure `ffmpeg.exe` is present in the root folder of the project. `yt-dlp` requires it to merge high-quality video and audio streams.
- **Progress bar is stuck at 0%:** If you are running behind a strict reverse proxy (like Nginx), ensure that the proxy does not buffer Server-Sent Events. The app itself explicitly sends `X-Accel-Buffering: no` headers to bypass this.

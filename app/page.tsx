import Downloader from '@/components/Downloader';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-24 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="z-10 w-full max-w-2xl text-center mb-12">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-white/60">
          Save The Web
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          Download videos and audio directly to your local machine. Powered by yt-dlp.
        </p>
      </div>

      <div className="z-10 w-full">
        <Downloader />
      </div>
    </main>
  );
}

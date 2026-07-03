import Downloader from '@/components/Downloader';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6 md:p-24 relative overflow-hidden">
      {/* Background ambient light */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="z-10 w-full">
        <Downloader />
      </div>
    </main>
  );
}

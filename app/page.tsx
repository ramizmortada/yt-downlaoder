import Downloader from '@/components/Downloader';

export default function Home() {
  return (
    <main className="h-screen w-full flex flex-col items-center justify-center p-4 overflow-hidden relative">
      <div className="z-10 w-full max-h-full">
        <Downloader />
      </div>
    </main>
  );
}

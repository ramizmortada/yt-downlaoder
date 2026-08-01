import Downloader from '@/components/Downloader';

export default function Home() {
  return (
    <main className="h-screen h-dvh w-full flex flex-col items-center justify-center p-3 sm:p-4 overflow-hidden relative">
      <div className="z-10 w-full max-h-full flex flex-col items-center justify-center">
        <Downloader />
      </div>
    </main>
  );
}

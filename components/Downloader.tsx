'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Search, Music, Video, Loader2, Download, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Downloader() {
  const [url, setUrl] = useState('');
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAudio, setIsAudio] = useState(false);
  const [quality, setQuality] = useState('1080');
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const storedUrl = localStorage.getItem('ytUrl');
      const storedInfo = localStorage.getItem('ytInfo');
      if (storedUrl) setUrl(storedUrl);
      if (storedInfo) setInfo(JSON.parse(storedInfo));
    } catch (e) {
      console.error('Failed to parse local storage data');
    }
  }, []);

  const fetchInfo = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      
      setInfo(data);
      // Save successfully fetched data to local storage
      localStorage.setItem('ytUrl', url);
      localStorage.setItem('ytInfo', JSON.stringify(data));
    } catch (err) {
      alert('Failed to fetch info. Check URL or verify yt-dlp works.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
    }
    setDownloading(false);
    setProgress(0);
    setStatusText('Cancelled');
  };

  const startDownload = async () => {
    if (downloading) {
      handleCancel();
      return;
    }

    const controller = new AbortController();
    setAbortController(controller);

    setDownloading(true);
    setProgress(0);
    setStatusText('Starting download to server...');

    try {
      const res = await fetch('/api/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url,
          isAudio,
          quality,
          type: 'mp4'
        }),
        signal: controller.signal
      });

      if (!res.body) throw new Error('ReadableStream not yet supported in this browser.');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.replace('data: ', '');
            try {
              const event = JSON.parse(dataStr);
              if (event.type === 'progress') {
                setProgress(event.data.percentage ?? 0);
                
                // YouTube downloads Video and Audio as separate tracks, so we show the extension to clarify why it restarts
                let trackType = 'stream';
                if (event.data.filename) {
                  const ext = event.data.filename.split('.').pop();
                  if (ext) trackType = ext.toUpperCase() + ' track';
                }
                
                setStatusText(`Downloading ${trackType}...`);
              } else if (event.type === 'finish') {
                setDownloading(false);
                setProgress(100);
                setStatusText('Download Complete! Prompting save dialog...');
                
                window.location.href = `/api/serve?file=${encodeURIComponent(event.file)}`;
              } else if (event.type === 'error') {
                throw new Error(event.data);
              }
            } catch (e) {
              console.error('Failed to parse SSE', e);
            }
          }
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Download aborted by user');
      } else {
        alert('Download failed: ' + err.message);
        setDownloading(false);
      }
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-4 pt-8 sm:pt-16 h-full max-h-full">
      {/* Search Section */}
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="relative flex items-center shrink-0">
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-zinc-500" />
        </div>
        <Input 
          placeholder="Paste YouTube URL here..." 
          value={url} 
          onChange={e => setUrl(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && fetchInfo()}
          className="h-12 text-sm pl-10 pr-16 rounded-full bg-zinc-900 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none focus:border-zinc-500 transition-all shadow-sm"
        />
        <Button 
          onClick={fetchInfo} 
          disabled={loading || !url} 
          size="icon"
          className="absolute right-1.5 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white text-black hover:bg-zinc-200 transition-none flex items-center justify-center shadow-md disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
        </Button>
      </motion.div>

      {/* Video Card Section */}
      <AnimatePresence>
        {info && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 250, damping: 25 }}
            className="flex-1 overflow-hidden flex flex-col min-h-0"
          >
            <Card className="p-0 gap-0 rounded-3xl overflow-y-auto overflow-x-hidden bg-zinc-950 border border-zinc-800 shadow-xl flex flex-col max-h-full scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              
              {/* Header: Thumbnail */}
              <div className="w-full h-36 sm:h-48 shrink-0 relative bg-zinc-900 border-b border-zinc-800">
                <img src={info.thumbnail} alt={info.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />
                <div className="absolute bottom-3 left-5 right-5">
                  <h2 className="text-lg sm:text-xl font-semibold line-clamp-2 leading-tight text-zinc-100">{info.title}</h2>
                  <p className="text-zinc-400 text-xs sm:text-sm font-medium mt-1">{info.channel || info.uploader}</p>
                </div>
              </div>
              
              {/* Body: Controls */}
              <div className="p-4 sm:p-5 flex flex-col gap-5">
                
                {/* Format Toggle */}
                <div className="flex bg-zinc-900 border border-zinc-800 rounded-xl p-1 w-full shrink-0">
                  <button 
                    onClick={() => setIsAudio(false)}
                    className={`flex-1 px-4 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${!isAudio ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    <Video className="w-4 h-4" /> Video
                  </button>
                  <button 
                    onClick={() => setIsAudio(true)}
                    className={`flex-1 px-4 py-1.5 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-2 ${isAudio ? 'bg-white text-black shadow-sm' : 'text-zinc-400 hover:text-zinc-200'}`}
                  >
                    <Music className="w-4 h-4" /> Audio Only
                  </button>
                </div>

                {/* Quality Selection Grid */}
                <AnimatePresence>
                  {!isAudio && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }} 
                      animate={{ opacity: 1, height: 'auto' }} 
                      exit={{ opacity: 0, height: 0 }} 
                      className="w-full flex flex-col gap-2 shrink-0"
                    >
                      <p className="text-[10px] font-semibold text-zinc-500 uppercase tracking-widest ml-1">Quality</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { val: '2160', label: '4K', labelFull: '2160p' },
                          { val: '1440', label: '2K', labelFull: '1440p' },
                          { val: '1080', label: 'FHD', labelFull: '1080p' },
                          { val: '720', label: 'HD', labelFull: '720p' },
                          { val: '480', label: 'SD', labelFull: '480p' },
                          { val: '360', label: 'Low', labelFull: '360p' }
                        ].map(opt => {
                          const size = info.sizes?.[opt.val] ? `${(info.sizes[opt.val] / 1024 / 1024).toFixed(1)} MB` : '';
                          const isActive = quality === opt.val;
                          return (
                            <button
                              key={opt.val}
                              onClick={() => setQuality(opt.val)}
                              className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all ${
                                isActive 
                                  ? 'bg-zinc-800 border-zinc-500 text-zinc-100' 
                                  : 'bg-zinc-900/50 border-zinc-800/50 text-zinc-500 hover:bg-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                              }`}
                            >
                              <span className="font-medium text-xs">{opt.labelFull}</span>
                              {size && <span className="text-[9px] opacity-75 mt-0.5">{size}</span>}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Download Button */}
                <div className="flex flex-col gap-3 shrink-0">
                  <Button 
                    onClick={startDownload} 
                    disabled={downloading || loading}
                    className={`w-full rounded-xl h-11 text-sm font-medium transition-colors relative overflow-hidden disabled:opacity-50 ${
                      downloading 
                        ? 'bg-zinc-800 text-zinc-100 hover:bg-zinc-700 border border-zinc-700' 
                        : 'bg-white text-black hover:bg-zinc-200'
                    }`}
                  >
                    <span className="relative z-10 flex items-center">
                      {downloading ? 'Cancel' : 'Download'} 
                      {downloading 
                        ? <div className="w-3 h-3 ml-2 bg-current rounded-sm" /> 
                        : <Download className="w-4 h-4 ml-2" />
                      }
                    </span>
                  </Button>

                  {/* Progress Indicators */}
                  <AnimatePresence>
                    {downloading && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-1.5">
                        <div className="flex justify-between text-[11px] text-zinc-400 font-medium px-1">
                          <span>{statusText}</span>
                          <span className="text-zinc-100">{progress.toFixed(1)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 rounded-full bg-zinc-900 border border-zinc-800" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Search, Music, Video, Loader2, Download, CheckCircle2 } from 'lucide-react';

export default function Downloader() {
  const [url, setUrl] = useState('');
  const [info, setInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [isAudio, setIsAudio] = useState(false);
  const [quality, setQuality] = useState('1080');
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('');
  const [finished, setFinished] = useState(false);

  const fetchInfo = async () => {
    if (!url) return;
    setLoading(true);
    setFinished(false);
    try {
      const res = await fetch('/api/info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setInfo(data);
    } catch (err) {
      alert('Failed to fetch info. Check URL or verify yt-dlp works.');
    } finally {
      setLoading(false);
    }
  };

  const startDownload = async () => {
    setDownloading(true);
    setProgress(0);
    setStatusText('Starting download to server...');
    setFinished(false);

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
                setStatusText(event.data.percentage_str ?? 'Downloading...');
              } else if (event.type === 'finish') {
                setFinished(true);
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
      alert('Download failed: ' + err.message);
      setDownloading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex gap-2">
        <Input 
          placeholder="Paste YouTube URL here..." 
          value={url} 
          onChange={e => setUrl(e.target.value)}
          className="glass border-primary/30 h-14 text-lg px-6 rounded-2xl focus-visible:ring-primary shadow-[0_0_15px_rgba(255,0,100,0.1)]"
        />
        <Button 
          onClick={fetchInfo} 
          disabled={loading || !url} 
          className="h-14 px-8 rounded-2xl shadow-[0_0_15px_rgba(255,0,100,0.3)] bg-gradient-to-r from-primary to-rose-600 hover:opacity-90 transition-all"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Search className="w-5 h-5" />}
        </Button>
      </motion.div>

      <AnimatePresence>
        {info && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className="glass p-6 rounded-3xl overflow-hidden relative border-white/10">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3 aspect-video md:aspect-square relative rounded-xl overflow-hidden bg-black/50 border border-white/5 shadow-inner">
                  <img src={info.thumbnail} alt={info.title} className="w-full h-full object-cover" />
                </div>
                
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h2 className="text-xl font-bold line-clamp-2 leading-tight mb-2 text-white">{info.title}</h2>
                    <p className="text-muted-foreground text-sm font-medium">{info.channel || info.uploader}</p>
                  </div>

                  <div className="flex flex-col gap-4 mt-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <Button variant={!isAudio ? 'default' : 'secondary'} className="rounded-xl flex-1 font-semibold" onClick={() => setIsAudio(false)}>
                        <Video className="w-4 h-4 mr-2" /> Video
                      </Button>
                      <Button variant={isAudio ? 'default' : 'secondary'} className="rounded-xl flex-1 font-semibold" onClick={() => setIsAudio(true)}>
                        <Music className="w-4 h-4 mr-2" /> Audio
                      </Button>
                      
                      <AnimatePresence>
                        {!isAudio && (
                          <motion.div initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} exit={{ opacity: 0, width: 0 }} className="min-w-[120px]">
                            <Select value={quality} onValueChange={setQuality}>
                              <SelectTrigger className="h-10 rounded-xl bg-black/30 border-white/10 font-medium">
                                <SelectValue placeholder="Quality" />
                              </SelectTrigger>
                              <SelectContent className="bg-black/90 border-white/10 backdrop-blur-xl">
                                <SelectItem value="2160">2160p (4K) {info.sizes?.['2160'] ? `~${(info.sizes['2160'] / 1024 / 1024).toFixed(1)}MB` : ''}</SelectItem>
                                <SelectItem value="1440">1440p (2K) {info.sizes?.['1440'] ? `~${(info.sizes['1440'] / 1024 / 1024).toFixed(1)}MB` : ''}</SelectItem>
                                <SelectItem value="1080">1080p (FHD) {info.sizes?.['1080'] ? `~${(info.sizes['1080'] / 1024 / 1024).toFixed(1)}MB` : ''}</SelectItem>
                                <SelectItem value="720">720p (HD) {info.sizes?.['720'] ? `~${(info.sizes['720'] / 1024 / 1024).toFixed(1)}MB` : ''}</SelectItem>
                                <SelectItem value="480">480p {info.sizes?.['480'] ? `~${(info.sizes['480'] / 1024 / 1024).toFixed(1)}MB` : ''}</SelectItem>
                                <SelectItem value="360">360p {info.sizes?.['360'] ? `~${(info.sizes['360'] / 1024 / 1024).toFixed(1)}MB` : ''}</SelectItem>
                              </SelectContent>
                            </Select>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <Button 
                      onClick={startDownload} 
                      disabled={downloading}
                      className="w-full rounded-xl h-12 text-lg font-bold bg-white text-black hover:bg-neutral-200 transition-colors shadow-lg shadow-white/10"
                    >
                      {downloading ? 'Processing...' : 'Download'} <Download className="w-5 h-5 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>

              {downloading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 space-y-2">
                  <div className="flex justify-between text-sm text-primary font-medium tracking-wide">
                    <span>{statusText}</span>
                    <span>{progress.toFixed(1)}%</span>
                  </div>
                  <Progress value={progress} className="h-2 rounded-full bg-black/50 border border-white/5" />
                </motion.div>
              )}

              {finished && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 flex items-center justify-center gap-2 text-emerald-400 font-medium bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                  <CheckCircle2 className="w-5 h-5" /> Ready! Serving file to browser...
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

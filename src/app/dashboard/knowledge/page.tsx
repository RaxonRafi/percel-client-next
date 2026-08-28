'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { Database, UploadCloud, Trash2, ShieldAlert, Activity, FileText, Search, Settings } from 'lucide-react';

const MAX_PDF_BYTES = 10 * 1024 * 1024;

export default function KnowledgePage() {
  const { user } = useAuth();
  const fileInput = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState('');
  const [deleteSource, setDeleteSource] = useState('');
  const [parcelId, setParcelId] = useState('');
  const [removeId, setRemoveId] = useState('');
  const [health, setHealth] = useState('');
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth('unreachable'));
  }, []);

  async function run(action: () => Promise<{ message?: string } | void>, fallback: string) {
    setError('');
    setMsg('');
    setBusy(true);
    try {
      const res = await action();
      setMsg(res?.message ?? fallback);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }

  async function uploadPdf(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInput.current?.files?.[0];
    if (!file) {
      setError('Choose a PDF first');
      return;
    }
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted');
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      setError('That PDF is over the 10 MB limit');
      return;
    }
    await run(async () => {
      const res = await api.uploadRagPdf(file, category || undefined);
      return { message: `${res.message} — ${res.filename}, ${res.chunksIndexed} chunks indexed` };
    }, 'PDF indexed');
    if (fileInput.current) fileInput.current.value = '';
    setCategory('');
  }

  if (user && user.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <div className="bg-slate-900/50 p-8 rounded-lg border border-slate-800">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-300 font-mono tracking-wider uppercase mb-2">Restricted Area</h2>
          <p className="text-slate-500 font-mono text-sm max-w-md">Only system administrators can manage the AI knowledge base and core indices.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative max-w-5xl">
      {(error || msg) && (
        <div className={`p-3 rounded-lg border text-sm font-mono ${error ? 'bg-rose-500/10 border-rose-500/20 text-rose-500' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'}`}>
          {error || msg}
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <Database className="h-5 w-5 text-cyan-500" />
            Knowledge Base
          </h1>
          <p className="text-slate-500 text-[13px] mt-1 font-mono tracking-wide">AI EMBEDDINGS & SEARCH INDICES</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded px-3 py-1.5">
          <Activity className={`h-4 w-4 ${health === 'unreachable' ? 'text-rose-500' : 'text-emerald-500'}`} />
          <span className="text-[10px] font-mono tracking-wider text-slate-400 uppercase">API Status:</span>
          <span className={`text-[10px] font-bold font-mono tracking-wider uppercase ${health === 'unreachable' ? 'text-rose-500' : 'text-emerald-500'}`}>
            {health || 'CHECKING...'}
          </span>
        </div>
      </div>

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 flex gap-3 items-start">
        <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-500/80 leading-relaxed">
          <strong className="text-amber-500">ADMINISTRATIVE NOTICE:</strong> These tools modify global search indices. Indexing and deletions change what the assistant can cite for every user across the platform. AI routes are rate-limited to 20 requests per minute.
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-slate-800/60 bg-slate-900/50 flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-cyan-500" />
              <h3 className="text-[13px] font-bold text-slate-300 uppercase tracking-wider">Ingest Document</h3>
            </div>
            
            <form onSubmit={uploadPdf} className="p-5 flex flex-col gap-5 flex-1">
              <div className="space-y-1.5">
                <label htmlFor="pdf" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Target File (PDF ONLY, MAX 10MB)</label>
                <div className="relative">
                  <input
                    id="pdf"
                    ref={fileInput}
                    type="file"
                    accept="application/pdf"
                    className="block w-full text-sm text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-slate-800 file:text-cyan-400 hover:file:bg-slate-700 cursor-pointer border border-slate-700 rounded bg-slate-950 focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="category" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Metadata Tag (Optional)</label>
                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. shipping, legal, hr"
                  className="w-full h-10 px-3 rounded border border-slate-700 bg-slate-950 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                />
              </div>
              
              <div className="mt-auto pt-4">
                <Button type="submit" disabled={busy} className="w-full">
                  <UploadCloud className="h-4 w-4 mr-2" /> Upload & Index
                </Button>
              </div>
            </form>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-slate-800/60 bg-slate-900/50 flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-rose-500" />
              <h3 className="text-[13px] font-bold text-slate-300 uppercase tracking-wider">Remove Document</h3>
            </div>
            
            <div className="p-5">
              <div className="space-y-1.5 mb-4">
                <label htmlFor="source" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Source Identifier</label>
                <div className="flex gap-2">
                  <input
                    id="source"
                    type="text"
                    value={deleteSource}
                    onChange={(e) => setDeleteSource(e.target.value)}
                    placeholder="e.g. shipping-policy.pdf"
                    className="flex-1 h-10 px-3 rounded border border-slate-700 bg-slate-950 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                  />
                  <Button
                    variant="ghost"
                    className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 hover:text-rose-400 border border-rose-500/20"
                    disabled={busy || !deleteSource.trim()}
                    onClick={() => run(() => api.deleteRagPdf(deleteSource.trim()), 'PDF removed')}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                The source name is the <span className="text-slate-400 font-bold">source</span> value the chat assistant cites under an answer.
              </p>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
            <div className="p-5 border-b border-slate-800/60 bg-slate-900/50 flex items-center gap-2">
              <Search className="h-4 w-4 text-emerald-500" />
              <h3 className="text-[13px] font-bold text-slate-300 uppercase tracking-wider">Parcel Indexing</h3>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="parcelId" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Target Parcel ID</label>
                <div className="flex gap-2">
                  <input
                    id="parcelId"
                    type="text"
                    value={parcelId}
                    onChange={(e) => setParcelId(e.target.value)}
                    placeholder="UUID"
                    className="flex-1 h-10 px-3 rounded border border-slate-700 bg-slate-950 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                  />
                  <Button
                    variant="secondary"
                    disabled={busy || !parcelId.trim()}
                    onClick={() => run(() => api.indexParcel(parcelId.trim()), 'Parcel indexed')}
                  >
                    Index
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="removeId" className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Remove Parcel ID</label>
                <div className="flex gap-2">
                  <input
                    id="removeId"
                    type="text"
                    value={removeId}
                    onChange={(e) => setRemoveId(e.target.value)}
                    placeholder="UUID"
                    className="flex-1 h-10 px-3 rounded border border-slate-700 bg-slate-950 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all font-mono"
                  />
                  <Button
                    variant="ghost"
                    className="bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 hover:text-rose-400 border border-rose-500/20"
                    disabled={busy || !removeId.trim()}
                    onClick={() => run(() => api.removeIndexedParcel(removeId.trim()), 'Parcel removed from index')}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800/60">
                <Button
                  variant="ghost"
                  className="w-full bg-slate-800/50 text-slate-300 hover:bg-slate-800 border border-slate-700"
                  disabled={busy}
                  onClick={() => run(() => api.indexAllParcels(), 'Bulk index started')}
                >
                  <Settings className="h-4 w-4 mr-2 text-slate-400" /> Trigger Full Database Re-Index
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

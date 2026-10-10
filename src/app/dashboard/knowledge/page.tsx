'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api, ApiError } from '@/lib/api';
import { toast } from '@/lib/toast';
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
  const [assistantOn, setAssistantOn] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api
      .getHealth()
      .then((report) => {
        setHealth(report.status === 'ok' ? 'online' : 'database down');
        setAssistantOn(report.assistant);
      })
      .catch(() => setHealth('unreachable'));
  }, []);

  async function run(action: () => Promise<{ message?: string } | void>, fallback: string) {
    setBusy(true);
    try {
      const res = await action();
      toast.success(res?.message ?? fallback);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Request failed');
    } finally {
      setBusy(false);
    }
  }

  // The index routes take the whole parcel, owner ids included: without them a
  // parcel is only retrievable by admins.
  async function indexOne(trackingId: string) {
    const res = await api.getAllParcels({ search: trackingId, limit: 100 });
    const parcel = res.data.find((p) => p.trackingId.toLowerCase() === trackingId.toLowerCase());
    if (!parcel) throw new ApiError('No parcel with that tracking ID', 404);
    return api.indexParcel(parcel);
  }

  // One call: the server pages through its own table, so this no longer
  // downloads every parcel just to post it back.
  async function indexAll() {
    const res = await api.reindexAllParcels();
    return {
      message: res.indexed > 0 || res.removed > 0 ? res.message : 'No parcels to index',
    };
  }

  async function uploadPdf(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInput.current?.files?.[0];
    if (!file) {
      toast.error('Choose a PDF first');
      return;
    }
    if (file.type !== 'application/pdf') {
      toast.error('Only PDF files are accepted');
      return;
    }
    if (file.size > MAX_PDF_BYTES) {
      toast.error('That PDF is over the 10 MB limit');
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
        <div className="bg-surface p-8 rounded-xl border border-surface-3">
          <ShieldAlert className="h-12 w-12 text-rose-600 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-ink-2 tracking-wider uppercase mb-2">Restricted Area</h2>
          <p className="text-ink-3 text-sm max-w-md">Only system administrators can manage the AI knowledge base and core indices.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in relative max-w-5xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-ink flex items-center gap-2">
            <Database className="h-5 w-5 text-accent" />
            Knowledge Base
          </h1>
          <p className="text-ink-3 text-[13px] mt-1 tracking-wide">AI EMBEDDINGS & SEARCH INDICES</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white border border-surface-3 rounded-md px-3 py-1.5">
          <Activity className={`h-4 w-4 ${health && health !== 'online' ? 'text-rose-600' : 'text-emerald-600'}`} />
          <span className="text-[10px] tracking-wider text-ink-2 uppercase">API Status:</span>
          <span className={`text-[10px] font-bold tracking-wider uppercase ${health && health !== 'online' ? 'text-rose-600' : 'text-emerald-600'}`}>
            {health || 'CHECKING...'}
          </span>
          {assistantOn !== null && (
            <span className={`text-[10px] font-bold tracking-wider uppercase ${assistantOn ? 'text-emerald-600' : 'text-amber-600'}`}>
              · Assistant {assistantOn ? 'on' : 'off'}
            </span>
          )}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3 items-start">
        <ShieldAlert className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-sm text-amber-600 leading-relaxed">
          <strong className="text-amber-600">ADMINISTRATIVE NOTICE:</strong> These tools modify global search indices. Indexing and deletions change what the assistant can cite for every user across the platform. AI routes are rate-limited to 20 requests per minute.
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-6">
          <div className="bg-white border border-surface-3 rounded-xl shadow-sm overflow-hidden h-full flex flex-col">
            <div className="p-5 border-b border-surface-2 bg-surface flex items-center gap-2">
              <UploadCloud className="h-4 w-4 text-accent" />
              <h3 className="text-[13px] font-bold text-ink-2 uppercase tracking-wider">Ingest Document</h3>
            </div>
            
            <form onSubmit={uploadPdf} className="p-5 flex flex-col gap-5 flex-1">
              <div className="space-y-1.5">
                <label htmlFor="pdf" className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Target File (PDF ONLY, MAX 10MB)</label>
                <div className="relative">
                  <input
                    id="pdf"
                    ref={fileInput}
                    type="file"
                    accept="application/pdf"
                    className="block w-full text-sm text-ink-2 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:uppercase file:tracking-wider file:bg-surface-2 file:text-accent hover:file:bg-surface-3 cursor-pointer border border-surface-3 rounded-md bg-white focus:outline-none"
                  />
                </div>
              </div>
              
              <div className="space-y-1.5">
                <label htmlFor="category" className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Metadata Tag (Optional)</label>
                <input
                  id="category"
                  type="text"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  placeholder="e.g. shipping, legal, hr"
                  className="w-full h-10 px-3 rounded-md border border-surface-3 bg-white text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
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
          <div className="bg-white border border-surface-3 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-surface-2 bg-surface flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-rose-600" />
              <h3 className="text-[13px] font-bold text-ink-2 uppercase tracking-wider">Remove Document</h3>
            </div>
            
            <div className="p-5">
              <div className="space-y-1.5 mb-4">
                <label htmlFor="source" className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Source Identifier</label>
                <div className="flex gap-2">
                  <input
                    id="source"
                    type="text"
                    value={deleteSource}
                    onChange={(e) => setDeleteSource(e.target.value)}
                    placeholder="e.g. shipping-policy.pdf"
                    className="flex-1 h-10 px-3 rounded-md border border-surface-3 bg-white text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                  <Button
                    variant="ghost"
                    className="bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-600 border border-rose-200"
                    disabled={busy || !deleteSource.trim()}
                    onClick={() => run(() => api.deleteRagPdf(deleteSource.trim()), 'PDF removed')}
                  >
                    Delete
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-ink-3 leading-relaxed">
                The source name is the <span className="text-ink-2 font-bold">source</span> value the chat assistant cites under an answer.
              </p>
            </div>
          </div>

          <div className="bg-white border border-surface-3 rounded-xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-surface-2 bg-surface flex items-center gap-2">
              <Search className="h-4 w-4 text-emerald-600" />
              <h3 className="text-[13px] font-bold text-ink-2 uppercase tracking-wider">Parcel Indexing</h3>
            </div>
            
            <div className="p-5 space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="parcelId" className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Index Parcel (Tracking ID)</label>
                <div className="flex gap-2">
                  <input
                    id="parcelId"
                    type="text"
                    value={parcelId}
                    onChange={(e) => setParcelId(e.target.value)}
                    placeholder="TRK-..."
                    className="flex-1 h-10 px-3 rounded-md border border-surface-3 bg-white text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                  <Button
                    variant="secondary"
                    disabled={busy || !parcelId.trim()}
                    onClick={() => run(() => indexOne(parcelId.trim()), 'Parcel indexed')}
                  >
                    Index
                  </Button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="removeId" className="text-[11px] font-bold uppercase tracking-wider text-ink-3">Remove Parcel (Internal ID)</label>
                <div className="flex gap-2">
                  <input
                    id="removeId"
                    type="text"
                    value={removeId}
                    onChange={(e) => setRemoveId(e.target.value)}
                    placeholder="UUID"
                    className="flex-1 h-10 px-3 rounded-md border border-surface-3 bg-white text-sm text-ink placeholder:text-ink-3 focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
                  />
                  <Button
                    variant="ghost"
                    className="bg-rose-50 text-rose-600 hover:bg-rose-100 hover:text-rose-600 border border-rose-200"
                    disabled={busy || !removeId.trim()}
                    onClick={() => run(() => api.removeIndexedParcel(removeId.trim()), 'Parcel removed from index')}
                  >
                    Remove
                  </Button>
                </div>
              </div>

              <div className="pt-4 border-t border-surface-2">
                <Button
                  variant="ghost"
                  className="w-full bg-surface-2 text-ink-2 hover:bg-surface-2 border border-surface-3"
                  disabled={busy}
                  onClick={() => run(indexAll, 'Parcels re-indexed')}
                >
                  <Settings className="h-4 w-4 mr-2 text-ink-2" /> Trigger Full Database Re-Index
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

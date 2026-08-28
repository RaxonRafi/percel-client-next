'use client';

import { useEffect, useRef, useState } from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, ApiError } from '@/lib/api';
import { useAuth } from '@/lib/use-auth';

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
    return <p className="text-ink-3">Only admins can manage the AI knowledge base.</p>;
  }

  return (
    <div className="space-y-6">
      {error && <p className="text-sm text-red-600">{error}</p>}
      {msg && <p className="text-sm text-green">{msg}</p>}

      <Card>
        <p className="text-sm text-ink-2">
          These endpoints are currently <strong>unauthenticated server-side</strong>, including the
          two delete routes that drop documents from the vector store. This screen is restricted to
          admins in the client only — the API still needs its own guard.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload a policy PDF</CardTitle>
        </CardHeader>
        <form onSubmit={uploadPdf} className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <Label htmlFor="pdf">PDF file (max 10 MB)</Label>
            <input
              id="pdf"
              ref={fileInput}
              type="file"
              accept="application/pdf"
              className="mt-1 block w-full text-sm text-ink-2 file:mr-3 file:rounded-full file:border-0 file:bg-ink file:px-4 file:py-2 file:text-xs file:text-white"
            />
          </div>
          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Optional"
            />
          </div>
          <div className="md:col-span-3">
            <Button type="submit" disabled={busy}>Upload &amp; index</Button>
          </div>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Remove an indexed PDF</CardTitle>
        </CardHeader>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1">
            <Label htmlFor="source">Source name</Label>
            <Input
              id="source"
              value={deleteSource}
              onChange={(e) => setDeleteSource(e.target.value)}
              placeholder="e.g. shipping-policy.pdf"
            />
          </div>
          <Button
            variant="secondary"
            disabled={busy || !deleteSource.trim()}
            onClick={() => run(() => api.deleteRagPdf(deleteSource.trim()), 'PDF removed')}
          >
            Delete from index
          </Button>
        </div>
        <p className="mt-3 text-xs text-ink-3">
          The source name is the `source` value the chat assistant cites under an answer.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parcel index</CardTitle>
        </CardHeader>
        <div className="space-y-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-64 flex-1">
              <Label htmlFor="parcelId">Parcel ID</Label>
              <Input
                id="parcelId"
                value={parcelId}
                onChange={(e) => setParcelId(e.target.value)}
                placeholder="Parcel uuid"
              />
            </div>
            <Button
              disabled={busy || !parcelId.trim()}
              onClick={() => run(() => api.indexParcel(parcelId.trim()), 'Parcel indexed')}
            >
              Index parcel
            </Button>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-64 flex-1">
              <Label htmlFor="removeId">Parcel ID to remove</Label>
              <Input
                id="removeId"
                value={removeId}
                onChange={(e) => setRemoveId(e.target.value)}
                placeholder="Parcel uuid"
              />
            </div>
            <Button
              variant="secondary"
              disabled={busy || !removeId.trim()}
              onClick={() => run(() => api.removeIndexedParcel(removeId.trim()), 'Parcel removed from index')}
            >
              Remove from index
            </Button>
          </div>

          <div className="border-t border-surface-2 pt-4">
            <Button
              variant="dark"
              disabled={busy}
              onClick={() => run(() => api.indexAllParcels(), 'Bulk index started')}
            >
              Re-index every parcel
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API health</CardTitle>
        </CardHeader>
        <p className="text-sm text-ink-2">
          <code>GET /api</code> → {health || 'checking…'}
        </p>
      </Card>
    </div>
  );
}

/**
 * Opens a fetched file in a new tab (a PDF renders inline there). The tab is
 * opened before the fetch resolves, because a popup blocker only allows
 * windows opened in direct response to a click.
 */
export async function openFile(fetchFile: () => Promise<Blob>, filename: string): Promise<void> {
  const tab = window.open('', '_blank');
  try {
    const blob = await fetchFile();
    const url = URL.createObjectURL(blob);
    if (tab) {
      tab.location.href = url;
    } else {
      // Blocked anyway: fall back to a download.
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();
    }
    // Long enough for the tab to load it.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  } catch (error) {
    tab?.close();
    throw error;
  }
}

/** Saves text the browser already has — the CSV template, say. */
export function saveText(text: string, filename: string, type = 'text/csv'): void {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

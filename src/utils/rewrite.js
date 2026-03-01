export function rewritePlaylist(original, { id, type, baseUrl }) {
  const lines = original.split('\n');
  const out = [];
  let segmentIndex = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (!line || line.startsWith('#')) {
      out.push(line);
      continue;
    }
    const originalPath = line.trim();
    const segUrl = new URL(`${baseUrl}/seg`);
    segUrl.searchParams.set('id', id);
    segUrl.searchParams.set('type', type);
    segUrl.searchParams.set('n', String(segmentIndex++));
    segUrl.searchParams.set('p', originalPath);
    out.push(segUrl.toString());
  }
  return out.join('\n');
}

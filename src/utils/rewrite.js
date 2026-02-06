export function rewritePlaylist(original, { id, type, baseUrl }) {
  const lines = original.split('\n');
  const out = [];
  let segmentIndex = 0;
  for (const line of lines) {
    if (!line || line.startsWith('#')) {
      out.push(line);
      continue;
    }
    const segUrl = new URL(`${baseUrl}/seg`);
    segUrl.searchParams.set('id', id);
    segUrl.searchParams.set('type', type);
    segUrl.searchParams.set('n', String(segmentIndex++));
    out.push(segUrl.toString());
  }
  return out.join('\n');
}

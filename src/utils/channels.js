const CHANNEL_LIST_URL = "https://cwdiptvb.github.io/admin/stream.json";
let cachedChannels = null;
let cachedAt = 0;
export async function loadChannels() {
  const now = Date.now();
  if (cachedChannels && (now - cachedAt < 5 * 60 * 1000)) {
    return cachedChannels;
  }
  const resp = await fetch(CHANNEL_LIST_URL, {
    headers: { "Accept": "application/json" }
  });
  if (!resp.ok) throw new Error("Failed to load channel list");
  const json = await resp.json();
  const map = {};
  for (const ch of json) {
    map[ch.id] = ch;
  }
  cachedChannels = map;
  cachedAt = now;
  return map;
}
export async function getChannelById(id) {
  const channels = await loadChannels();
  return channels[id] || null;
}

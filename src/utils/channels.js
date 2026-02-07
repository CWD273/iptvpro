const CHANNEL_LIST_URL = "https://cwdiptvb.github.io/admin/stream.json";

// Cache in-memory for 5 minutes to reduce fetches
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

  if (!resp.ok) {
    throw new Error("Failed to load channel list");
  }

  const json = await resp.json();

  // Normalize into a map for fast lookup
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

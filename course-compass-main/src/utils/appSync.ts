const SYNC_KEY = "lms_sync_version";
const SYNC_CHANNEL = "lms-sync";

export function publishLmsSync() {
  const stamp = String(Date.now());

  try {
    localStorage.setItem(SYNC_KEY, stamp);
  } catch {
    // ignore storage failures
  }

  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const channel = new BroadcastChannel(SYNC_CHANNEL);
      channel.postMessage(stamp);
      channel.close();
    } catch {
      // ignore channel failures
    }
  }
}

export function subscribeLmsSync(onSync: () => void) {
  const handleStorage = (event: StorageEvent) => {
    if (event.key === SYNC_KEY) {
      onSync();
    }
  };

  window.addEventListener("storage", handleStorage);

  let channel: BroadcastChannel | null = null;
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      channel = new BroadcastChannel(SYNC_CHANNEL);
      channel.onmessage = () => onSync();
    } catch {
      channel = null;
    }
  }

  return () => {
    window.removeEventListener("storage", handleStorage);
    channel?.close();
  };
}

const DEFAULT_ADMIN_PORTS = [5173, 3001, 3002, 3003];

const getConfiguredAdminBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_ADMIN_APP_URL as string | undefined;
  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  return `http://${window.location.hostname}:5173`;
};

export const getAdminAuthUrl = (path: string, host = window.location.hostname, protocol = window.location.protocol) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${protocol}//${host}:${DEFAULT_ADMIN_PORTS[0]}${normalizedPath}`;
};

export const redirectToAdminAuth = async (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const host = window.location.hostname;
  const protocol = window.location.protocol;
  const candidates = [
    import.meta.env.VITE_ADMIN_APP_URL as string | undefined,
    `${protocol}//${host}:5173${normalizedPath}`,
    `${protocol}//${host}:3001${normalizedPath}`,
    `${protocol}//${host}:3002${normalizedPath}`,
    `${protocol}//${host}:3003${normalizedPath}`,
  ].filter(Boolean) as string[];

  for (const url of candidates) {
    try {
      await fetch(url, { method: "GET", mode: "no-cors" });
      window.location.assign(url);
      return true;
    } catch {
      // try the next candidate
    }
  }

  window.location.assign(`${getConfiguredAdminBaseUrl()}${normalizedPath}`);
  return false;
};

import { useEffect, type DependencyList } from "react";
import { subscribeLmsSync } from "@/utils/appSync";

/**
 * Re-run a data loader when the tab becomes visible or the window regains focus.
 * This keeps learner views in sync with admin-side writes without adding a polling loop.
 */
export function useRefreshOnFocus(refresh: () => void | Promise<void>, deps: DependencyList = []) {
  useEffect(() => {
    let active = true;

    const run = () => {
      if (!active) return;
      void refresh();
    };

    const handleFocus = () => run();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        run();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    const unsubscribe = subscribeLmsSync(run);

    return () => {
      active = false;
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      unsubscribe();
    };
  }, [refresh, ...deps]);
}

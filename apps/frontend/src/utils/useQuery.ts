import { useCallback, useEffect, useState } from "react";

export default function useQuery<K extends string>(): Record<
  K,
  string | undefined
> & { ready: boolean } {
  const [queries, setQueries] = useState<Record<K, string>>(
    {} as Record<K, string>
  );
  const [ready, setReady] = useState(false);

  const updateParams = useCallback(() => {
    const params = new URLSearchParams(
      window.location.search.split(/\?/)[1] || ""
    );
    const items: Record<K, string> = {} as Record<K, string>;

    for (const key of params.keys()) {
      if (params.get(key) !== null) {
        items[key as K] = params.get(key)!;
      }
    }

    setQueries(items);
    setReady(true);
  }, []);

  useEffect(() => {
    updateParams();
    window.addEventListener("popstate", updateParams);
  }, [updateParams]);

  return { ...queries, ready };
}

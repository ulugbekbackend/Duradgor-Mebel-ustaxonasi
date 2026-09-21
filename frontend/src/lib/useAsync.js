import { useCallback, useEffect, useState } from "react";

/**
 * Asinxron ma'lumot yuklash: { data, loading, error, reload }.
 * deps o'zgarganda qayta yuklaydi; eskirgan javob holatni buzmaydi.
 */
export function useAsync(fn, deps) {
  const [state, setState] = useState({ data: undefined, loading: true, error: null });
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: null }));
    fn()
      .then((data) => alive && setState({ data, loading: false, error: null }))
      .catch((error) => alive && setState({ data: undefined, loading: false, error }));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, nonce]);

  const reload = useCallback(() => setNonce((n) => n + 1), []);
  return { ...state, reload };
}

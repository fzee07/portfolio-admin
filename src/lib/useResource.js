import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api";
import { useToast } from "./auth";

const clone = (o) => JSON.parse(JSON.stringify(o ?? {}));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/* ---------------- Singleton resource ---------------- */
export function useSingleton(name, fallback = {}) {
  const toast = useToast();
  const res = useMemo(() => api.singleton(name), [name]);
  const [server, setServer] = useState(null);
  const [draft, setDraft] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await res.get();
      const merged = { ...fallback, ...(data || {}) };
      setServer(clone(merged));
      setDraft(clone(merged));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res]);

  useEffect(() => { load(); }, [load]);

  const dirty = server !== null && !same(server, draft);
  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const save = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const saved = await res.save(draft);
      const merged = { ...fallback, ...(saved || draft) };
      setServer(clone(merged));
      setDraft(clone(merged));
      toast("Saved");
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res, draft]);

  const reset = () => setDraft(clone(server));

  return { draft, setDraft, setField, dirty, loading, saving, error, save, reset, reload: load };
}

/* ---------------- Collection resource ---------------- */
export function useCollection(name) {
  const toast = useToast();
  const res = useMemo(() => api.collection(name), [name]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const mounted = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await res.list();
      if (mounted.current) setItems(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [res]);

  useEffect(() => {
    mounted.current = true;
    load();
    return () => { mounted.current = false; };
  }, [load]);

  const create = useCallback(async (body) => {
    setBusy(true); setError(null);
    try {
      const created = await res.create(body);
      await load();
      toast("Created");
      return created;
    } catch (e) { setError(e.message); throw e; }
    finally { setBusy(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res, load]);

  const update = useCallback(async (id, body) => {
    setBusy(true); setError(null);
    try {
      const saved = await res.update(id, body);
      await load();
      toast("Saved");
      return saved;
    } catch (e) { setError(e.message); throw e; }
    finally { setBusy(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res, load]);

  const remove = useCallback(async (id) => {
    setBusy(true); setError(null);
    try {
      await res.remove(id);
      await load();
      toast("Deleted");
    } catch (e) { setError(e.message); throw e; }
    finally { setBusy(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res, load]);

  const reorder = useCallback(async (ids) => {
    try { setItems(await res.reorder(ids)); } catch (e) { setError(e.message); }
  }, [res]);

  return { items, loading, busy, error, create, update, remove, reorder, reload: load };
}

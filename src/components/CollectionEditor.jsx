import { useEffect, useMemo, useState } from "react";
import { useCollection } from "../lib/useResource";
import { ErrorBanner, SaveBar } from "./ui";

const clone = (o) => JSON.parse(JSON.stringify(o ?? {}));
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

/**
 * Generic list-and-edit screen for a per-item collection.
 *
 * props:
 *   name      – API resource name ("experience", "projects", …)
 *   intro     – { title, text } page heading
 *   titleOf   – (item) => string  (list row title)
 *   subOf     – (item) => string  (list row subtitle, optional)
 *   tagOf     – (item) => string  (small uppercase tag, optional)
 *   blank     – () => object       (new-item template)
 *   renderForm– (draft, setField) => JSX  (the per-item form body)
 */
export default function CollectionEditor({ name, intro, titleOf, subOf, tagOf, blank, renderForm }) {
  const col = useCollection(name);
  const [selectedId, setSelectedId] = useState(null); // numeric id, or "__new"
  const [draft, setDraft] = useState(null);
  const [baseline, setBaseline] = useState(null);

  // Auto-select first item once loaded (if nothing chosen).
  useEffect(() => {
    if (col.loading) return;
    if (selectedId === null && col.items.length > 0) {
      pick(col.items[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [col.loading, col.items]);

  const pick = (item) => {
    setSelectedId(item.id);
    setDraft(clone(item));
    setBaseline(clone(item));
  };

  const startNew = () => {
    const tpl = blank ? blank() : {};
    setSelectedId("__new");
    setDraft(clone(tpl));
    setBaseline(null);
  };

  const setField = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const isNew = selectedId === "__new";
  const dirty = isNew ? true : baseline && !same(baseline, draft);

  const save = async () => {
    if (isNew) {
      const created = await col.create(draft);
      if (created?.id != null) { setSelectedId(created.id); setBaseline(clone(created)); setDraft(clone(created)); }
    } else {
      const saved = await col.update(selectedId, draft);
      if (saved) { setBaseline(clone(saved)); setDraft(clone(saved)); }
    }
  };

  const del = async () => {
    if (isNew) { setSelectedId(null); setDraft(null); return; }
    if (!window.confirm("Delete this item permanently?")) return;
    await col.remove(selectedId);
    setSelectedId(null); setDraft(null); setBaseline(null);
  };

  const reset = () => setDraft(clone(baseline));

  const list = col.items;

  return (
    <div>
      <div className="page-intro">
        <span className="eyebrow">{name}</span>
        <h2 style={{ margin: "6px 0 0", fontSize: 22, letterSpacing: "-0.01em" }}>{intro.title}</h2>
        {intro.text && <p>{intro.text}</p>}
      </div>

      <ErrorBanner>{col.error}</ErrorBanner>

      <div className="grid-2" style={{ alignItems: "start", gridTemplateColumns: "minmax(260px, 340px) 1fr" }}>
        {/* master list */}
        <div>
          <div className="panel" style={{ marginBottom: 12 }}>
            <div className="panel-head">
              <h3>{list.length} item{list.length === 1 ? "" : "s"}</h3>
              <button className="btn primary sm" onClick={startNew}>+ New</button>
            </div>
            <div className="col-list">
              {col.loading && <div className="loading">Loading…</div>}
              {!col.loading && list.length === 0 && <div className="empty">Nothing here yet. Create one →</div>}
              {list.map((item) => (
                <div key={item.id}
                  className={`col-item ${selectedId === item.id ? "active" : ""}`}
                  onClick={() => pick(item)}>
                  <div style={{ minWidth: 0 }}>
                    <div className="ci-title" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{titleOf(item)}</div>
                    {subOf && <div className="ci-sub">{subOf(item)}</div>}
                  </div>
                  {tagOf && tagOf(item) && <span className="ci-tag">{tagOf(item)}</span>}
                </div>
              ))}
              {isNew && (
                <div className="col-item active">
                  <div className="ci-title">New item…</div>
                  <span className="ci-tag">draft</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* detail form */}
        <div>
          {draft === null ? (
            <div className="panel"><div className="empty">Select an item or create a new one.</div></div>
          ) : (
            <>
              <div className="panel">
                <div className="panel-head">
                  <h3>{isNew ? "New item" : titleOf(draft) || "Edit item"}</h3>
                  <button className="btn danger sm" onClick={del}>{isNew ? "Discard" : "Delete"}</button>
                </div>
                <div className="panel-body">{renderForm(draft, setField)}</div>
              </div>
              <SaveBar dirty={dirty} saving={col.busy} onSave={save} onReset={isNew ? null : reset} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

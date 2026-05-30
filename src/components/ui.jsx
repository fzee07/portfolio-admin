import { useState } from "react";

export function Field({ label, hint, children }) {
  return (
    <div className="field">
      {label && <label>{label}</label>}
      {children}
      {hint && <div className="hint">{hint}</div>}
    </div>
  );
}

export function TextInput({ value, onChange, ...rest }) {
  return (
    <input
      type="text"
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}

export function TextArea({ value, onChange, rows = 4, ...rest }) {
  return (
    <textarea
      rows={rows}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
      {...rest}
    />
  );
}

export function NumberInput({ value, onChange, step = 1, ...rest }) {
  return (
    <input
      type="number"
      step={step}
      value={value ?? ""}
      onChange={(e) => {
        const v = e.target.value;
        onChange(v === "" ? "" : Number(v));
      }}
      {...rest}
    />
  );
}

export function Toggle({ checked, onChange, label }) {
  return (
    <label className="toggle">
      <input type="checkbox" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="track"><span className="knob" /></span>
      {label && <span style={{ fontSize: 13 }}>{label}</span>}
    </label>
  );
}

export function Panel({ title, action, children }) {
  return (
    <div className="panel">
      {(title || action) && (
        <div className="panel-head">
          <h3>{title}</h3>
          {action}
        </div>
      )}
      <div className="panel-body">{children}</div>
    </div>
  );
}

/* Editable list of plain strings. */
export function StringList({ items = [], onChange, placeholder = "Add value…" }) {
  const set = (i, v) => onChange(items.map((x, idx) => (idx === i ? v : x)));
  const add = () => onChange([...items, ""]);
  const remove = (i) => onChange(items.filter((_, idx) => idx !== i));
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div>
      {items.length === 0 && <div className="empty" style={{ padding: "14px 0" }}>No items yet.</div>}
      {items.map((val, i) => (
        <div className="row-item" key={i}>
          <span className="idx">{i + 1}</span>
          <div className="grow">
            <TextInput value={val} onChange={(v) => set(i, v)} placeholder={placeholder} />
          </div>
          <button className="icon-btn" type="button" title="Move up" onClick={() => move(i, -1)}>↑</button>
          <button className="icon-btn" type="button" title="Move down" onClick={() => move(i, 1)}>↓</button>
          <button className="icon-btn" type="button" title="Remove" onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button className="btn ghost sm" type="button" onClick={add}>+ Add</button>
    </div>
  );
}

/* Editable map of arbitrary key/value string pairs (metrics, links, stats…). */
export function KeyValueEditor({ value = {}, onChange, keyLabel = "key", valLabel = "value" }) {
  // Maintain order as an array of [k, v] pairs.
  const pairs = Array.isArray(value) ? value : Object.entries(value || {});
  const emit = (next) => {
    const obj = {};
    next.forEach(([k, v]) => { if (k !== "") obj[k] = v; });
    onChange(obj);
  };
  const setKey = (i, k) => emit(pairs.map((p, idx) => (idx === i ? [k, p[1]] : p)));
  const setVal = (i, v) => emit(pairs.map((p, idx) => (idx === i ? [p[0], v] : p)));
  const add = () => onChange(buildObj([...pairs, ["", ""]]));
  const remove = (i) => emit(pairs.filter((_, idx) => idx !== i));
  function buildObj(next) {
    const obj = {};
    next.forEach(([k, v], idx) => { obj[k === "" ? `__new${idx}` : k] = v; });
    return obj;
  }
  return (
    <div>
      {pairs.length === 0 && <div className="empty" style={{ padding: "10px 0" }}>No entries.</div>}
      {pairs.map(([k, v], i) => (
        <div className="kv-row" key={i}>
          <input type="text" placeholder={keyLabel} value={k.startsWith("__new") ? "" : k}
            onChange={(e) => setKey(i, e.target.value)} />
          <input type="text" placeholder={valLabel} value={v ?? ""}
            onChange={(e) => setVal(i, e.target.value)} />
          <button className="icon-btn" type="button" title="Remove" onClick={() => remove(i)}>✕</button>
        </div>
      ))}
      <button className="btn ghost sm" type="button" onClick={add}>+ Add pair</button>
    </div>
  );
}

/* Editable list of structured objects; caller renders each item's fields. */
export function Repeater({ items = [], onChange, render, titleOf, addLabel = "+ Add item", blank }) {
  const [open, setOpen] = useState(() => items.map(() => true));
  const set = (i, next) => onChange(items.map((x, idx) => (idx === i ? next : x)));
  const add = () => { onChange([...items, blank ? blank() : {}]); setOpen((o) => [...o, true]); };
  const remove = (i) => { onChange(items.filter((_, idx) => idx !== i)); setOpen((o) => o.filter((_, idx) => idx !== i)); };
  const move = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  const toggle = (i) => setOpen((o) => o.map((v, idx) => (idx === i ? !v : v)));

  return (
    <div>
      {items.map((item, i) => (
        <div className="repeater-item" key={i}>
          <div className="ri-head">
            <span className="t">{titleOf ? titleOf(item, i) : `Item ${i + 1}`}</span>
            <span className="btn-row">
              <button className="icon-btn" type="button" title="Move up" onClick={() => move(i, -1)}>↑</button>
              <button className="icon-btn" type="button" title="Move down" onClick={() => move(i, 1)}>↓</button>
              <button className="icon-btn" type="button" title={open[i] ? "Collapse" : "Expand"} onClick={() => toggle(i)}>{open[i] ? "–" : "+"}</button>
              <button className="icon-btn" type="button" title="Remove" onClick={() => remove(i)}>✕</button>
            </span>
          </div>
          {open[i] && <div className="ri-body">{render(item, (next) => set(i, next), i)}</div>}
        </div>
      ))}
      <button className="btn ghost sm" type="button" onClick={add}>{addLabel}</button>
    </div>
  );
}

export function SaveBar({ dirty, saving, onSave, onReset, extra }) {
  return (
    <div className="savebar">
      <span className={`status ${dirty ? "dirty" : ""}`}>
        {saving ? "Saving…" : dirty ? "Unsaved changes" : "All changes saved"}
      </span>
      <span className="btn-row">
        {extra}
        {dirty && onReset && (
          <button className="btn ghost" type="button" onClick={onReset} disabled={saving}>Revert</button>
        )}
        <button className="btn primary" type="button" onClick={onSave} disabled={!dirty || saving}>
          {saving ? "Saving…" : "Save changes"}
        </button>
      </span>
    </div>
  );
}

export function ErrorBanner({ children }) {
  if (!children) return null;
  return <div className="field-err">⚠ {children}</div>;
}

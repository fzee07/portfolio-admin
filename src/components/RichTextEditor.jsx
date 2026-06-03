import { useEffect, useRef, useState } from "react";
import { api } from "../lib/api";

/* A lightweight rich-text editor built on contentEditable.
 *
 * Why this approach: the requirement is "paste from anywhere and keep the
 * formatting, and have it look identical in the admin preview and on the live
 * site." A contentEditable keeps the pasted HTML formatting natively; we store
 * that HTML and the backend sanitizes it on save (XSS-safe allowlist). The
 * SAME HTML string is rendered (inside a `.prose` container) in the preview
 * here and on the frontend — so what you see is what gets published.
 *
 * The toolbar uses document.execCommand. It's technically deprecated but still
 * works in every current browser and keeps this dependency-free and tiny —
 * appropriate for a single-user admin tool.
 */

// Fixed lorem-ipsum vocabulary, cycled to reach the requested word count.
const LOREM_WORDS = [
  "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit",
  "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore",
  "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud",
  "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo",
  "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate",
  "velit", "esse", "cillum", "eu", "fugiat", "nulla", "pariatur", "excepteur",
  "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui",
  "officia", "deserunt", "mollit", "anim", "id", "est", "laborum",
];

// Generate `count` words of lorem ipsum: first word capitalised, no stray
// punctuation mid-string, terminated with a single period.
function lorem(count) {
  const n = Math.max(1, Math.floor(count) || 0);
  const words = [];
  for (let i = 0; i < n; i++) words.push(LOREM_WORDS[i % LOREM_WORDS.length]);
  let text = words.join(" ").replace(/[.,;:]/g, "");
  text = text.charAt(0).toUpperCase() + text.slice(1);
  return `${text}.`;
}

const Btn = ({ title, onClick, children, active }) => (
  <button
    type="button"
    className={`rte-btn${active ? " active" : ""}`}
    title={title}
    onMouseDown={(e) => {
      e.preventDefault(); // keep selection in the editor
      onClick();
    }}
  >
    {children}
  </button>
);

export function RichTextEditor({ value, onChange }) {
  const ref = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState(null);

  // Load incoming HTML only when it differs from what's on screen, so typing
  // doesn't reset the caret.
  useEffect(() => {
    const el = ref.current;
    if (el && value !== el.innerHTML) el.innerHTML = value || "";
  }, [value]);

  const emit = () => onChange(ref.current?.innerHTML || "");

  const cmd = (command, arg) => {
    document.execCommand(command, false, arg);
    ref.current?.focus();
    emit();
  };

  const makeLink = () => {
    const url = window.prompt("Link URL");
    if (url) cmd("createLink", url);
  };

  const formatBlock = (tag) => cmd("formatBlock", tag);

  // Paste: let the browser insert the rich HTML (keeps formatting), then read
  // it back. Backend sanitizes on save.
  const onPaste = () => setTimeout(emit, 0);

  // Emmet-style helper: typing `lorem30` / `lorem 50` / `lorem` then Tab expands
  // to that many words of lorem ipsum (default 30). Tab otherwise behaves normally.
  const onKeyDown = (e) => {
    if (e.key !== "Tab") return;

    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;

    const range = sel.getRangeAt(0);
    const node = range.startContainer;
    // Only act on a collapsed caret sitting inside a text node.
    if (!range.collapsed || node.nodeType !== Node.TEXT_NODE) return;

    const offset = range.startOffset;
    const before = node.textContent.slice(0, offset);
    const match = before.match(/(?:^|\s)lorem\s?(\d+)?$/i);
    if (!match) return; // no token → let Tab do its default thing

    e.preventDefault();
    const count = match[1] ? parseInt(match[1], 10) : 30;

    // Delete only the "lorem N" token, preserving any whitespace the regex
    // matched before it.
    const leadingWs = /^\s/.test(match[0]) ? 1 : 0;
    const tokenStart = offset - match[0].length + leadingWs;

    const tokenRange = document.createRange();
    tokenRange.setStart(node, tokenStart);
    tokenRange.setEnd(node, offset);
    sel.removeAllRanges();
    sel.addRange(tokenRange);

    // Replace the selected token with the generated text and sync the value.
    document.execCommand("insertText", false, lorem(count));
    emit();
  };

  const insertImage = async (file) => {
    if (!file) return;
    setUploading(true);
    setErr(null);
    try {
      const res = await api.uploadImage(file);
      const url = `${api.base}${res.url}`;
      cmd("insertHTML", `<img src="${url}" alt="" />`);
    } catch (e) {
      setErr(e.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <Btn title="Heading 2" onClick={() => formatBlock("H2")}>H2</Btn>
        <Btn title="Heading 3" onClick={() => formatBlock("H3")}>H3</Btn>
        <Btn title="Paragraph" onClick={() => formatBlock("P")}>¶</Btn>
        <span className="rte-sep" />
        <Btn title="Bold" onClick={() => cmd("bold")}><b>B</b></Btn>
        <Btn title="Italic" onClick={() => cmd("italic")}><i>I</i></Btn>
        <Btn title="Underline" onClick={() => cmd("underline")}><u>U</u></Btn>
        <Btn title="Strikethrough" onClick={() => cmd("strikeThrough")}><s>S</s></Btn>
        <span className="rte-sep" />
        <Btn title="Bulleted list" onClick={() => cmd("insertUnorderedList")}>• ‹</Btn>
        <Btn title="Numbered list" onClick={() => cmd("insertOrderedList")}>1.</Btn>
        <Btn title="Quote" onClick={() => formatBlock("BLOCKQUOTE")}>❝</Btn>
        <Btn title="Code block" onClick={() => formatBlock("PRE")}>{"</>"}</Btn>
        <span className="rte-sep" />
        <Btn title="Add link" onClick={makeLink}>🔗</Btn>
        <label className="rte-btn" title="Insert image" style={{ cursor: "pointer" }}>
          {uploading ? "…" : "🖼"}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              insertImage(f);
            }}
          />
        </label>
        <span className="rte-sep" />
        <Btn title="Clear formatting" onClick={() => cmd("removeFormat")}>⌫</Btn>
      </div>

      <div
        ref={ref}
        className="rte-content prose"
        contentEditable
        suppressContentEditableWarning
        onInput={emit}
        onBlur={emit}
        onPaste={onPaste}
        onKeyDown={onKeyDown}
        data-placeholder="Write your article… or paste formatted text from anywhere — the formatting is kept."
      />
      {err && <div className="field-err" style={{ marginTop: 8 }}>⚠ {err}</div>}
    </div>
  );
}

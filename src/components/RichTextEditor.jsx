import { useEffect, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import { api } from "../lib/api";

/* Rich-text editor on TipTap (ProseMirror). Replaces the old execCommand editor
 * so formatting is correctly scoped to the selection / current block (never the
 * whole document), the code block wraps, and image insert lands at the caret.
 *
 * Same public interface ({ value, onChange }, HTML string) and the same toolbar
 * + styling (.rte / .rte-toolbar / .rte-btn / .rte-sep). The content area uses
 * `.prose`, so the editor preview matches the published article exactly. */

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

function lorem(count) {
  const n = Math.max(1, Math.floor(count) || 0);
  const words = [];
  for (let i = 0; i < n; i++) words.push(LOREM_WORDS[i % LOREM_WORDS.length]);
  let text = words.join(" ").replace(/[.,;:]/g, "");
  text = text.charAt(0).toUpperCase() + text.slice(1);
  return `${text}.`;
}

/* Typing `lorem` / `lorem30` / `lorem 50` then Tab expands to N words (default
 * 30); otherwise Tab behaves normally. Implemented in ProseMirror's keydown so
 * it's scoped to the caret's text block. */
function loremOnTab(view, event) {
  if (event.key !== "Tab") return false;
  const { state } = view;
  const { selection } = state;
  if (!selection.empty) return false;
  const { $from, from } = selection;
  const before = $from.parent.textBetween(0, $from.parentOffset, undefined, "￼");
  const match = before.match(/(?:^|\s)lorem\s?(\d+)?$/i);
  if (!match) return false;
  event.preventDefault();
  const count = match[1] ? parseInt(match[1], 10) : 30;
  const leadingWs = /^\s/.test(match[0]) ? 1 : 0;
  const tokenLen = match[0].length - leadingWs;
  view.dispatch(state.tr.insertText(lorem(count), from - tokenLen, from));
  return true;
}

const Btn = ({ title, onClick, active, children }) => (
  <button
    type="button"
    className={`rte-btn${active ? " active" : ""}`}
    title={title}
    onMouseDown={(e) => { e.preventDefault(); onClick(); }}
  >
    {children}
  </button>
);

export function RichTextEditor({ value, onChange }) {
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image,
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: { class: "rte-content prose" },
      handleKeyDown: (view, event) => loremOnTab(view, event),
    },
  });

  // Sync an EXTERNAL value change (e.g. switching posts) without resetting the
  // caret on every keystroke — our own edits already equal getHTML().
  useEffect(() => {
    if (!editor) return;
    if ((value || "") !== editor.getHTML()) {
      editor.commands.setContent(value || "", false);
    }
  }, [value, editor]);

  const cmd = (fn) => () => { if (editor) fn(editor.chain().focus()).run(); };
  const is = (name, attrs) => (editor ? editor.isActive(name, attrs) : false);

  const setLink = () => {
    if (!editor) return;
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("Link URL", prev);
    if (url === null) return;
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  };

  const insertImage = async (file) => {
    if (!file || !editor) return;
    setUploading(true);
    setErr(null);
    try {
      const res = await api.uploadImage(file);
      editor.chain().focus().setImage({ src: `${api.base}${res.url}` }).run();
    } catch (e) {
      setErr(e.message || "Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="rte">
      <div className="rte-toolbar">
        <Btn title="Heading 2" active={is("heading", { level: 2 })} onClick={cmd((c) => c.toggleHeading({ level: 2 }))}>H2</Btn>
        <Btn title="Heading 3" active={is("heading", { level: 3 })} onClick={cmd((c) => c.toggleHeading({ level: 3 }))}>H3</Btn>
        <Btn title="Paragraph" active={is("paragraph")} onClick={cmd((c) => c.setParagraph())}>¶</Btn>
        <span className="rte-sep" />
        <Btn title="Bold" active={is("bold")} onClick={cmd((c) => c.toggleBold())}><b>B</b></Btn>
        <Btn title="Italic" active={is("italic")} onClick={cmd((c) => c.toggleItalic())}><i>I</i></Btn>
        <Btn title="Underline" active={is("underline")} onClick={cmd((c) => c.toggleUnderline())}><u>U</u></Btn>
        <Btn title="Strikethrough" active={is("strike")} onClick={cmd((c) => c.toggleStrike())}><s>S</s></Btn>
        <span className="rte-sep" />
        <Btn title="Bulleted list" active={is("bulletList")} onClick={cmd((c) => c.toggleBulletList())}>• ‹</Btn>
        <Btn title="Numbered list" active={is("orderedList")} onClick={cmd((c) => c.toggleOrderedList())}>1.</Btn>
        <Btn title="Quote" active={is("blockquote")} onClick={cmd((c) => c.toggleBlockquote())}>❝</Btn>
        <Btn title="Code block" active={is("codeBlock")} onClick={cmd((c) => c.toggleCodeBlock())}>{"</>"}</Btn>
        <span className="rte-sep" />
        <Btn title="Add link" active={is("link")} onClick={setLink}>🔗</Btn>
        <label className="rte-btn" title="Insert image" style={{ cursor: "pointer" }}>
          {uploading ? "…" : "🖼"}
          <input
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ""; insertImage(f); }}
          />
        </label>
        <span className="rte-sep" />
        <Btn title="Clear formatting" onClick={cmd((c) => c.unsetAllMarks().clearNodes())}>⌫</Btn>
      </div>

      <EditorContent editor={editor} />
      {err && <div className="field-err" style={{ marginTop: 8 }}>⚠ {err}</div>}
    </div>
  );
}

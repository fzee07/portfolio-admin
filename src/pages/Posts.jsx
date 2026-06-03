import CollectionEditor from "../components/CollectionEditor";
import { RichTextEditor } from "../components/RichTextEditor";
import { Field, TextInput, TextArea, Panel, TagInput, ImageUpload } from "../components/ui";
import { longDate, todayLocal } from "../lib/format";

const SOURCES = [
  { v: "self", label: "My blog" },
  { v: "linkedin", label: "LinkedIn" },
  { v: "medium", label: "Medium" },
  { v: "github", label: "GitHub" },
  { v: "other", label: "Other" },
];

const blank = () => ({
  kind: "article",
  source: "self",
  title: "",
  slug: "",
  excerpt: "",
  bannerImage: "",
  body: "",
  externalUrl: "",
  sourceUrl: "",
  tags: [],
  topic: "",
  status: "draft",
  publishedAt: "",
});

/* A published post whose publish date hasn't arrived yet is "scheduled".
   Parse "YYYY-MM-DD" as a LOCAL date (matches the backend's isLive gate). */
const isFuture = (publishedAt) => {
  if (!publishedAt) return false;
  const m = String(publishedAt).match(/^(\d{4})-(\d{2})-(\d{2})/);
  const d = m ? new Date(+m[1], +m[2] - 1, +m[3]) : new Date(publishedAt);
  return !isNaN(d.getTime()) && d.getTime() > Date.now();
};

function Segmented({ value, options, onChange }) {
  return (
    <div className="segmented">
      {options.map((o) => (
        <button
          key={o.v}
          type="button"
          className={value === o.v ? "active" : ""}
          onClick={() => onChange(o.v)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Posts() {
  return (
    <CollectionEditor
      name="posts"
      intro={{
        title: "Posts",
        text: "Everything in your Read section — your own articles and curated LinkedIn / Medium / GitHub links. Drafts stay private until you publish.",
      }}
      titleOf={(p) => p.title || "Untitled"}
      subOf={(p) => {
        const src = SOURCES.find((s) => s.v === p.source)?.label || p.source;
        return p.kind === "article" ? `Article · ${src}` : `Link · ${src}`;
      }}
      tagOf={(p) =>
        p.status !== "published" ? "draft" : isFuture(p.publishedAt) ? "scheduled" : "live"
      }
      blank={blank}
      renderForm={(d, set) => {
        const isArticle = (d.kind || "article") === "article";
        return (
          <>
            <Panel title="Type">
              <div className="grid-2">
                <Field label="Kind" hint="An article is written & read here. A link points out to LinkedIn/Medium/GitHub.">
                  <Segmented
                    value={d.kind || "article"}
                    onChange={(v) => set("kind", v)}
                    options={[
                      { v: "article", label: "Article (hosted)" },
                      { v: "external", label: "External link" },
                    ]}
                  />
                </Field>
                <Field label="Source" hint="Drives the filter tab and icon in the Read section.">
                  <select value={d.source || "self"} onChange={(e) => set("source", e.target.value)}>
                    {SOURCES.map((s) => <option key={s.v} value={s.v}>{s.label}</option>)}
                  </select>
                </Field>
              </div>
            </Panel>

            <Panel title="Basics">
              <Field label="Title"><TextInput value={d.title} onChange={(v) => set("title", v)} /></Field>
              {isArticle && (
                <Field label="Slug" hint="Auto-generated from the title; edit if you want a custom URL. Leave blank to auto-fill.">
                  <TextInput value={d.slug} onChange={(v) => set("slug", v)} placeholder="auto from title" />
                </Field>
              )}
              <Field label="Excerpt" hint="Short summary shown on the cards. Leave blank to auto-generate from the body.">
                <TextArea rows={2} value={d.excerpt} onChange={(v) => set("excerpt", v)} />
              </Field>
              {!isArticle && (
                <Field label="External URL" hint="Where this card links to (opens in a new tab).">
                  <TextInput value={d.externalUrl} onChange={(v) => set("externalUrl", v)} placeholder="https://linkedin.com/posts/…" />
                </Field>
              )}
              {isArticle && (
                <Field
                  label="Original URL (optional)"
                  hint="If this was first posted on LinkedIn/Medium, paste the original link. A 'Read this on …' button will link back to it."
                >
                  <TextInput value={d.sourceUrl} onChange={(v) => set("sourceUrl", v)} placeholder="https://linkedin.com/posts/…" />
                </Field>
              )}
            </Panel>

            <Panel title="Banner image">
              <Field label={isArticle ? "Article banner" : "Card thumbnail"} hint="Shown on the card and (for articles) atop the reader. ~16:9.">
                <ImageUpload value={d.bannerImage} onChange={(v) => set("bannerImage", v)} aspect={16 / 9} maxSize={1600} />
              </Field>
            </Panel>

            {isArticle && (
              <Panel title="Body">
                <p className="hint" style={{ marginTop: 0, marginBottom: 10 }}>
                  Paste from LinkedIn, Medium, Google Docs — formatting is preserved and
                  renders identically on the live site.
                </p>
                <RichTextEditor value={d.body} onChange={(v) => set("body", v)} />
              </Panel>
            )}

            <Panel title="Organize & publish">
              <div className="grid-2">
                <Field label="Topic" hint="Optional grouping label.">
                  <TextInput value={d.topic} onChange={(v) => set("topic", v)} placeholder="e.g. Backend, AI" />
                </Field>
                <Field label="Status">
                  <Segmented
                    value={d.status || "draft"}
                    onChange={(v) => set("status", v)}
                    options={[
                      { v: "draft", label: "Draft" },
                      { v: "published", label: "Published" },
                    ]}
                  />
                </Field>
              </div>
              <Field label="Tags" hint="Type a tag and press Enter (no “#” needed). Shown as #tag on the site.">
                <TagInput value={d.tags || []} onChange={(v) => set("tags", v)} placeholder="Add a tag…" />
              </Field>
              <Field label="Publish date" hint="Optional — auto-set to today when first published if left blank. Pick a future date to schedule (stays hidden until then).">
                <div className="date-row">
                  <input
                    type="date"
                    className="date-input"
                    value={(d.publishedAt || "").slice(0, 10)}
                    onChange={(e) => set("publishedAt", e.target.value)}
                  />
                  <button type="button" className="btn ghost sm" onClick={() => set("publishedAt", todayLocal())}>Today</button>
                  {d.publishedAt && (
                    <button type="button" className="btn ghost sm" onClick={() => set("publishedAt", "")}>Clear</button>
                  )}
                </div>
                {d.publishedAt && <div className="date-readback">Shows as: <b>{longDate(d.publishedAt)}</b></div>}
              </Field>
            </Panel>
          </>
        );
      }}
    />
  );
}

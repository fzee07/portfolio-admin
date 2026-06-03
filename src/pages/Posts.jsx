import CollectionEditor from "../components/CollectionEditor";
import { RichTextEditor } from "../components/RichTextEditor";
import { Field, TextInput, TextArea, Panel, StringList, ImageUpload } from "../components/ui";

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

const fmtMs = (ms) => {
  if (!ms) return "—";
  const s = Math.round(ms / 1000);
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  return `${m}m ${s % 60}s`;
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
      tagOf={(p) => (p.status === "published" ? "live" : "draft")}
      blank={blank}
      renderForm={(d, set) => {
        const isArticle = (d.kind || "article") === "article";
        const a = d.analytics || {};
        const avg = a.readSessions ? a.readMsTotal / a.readSessions : 0;
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
              <Field label="Tags"><StringList items={d.tags || []} onChange={(v) => set("tags", v)} placeholder="A tag…" /></Field>
              <Field label="Publish date" hint="Optional. Auto-set when first published if left blank.">
                <TextInput value={d.publishedAt} onChange={(v) => set("publishedAt", v)} placeholder="2026-06-02 or ISO date" />
              </Field>
            </Panel>

            <Panel title="Engagement (read-only)">
              <div className="stat-grid">
                <div className="stat-card"><div className="v">{a.views || 0}</div><div className="l">Views</div></div>
                {!isArticle && <div className="stat-card"><div className="v">{a.clicks || 0}</div><div className="l">Clicks</div></div>}
                <div className="stat-card"><div className="v">{fmtMs(avg)}</div><div className="l">Avg read</div></div>
                <div className="stat-card"><div className="v">{fmtMs(a.maxReadMs)}</div><div className="l">Longest read</div></div>
              </div>
            </Panel>
          </>
        );
      }}
    />
  );
}

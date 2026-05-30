import { useSingleton } from "../lib/useResource";
import CollectionEditor from "../components/CollectionEditor";
import { Field, TextInput, TextArea, Toggle, Panel, StringList, KeyValueEditor, SaveBar, ErrorBanner } from "../components/ui";

const META_FALLBACK = { totalYears: "", experienceSummary: "", projectCategories: [] };

function CategoriesPanel() {
  const r = useSingleton("meta", META_FALLBACK);
  const d = r.draft;
  if (r.loading) return null;
  return (
    <>
      <ErrorBanner>{r.error}</ErrorBanner>
      <Panel title="Project categories" >
        <p className="hint" style={{ marginTop: 0, marginBottom: 12 }}>The filter tabs shown on the projects page (e.g. "All", "AI / Backend").</p>
        <StringList items={d.projectCategories || []} onChange={(v) => r.setField("projectCategories", v)} placeholder="e.g. Full-Stack" />
        <SaveBar dirty={r.dirty} saving={r.saving} onSave={r.save} onReset={r.reset} />
      </Panel>
    </>
  );
}

const blank = () => ({
  title: "", shortDescription: "", description: "", image: "", category: "",
  featured: false, technologies: [], features: [], metrics: {}, links: {},
  duration: "", role: "",
});

export default function Projects() {
  return (
    <div>
      <CategoriesPanel />
      <CollectionEditor
        name="projects"
        intro={{ title: "Projects", text: "Portfolio projects. Metrics and links accept any key/value pairs." }}
        titleOf={(p) => p.title || "Untitled project"}
        subOf={(p) => p.category}
        tagOf={(p) => (p.featured ? "featured" : "")}
        blank={blank}
        renderForm={(d, set) => (
          <>
            <Field label="Title"><TextInput value={d.title} onChange={(v) => set("title", v)} /></Field>
            <Field label="Short description"><TextInput value={d.shortDescription} onChange={(v) => set("shortDescription", v)} /></Field>
            <Field label="Description"><TextArea rows={4} value={d.description} onChange={(v) => set("description", v)} /></Field>
            <div className="grid-2">
              <Field label="Image path" hint="e.g. /projects/my-project.png"><TextInput value={d.image} onChange={(v) => set("image", v)} /></Field>
              <Field label="Category"><TextInput value={d.category} onChange={(v) => set("category", v)} /></Field>
              <Field label="Duration"><TextInput value={d.duration} onChange={(v) => set("duration", v)} /></Field>
              <Field label="Role"><TextInput value={d.role} onChange={(v) => set("role", v)} /></Field>
            </div>
            <Field label="Featured"><Toggle checked={d.featured} onChange={(v) => set("featured", v)} label={d.featured ? "Shown as featured" : "Not featured"} /></Field>
            <Field label="Technologies">
              <StringList items={d.technologies || []} onChange={(v) => set("technologies", v)} placeholder="e.g. MongoDB" />
            </Field>
            <Field label="Features">
              <StringList items={d.features || []} onChange={(v) => set("features", v)} placeholder="A feature…" />
            </Field>
            <Field label="Metrics" hint="Free-form key/value pairs, e.g. 'avg response time' → '~3s'.">
              <KeyValueEditor value={d.metrics || {}} onChange={(v) => set("metrics", v)} keyLabel="metric" valLabel="value" />
            </Field>
            <Field label="Links" hint="Free-form key/value pairs, e.g. 'github' → 'https://…', 'demo' → 'Coming Soon'.">
              <KeyValueEditor value={d.links || {}} onChange={(v) => set("links", v)} keyLabel="label" valLabel="url" />
            </Field>
          </>
        )}
      />
    </div>
  );
}

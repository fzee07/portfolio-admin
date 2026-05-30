import { useSingleton } from "../lib/useResource";
import CollectionEditor from "../components/CollectionEditor";
import { Field, TextInput, TextArea, Panel, StringList, SaveBar, ErrorBanner } from "../components/ui";

const META_FALLBACK = { totalYears: "", experienceSummary: "", projectCategories: [] };

function MetaPanel() {
  const r = useSingleton("meta", META_FALLBACK);
  const d = r.draft;
  if (r.loading) return null;
  return (
    <>
      <ErrorBanner>{r.error}</ErrorBanner>
      <Panel title="Section summary">
        <div className="grid-2" style={{ gridTemplateColumns: "160px 1fr" }}>
          <Field label="Total years"><TextInput value={d.totalYears} onChange={(v) => r.setField("totalYears", v)} /></Field>
          <Field label="Summary"><TextArea rows={3} value={d.experienceSummary} onChange={(v) => r.setField("experienceSummary", v)} /></Field>
        </div>
        <SaveBar dirty={r.dirty} saving={r.saving} onSave={r.save} onReset={r.reset} />
      </Panel>
    </>
  );
}

const blank = () => ({
  company: "", location: "", role: "", duration: "", type: "Full-time",
  description: "", responsibilities: [], achievements: [], technologies: [],
});

export default function Experience() {
  return (
    <div>
      <MetaPanel />
      <CollectionEditor
        name="experience"
        intro={{ title: "Experience", text: "Your work history. Each entry maps to one role." }}
        titleOf={(e) => e.role || e.company || "Untitled role"}
        subOf={(e) => e.company}
        tagOf={(e) => e.duration}
        blank={blank}
        renderForm={(d, set) => (
          <>
            <div className="grid-2">
              <Field label="Company"><TextInput value={d.company} onChange={(v) => set("company", v)} /></Field>
              <Field label="Role"><TextInput value={d.role} onChange={(v) => set("role", v)} /></Field>
              <Field label="Location"><TextInput value={d.location} onChange={(v) => set("location", v)} /></Field>
              <Field label="Duration"><TextInput value={d.duration} onChange={(v) => set("duration", v)} /></Field>
              <Field label="Type"><TextInput value={d.type} onChange={(v) => set("type", v)} /></Field>
            </div>
            <Field label="Description"><TextArea rows={3} value={d.description} onChange={(v) => set("description", v)} /></Field>
            <Field label="Responsibilities">
              <StringList items={d.responsibilities || []} onChange={(v) => set("responsibilities", v)} placeholder="A responsibility…" />
            </Field>
            <Field label="Achievements">
              <StringList items={d.achievements || []} onChange={(v) => set("achievements", v)} placeholder="An achievement…" />
            </Field>
            <Field label="Technologies">
              <StringList items={d.technologies || []} onChange={(v) => set("technologies", v)} placeholder="e.g. Node.js" />
            </Field>
          </>
        )}
      />
    </div>
  );
}

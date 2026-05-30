import CollectionEditor from "../components/CollectionEditor";
import { Field, TextInput, TextArea, StringList } from "../components/ui";

const eduBlank = () => ({
  institution: "", degree: "", field: "", duration: "", location: "", grade: "",
  highlights: [], coursework: [],
});

const certBlank = () => ({ name: "", issuer: "", date: "", credentialId: "", url: "" });

export default function Education() {
  return (
    <div>
      <CollectionEditor
        name="education"
        intro={{ title: "Education", text: "Degrees and academic background." }}
        titleOf={(e) => e.degree || e.institution || "Untitled"}
        subOf={(e) => e.institution}
        tagOf={(e) => e.duration}
        blank={eduBlank}
        renderForm={(d, set) => (
          <>
            <div className="grid-2">
              <Field label="Institution"><TextInput value={d.institution} onChange={(v) => set("institution", v)} /></Field>
              <Field label="Degree"><TextInput value={d.degree} onChange={(v) => set("degree", v)} /></Field>
              <Field label="Field"><TextInput value={d.field} onChange={(v) => set("field", v)} /></Field>
              <Field label="Duration"><TextInput value={d.duration} onChange={(v) => set("duration", v)} /></Field>
              <Field label="Location"><TextInput value={d.location} onChange={(v) => set("location", v)} /></Field>
              <Field label="Grade"><TextInput value={d.grade} onChange={(v) => set("grade", v)} /></Field>
            </div>
            <Field label="Highlights">
              <StringList items={d.highlights || []} onChange={(v) => set("highlights", v)} placeholder="A highlight…" />
            </Field>
            <Field label="Coursework">
              <StringList items={d.coursework || []} onChange={(v) => set("coursework", v)} placeholder="A course…" />
            </Field>
          </>
        )}
      />

      <div style={{ height: 12 }} />

      <CollectionEditor
        name="certifications"
        intro={{ title: "Certifications", text: "Professional certifications and credentials." }}
        titleOf={(c) => c.name || "Untitled certification"}
        subOf={(c) => c.issuer}
        tagOf={(c) => c.date}
        blank={certBlank}
        renderForm={(d, set) => (
          <>
            <div className="grid-2">
              <Field label="Name"><TextInput value={d.name} onChange={(v) => set("name", v)} /></Field>
              <Field label="Issuer"><TextInput value={d.issuer} onChange={(v) => set("issuer", v)} /></Field>
              <Field label="Date"><TextInput value={d.date} onChange={(v) => set("date", v)} /></Field>
              <Field label="Credential ID"><TextInput value={d.credentialId} onChange={(v) => set("credentialId", v)} /></Field>
            </div>
            <Field label="URL"><TextInput value={d.url} onChange={(v) => set("url", v)} /></Field>
          </>
        )}
      />
    </div>
  );
}

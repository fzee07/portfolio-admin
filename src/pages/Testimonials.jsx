import CollectionEditor from "../components/CollectionEditor";
import { Field, TextInput, TextArea, ImageUpload } from "../components/ui";

const blank = () => ({
  name: "", designation: "", company: "", profileImage: "", linkedinUrl: "",
  quote: "", relationship: "", date: "",
});

export default function Testimonials() {
  return (
    <CollectionEditor
      name="testimonials"
      intro={{ title: "Testimonials", text: "What colleagues and clients say." }}
      titleOf={(t) => t.name || "Untitled"}
      subOf={(t) => [t.designation, t.company].filter(Boolean).join(" · ")}
      tagOf={(t) => t.date}
      blank={blank}
      renderForm={(d, set) => (
        <>
          <div className="grid-2">
            <Field label="Name"><TextInput value={d.name} onChange={(v) => set("name", v)} /></Field>
            <Field label="Designation"><TextInput value={d.designation} onChange={(v) => set("designation", v)} /></Field>
            <Field label="Company"><TextInput value={d.company} onChange={(v) => set("company", v)} /></Field>
            <Field label="Relationship"><TextInput value={d.relationship} onChange={(v) => set("relationship", v)} /></Field>
            <Field label="Date"><TextInput value={d.date} onChange={(v) => set("date", v)} /></Field>
            <Field label="LinkedIn URL"><TextInput value={d.linkedinUrl} onChange={(v) => set("linkedinUrl", v)} /></Field>
          </div>
          <Field label="Profile image" hint="Uploaded to your database (max 4MB).">
            <ImageUpload value={d.profileImage} onChange={(v) => set("profileImage", v)} rounded />
          </Field>
          <Field label="Quote"><TextArea rows={6} value={d.quote} onChange={(v) => set("quote", v)} /></Field>
        </>
      )}
    />
  );
}

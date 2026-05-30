import { useSingleton } from "../lib/useResource";
import { Field, TextInput, TextArea, Panel, StringList, Repeater, SaveBar, ErrorBanner, ImageUpload } from "../components/ui";

const FALLBACK = {
  name: "", title: "", tagline: "", bio: "", shortBio: "", image: "",
  stats: [], socialLinks: { linkedin: "", github: "", email: "", phone: "" }, highlights: [],
};

export default function Profile() {
  const r = useSingleton("profile", FALLBACK);
  const d = r.draft;
  if (r.loading) return <div className="loading">Loading…</div>;

  const setSocial = (k, v) => r.setField("socialLinks", { ...(d.socialLinks || {}), [k]: v });

  return (
    <div>
      <div className="page-intro">
        <span className="eyebrow">profile</span>
        <h2 style={{ margin: "6px 0 0", fontSize: 22 }}>Profile</h2>
        <p>Your headline identity — name, bio, hero stats and social links.</p>
      </div>

      <ErrorBanner>{r.error}</ErrorBanner>

      <Panel title="Identity">
        <div className="grid-2">
          <Field label="Name"><TextInput value={d.name} onChange={(v) => r.setField("name", v)} /></Field>
          <Field label="Title"><TextInput value={d.title} onChange={(v) => r.setField("title", v)} /></Field>
        </div>
        <Field label="Tagline"><TextInput value={d.tagline} onChange={(v) => r.setField("tagline", v)} /></Field>
        <Field label="Bio"><TextArea rows={5} value={d.bio} onChange={(v) => r.setField("bio", v)} /></Field>
        <Field label="Short bio"><TextArea rows={3} value={d.shortBio} onChange={(v) => r.setField("shortBio", v)} /></Field>
      </Panel>

      <Panel title="Hero photo">
        <Field label="Photo" hint="Your hero avatar (max 4MB). Uploaded to your database; replaces the default image.">
          <ImageUpload value={d.image} onChange={(v) => r.setField("image", v)} rounded />
        </Field>
      </Panel>

      <Panel title="Hero stats">
        <Repeater
          items={d.stats || []}
          onChange={(v) => r.setField("stats", v)}
          blank={() => ({ label: "", value: "" })}
          titleOf={(s) => s.label || "New stat"}
          addLabel="+ Add stat"
          render={(s, set) => (
            <div className="grid-2">
              <Field label="Label"><TextInput value={s.label} onChange={(v) => set({ ...s, label: v })} /></Field>
              <Field label="Value"><TextInput value={s.value} onChange={(v) => set({ ...s, value: v })} /></Field>
            </div>
          )}
        />
      </Panel>

      <Panel title="Social links">
        <div className="grid-2">
          <Field label="LinkedIn"><TextInput value={d.socialLinks?.linkedin} onChange={(v) => setSocial("linkedin", v)} /></Field>
          <Field label="GitHub"><TextInput value={d.socialLinks?.github} onChange={(v) => setSocial("github", v)} /></Field>
          <Field label="Email"><TextInput value={d.socialLinks?.email} onChange={(v) => setSocial("email", v)} /></Field>
          <Field label="Phone"><TextInput value={d.socialLinks?.phone} onChange={(v) => setSocial("phone", v)} /></Field>
        </div>
      </Panel>

      <Panel title="Highlights">
        <StringList items={d.highlights || []} onChange={(v) => r.setField("highlights", v)} placeholder="A capability or strength…" />
      </Panel>

      <SaveBar dirty={r.dirty} saving={r.saving} onSave={r.save} onReset={r.reset} />
    </div>
  );
}

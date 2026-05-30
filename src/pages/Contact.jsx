import { useSingleton } from "../lib/useResource";
import { Field, TextInput, Panel, StringList, SaveBar, ErrorBanner } from "../components/ui";

const FALLBACK = {
  email: "", phone: "",
  location: { city: "", state: "", country: "" },
  availability: { status: "", preferredRoles: [], workTypes: [], noticePeriod: "" },
  socialLinks: { linkedin: "", github: "", portfolio: "" },
  contactFormEndpoint: null,
};

export default function Contact() {
  const r = useSingleton("contact", FALLBACK);
  const d = r.draft;
  if (r.loading) return <div className="loading">Loading…</div>;

  const setLoc = (k, v) => r.setField("location", { ...(d.location || {}), [k]: v });
  const setAvail = (k, v) => r.setField("availability", { ...(d.availability || {}), [k]: v });
  const setSocial = (k, v) => r.setField("socialLinks", { ...(d.socialLinks || {}), [k]: v });

  return (
    <div>
      <div className="page-intro">
        <span className="eyebrow">contact</span>
        <h2 style={{ margin: "6px 0 0", fontSize: 22 }}>Contact</h2>
        <p>How people reach you and what you're open to.</p>
      </div>

      <ErrorBanner>{r.error}</ErrorBanner>

      <Panel title="Reach">
        <div className="grid-2">
          <Field label="Email"><TextInput value={d.email} onChange={(v) => r.setField("email", v)} /></Field>
          <Field label="Phone"><TextInput value={d.phone} onChange={(v) => r.setField("phone", v)} /></Field>
        </div>
      </Panel>

      <Panel title="Location">
        <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <Field label="City"><TextInput value={d.location?.city} onChange={(v) => setLoc("city", v)} /></Field>
          <Field label="State"><TextInput value={d.location?.state} onChange={(v) => setLoc("state", v)} /></Field>
          <Field label="Country"><TextInput value={d.location?.country} onChange={(v) => setLoc("country", v)} /></Field>
        </div>
      </Panel>

      <Panel title="Availability">
        <div className="grid-2">
          <Field label="Status"><TextInput value={d.availability?.status} onChange={(v) => setAvail("status", v)} /></Field>
          <Field label="Notice period"><TextInput value={d.availability?.noticePeriod} onChange={(v) => setAvail("noticePeriod", v)} /></Field>
        </div>
        <Field label="Preferred roles">
          <StringList items={d.availability?.preferredRoles || []} onChange={(v) => setAvail("preferredRoles", v)} placeholder="e.g. Backend Developer" />
        </Field>
        <Field label="Work types">
          <StringList items={d.availability?.workTypes || []} onChange={(v) => setAvail("workTypes", v)} placeholder="e.g. Remote" />
        </Field>
      </Panel>

      <Panel title="Links">
        <div className="grid-2" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
          <Field label="LinkedIn"><TextInput value={d.socialLinks?.linkedin} onChange={(v) => setSocial("linkedin", v)} /></Field>
          <Field label="GitHub"><TextInput value={d.socialLinks?.github} onChange={(v) => setSocial("github", v)} /></Field>
          <Field label="Portfolio"><TextInput value={d.socialLinks?.portfolio} onChange={(v) => setSocial("portfolio", v)} /></Field>
        </div>
        <Field label="Contact form endpoint" hint="URL your contact form POSTs to. Leave blank for none.">
          <TextInput value={d.contactFormEndpoint || ""} onChange={(v) => r.setField("contactFormEndpoint", v === "" ? null : v)} />
        </Field>
      </Panel>

      <SaveBar dirty={r.dirty} saving={r.saving} onSave={r.save} onReset={r.reset} />
    </div>
  );
}

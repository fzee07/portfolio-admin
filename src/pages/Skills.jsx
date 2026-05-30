import { useSingleton } from "../lib/useResource";
import { Field, TextInput, NumberInput, Panel, StringList, Repeater, SaveBar, ErrorBanner } from "../components/ui";

const FALLBACK = { categories: [], coreCompetencies: [] };

export default function Skills() {
  const r = useSingleton("skills", FALLBACK);
  const d = r.draft;
  if (r.loading) return <div className="loading">Loading…</div>;

  return (
    <div>
      <div className="page-intro">
        <span className="eyebrow">skills</span>
        <h2 style={{ margin: "6px 0 0", fontSize: 22 }}>Skills</h2>
        <p>Skill categories with proficiency levels, plus your core competencies. The <code>icon</code> matches a lucide icon name used by the frontend.</p>
      </div>

      <ErrorBanner>{r.error}</ErrorBanner>

      <Panel title="Categories">
        <Repeater
          items={d.categories || []}
          onChange={(v) => r.setField("categories", v)}
          blank={() => ({ name: "", icon: "", skills: [] })}
          titleOf={(c) => c.name || "New category"}
          addLabel="+ Add category"
          render={(cat, setCat) => (
            <>
              <div className="grid-2">
                <Field label="Category name"><TextInput value={cat.name} onChange={(v) => setCat({ ...cat, name: v })} /></Field>
                <Field label="Icon (lucide name)" ><TextInput value={cat.icon} onChange={(v) => setCat({ ...cat, icon: v })} /></Field>
              </div>
              <Field label="Skills">
                <Repeater
                  items={cat.skills || []}
                  onChange={(v) => setCat({ ...cat, skills: v })}
                  blank={() => ({ name: "", level: 50, yearsUsed: 1 })}
                  titleOf={(s) => s.name || "New skill"}
                  addLabel="+ Add skill"
                  render={(s, setS) => (
                    <div className="grid-2" style={{ gridTemplateColumns: "2fr 1fr 1fr" }}>
                      <Field label="Name"><TextInput value={s.name} onChange={(v) => setS({ ...s, name: v })} /></Field>
                      <Field label="Level (0–100)"><NumberInput value={s.level} onChange={(v) => setS({ ...s, level: v })} /></Field>
                      <Field label="Years used"><NumberInput step={0.1} value={s.yearsUsed} onChange={(v) => setS({ ...s, yearsUsed: v })} /></Field>
                    </div>
                  )}
                />
              </Field>
            </>
          )}
        />
      </Panel>

      <Panel title="Core competencies">
        <StringList items={d.coreCompetencies || []} onChange={(v) => r.setField("coreCompetencies", v)} placeholder="A core competency…" />
      </Panel>

      <SaveBar dirty={r.dirty} saving={r.saving} onSave={r.save} onReset={r.reset} />
    </div>
  );
}

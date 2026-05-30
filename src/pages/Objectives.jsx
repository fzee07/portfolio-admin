import { useSingleton } from "../lib/useResource";
import { Field, TextInput, TextArea, Panel, StringList, Repeater, SaveBar, ErrorBanner } from "../components/ui";

const FALLBACK = { careerObjective: "", goals: [], values: [] };

export default function Objectives() {
  const r = useSingleton("objectives", FALLBACK);
  const d = r.draft;
  if (r.loading) return <div className="loading">Loading…</div>;

  return (
    <div>
      <div className="page-intro">
        <span className="eyebrow">objectives</span>
        <h2 style={{ margin: "6px 0 0", fontSize: 22 }}>Objectives</h2>
        <p>Career objective statement, goals, and the values you work by.</p>
      </div>

      <ErrorBanner>{r.error}</ErrorBanner>

      <Panel title="Career objective">
        <Field><TextArea rows={6} value={d.careerObjective} onChange={(v) => r.setField("careerObjective", v)} /></Field>
      </Panel>

      <Panel title="Goals">
        <Repeater
          items={d.goals || []}
          onChange={(v) => r.setField("goals", v)}
          blank={() => ({ title: "", description: "" })}
          titleOf={(g) => g.title || "New goal"}
          addLabel="+ Add goal"
          render={(g, set) => (
            <>
              <Field label="Title"><TextInput value={g.title} onChange={(v) => set({ ...g, title: v })} /></Field>
              <Field label="Description"><TextArea rows={3} value={g.description} onChange={(v) => set({ ...g, description: v })} /></Field>
            </>
          )}
        />
      </Panel>

      <Panel title="Values">
        <StringList items={d.values || []} onChange={(v) => r.setField("values", v)} placeholder="A value or principle…" />
      </Panel>

      <SaveBar dirty={r.dirty} saving={r.saving} onSave={r.save} onReset={r.reset} />
    </div>
  );
}

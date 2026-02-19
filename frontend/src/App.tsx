import { FormEvent, useEffect, useMemo, useState } from 'react'

import ModelComparisonChart from './components/ModelComparisonChart'
import StatPill from './components/StatPill'
import {
  createExperiment,
  getAttempts,
  getExperiment,
  getRun,
  getRunSummary,
  launchRun,
  listExperiments,
} from './lib/api'
import type { Attempt, Experiment, ModelArm, Run, RunSummary, WorkloadType } from './lib/types'

interface CreateFormState {
  name: string
  workload_type: WorkloadType
  dataset_ref: string
  budget_usd: string
  max_tasks: number
  seed: number
  model_arms: ModelArm[]
}

const defaultForm: CreateFormState = {
  name: 'Phase1 Evaluation',
  workload_type: 'pr_review',
  dataset_ref: 'pr_review/v1.jsonl',
  budget_usd: '25.00',
  max_tasks: 3,
  seed: 42,
  model_arms: [
    {
      provider: 'openai',
      model_name: 'gpt-4o-mini',
      display_name: 'OpenAI GPT-4o-mini',
      config: { temperature: 0, input_cost_per_1k: 0.00015, output_cost_per_1k: 0.0006 },
    },
    {
      provider: 'anthropic',
      model_name: 'claude-3-5-haiku-latest',
      display_name: 'Anthropic Haiku',
      config: { temperature: 0, input_cost_per_1k: 0.00025, output_cost_per_1k: 0.00125 },
    },
  ],
}

export default function App() {
  const [experiments, setExperiments] = useState<Experiment[]>([])
  const [selectedExperimentId, setSelectedExperimentId] = useState<string | null>(null)
  const [selectedExperiment, setSelectedExperiment] = useState<Experiment | null>(null)
  const [run, setRun] = useState<Run | null>(null)
  const [summary, setSummary] = useState<RunSummary | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [form, setForm] = useState<CreateFormState>(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [launchSeed, setLaunchSeed] = useState<number>(42)
  const [launchThreshold, setLaunchThreshold] = useState<number>(0.5)

  async function refreshExperiments() {
    const rows = await listExperiments()
    setExperiments(rows)
    if (!selectedExperimentId && rows.length > 0) {
      setSelectedExperimentId(rows[0].id)
    }
  }

  useEffect(() => {
    void refreshExperiments().catch((err: Error) => setError(err.message))
  }, [])

  useEffect(() => {
    if (!selectedExperimentId) return

    setLoading(true)
    void getExperiment(selectedExperimentId)
      .then((row) => {
        setSelectedExperiment(row)
        setLaunchSeed(row.seed)
      })
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [selectedExperimentId])

  const topModel = useMemo(() => summary?.models?.[0], [summary])

  async function onCreateExperiment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const payload = {
        name: form.name,
        workload_type: form.workload_type,
        dataset_ref: form.dataset_ref,
        budget_usd: form.budget_usd,
        sampling: { max_tasks: form.max_tasks },
        seed: form.seed,
        model_arms: form.model_arms,
      }
      const created = await createExperiment(payload)
      await refreshExperiments()
      setSelectedExperimentId(created.id)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function onLaunchRun() {
    if (!selectedExperiment) return
    setLoading(true)
    setError(null)

    try {
      const launched = await launchRun(selectedExperiment.id, {
        seed: launchSeed,
        failure_threshold: launchThreshold,
      })
      const runDetails = await getRun(launched.id)
      const summaryResponse = await getRunSummary(launched.id)
      const attemptRows = await getAttempts(launched.id)
      setRun(runDetails)
      setSummary(summaryResponse.summary)
      setAttempts(attemptRows)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  function updateArm(index: number, field: 'provider' | 'model_name' | 'display_name', value: string) {
    setForm((prev) => {
      const nextArms = [...prev.model_arms]
      const parsedValue = field === 'provider' ? (value as ModelArm['provider']) : value
      nextArms[index] = {
        ...nextArms[index],
        [field]: parsedValue,
      }
      return {
        ...prev,
        model_arms: nextArms,
      }
    })
  }

  return (
    <div className="page">
      <div className="backdrop" />
      <header className="hero">
        <p className="kicker">Engineering Model Evaluation Platform</p>
        <h1>Measure Models. Don't Guess.</h1>
        <p className="subtitle">
          Create reproducible experiments, run synchronous evaluations, and compare quality, latency, and
          cost across providers.
        </p>
      </header>

      <main className="layout">
        <section className="panel appear-1">
          <h2>Create Experiment</h2>
          <form onSubmit={onCreateExperiment} className="form-grid">
            <label>
              Name
              <input
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </label>

            <label>
              Workload
              <select
                value={form.workload_type}
                onChange={(event) => {
                  const workload = event.target.value as WorkloadType
                  setForm((prev) => ({
                    ...prev,
                    workload_type: workload,
                    dataset_ref: workload === 'pr_review' ? 'pr_review/v1.jsonl' : 'ci_triage/v1.jsonl',
                  }))
                }}
              >
                <option value="pr_review">pr_review</option>
                <option value="ci_triage">ci_triage</option>
              </select>
            </label>

            <label>
              Dataset
              <input
                value={form.dataset_ref}
                onChange={(event) => setForm((prev) => ({ ...prev, dataset_ref: event.target.value }))}
              />
            </label>

            <label>
              Budget (USD)
              <input
                value={form.budget_usd}
                onChange={(event) => setForm((prev) => ({ ...prev, budget_usd: event.target.value }))}
              />
            </label>

            <label>
              Max Tasks
              <input
                type="number"
                min={1}
                value={form.max_tasks}
                onChange={(event) => setForm((prev) => ({ ...prev, max_tasks: Number(event.target.value) }))}
              />
            </label>

            <label>
              Seed
              <input
                type="number"
                value={form.seed}
                onChange={(event) => setForm((prev) => ({ ...prev, seed: Number(event.target.value) }))}
              />
            </label>

            {form.model_arms.map((arm, index) => (
              <div key={index} className="arm-row">
                <h4>Model Arm {index + 1}</h4>
                <label>
                  Provider
                  <select value={arm.provider} onChange={(event) => updateArm(index, 'provider', event.target.value)}>
                    <option value="openai">openai</option>
                    <option value="anthropic">anthropic</option>
                    <option value="mock">mock</option>
                  </select>
                </label>
                <label>
                  Model Name
                  <input value={arm.model_name} onChange={(event) => updateArm(index, 'model_name', event.target.value)} />
                </label>
                <label>
                  Display Name
                  <input
                    value={arm.display_name}
                    onChange={(event) => updateArm(index, 'display_name', event.target.value)}
                  />
                </label>
              </div>
            ))}

            <button type="submit" disabled={loading}>
              {loading ? 'Working...' : 'Create Experiment'}
            </button>
          </form>
        </section>

        <section className="panel appear-2">
          <h2>Experiments</h2>
          <div className="experiment-list">
            {experiments.map((experiment) => (
              <button
                key={experiment.id}
                className={experiment.id === selectedExperimentId ? 'experiment-item active' : 'experiment-item'}
                onClick={() => setSelectedExperimentId(experiment.id)}
              >
                <strong>{experiment.name}</strong>
                <span>{experiment.workload_type}</span>
              </button>
            ))}
          </div>

          {selectedExperiment && (
            <div className="detail-card">
              <h3>{selectedExperiment.name}</h3>
              <p>Dataset: {selectedExperiment.dataset_ref}</p>
              <p>Budget: ${selectedExperiment.budget_usd}</p>
              <p>Seed: {selectedExperiment.seed}</p>

              <div className="arms-mini">
                {selectedExperiment.model_arms.map((arm) => (
                  <div key={arm.id}>
                    <span>{arm.provider}</span>
                    <strong>{arm.display_name}</strong>
                  </div>
                ))}
              </div>

              <div className="launch-controls">
                <label>
                  Run Seed
                  <input type="number" value={launchSeed} onChange={(event) => setLaunchSeed(Number(event.target.value))} />
                </label>
                <label>
                  Failure Threshold
                  <input
                    type="number"
                    min={0}
                    max={1}
                    step={0.05}
                    value={launchThreshold}
                    onChange={(event) => setLaunchThreshold(Number(event.target.value))}
                  />
                </label>
              </div>

              <button onClick={onLaunchRun} disabled={loading}>
                {loading ? 'Running...' : 'Launch Run'}
              </button>
            </div>
          )}
        </section>

        <section className="panel appear-3">
          <h2>Run Detail</h2>
          {run ? (
            <>
              <div className="stats-row">
                <StatPill label="Run Status" value={run.status} />
                <StatPill label="Run ID" value={run.id.slice(0, 8)} />
                <StatPill label="Attempts" value={String(summary?.total_attempts ?? 0)} />
                <StatPill label="Top Model" value={topModel?.display_name ?? 'n/a'} />
              </div>

              <ModelComparisonChart rows={summary?.models ?? []} />

              <div className="card table-card">
                <h3>Model Comparison</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Model</th>
                      <th>Quality</th>
                      <th>Pass Rate</th>
                      <th>P50 / P95</th>
                      <th>Total Cost</th>
                      <th>Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary?.models ?? []).map((row) => (
                      <tr key={row.model_arm_id}>
                        <td>{row.display_name}</td>
                        <td>{row.quality_avg.toFixed(3)}</td>
                        <td>{(row.pass_rate * 100).toFixed(1)}%</td>
                        <td>
                          {row.latency_p50_ms.toFixed(0)} / {row.latency_p95_ms.toFixed(0)} ms
                        </td>
                        <td>${row.total_cost_usd.toFixed(6)}</td>
                        <td>{row.error_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="card">
                <h3>Attempts ({attempts.length})</h3>
                <div className="attempt-feed">
                  {attempts.map((attempt) => (
                    <article key={attempt.id}>
                      <header>
                        <strong>{attempt.model_arm_id.slice(0, 8)}</strong>
                        <span>
                          {attempt.latency_ms} ms · ${Number(attempt.cost_usd).toFixed(6)}
                        </span>
                      </header>
                      <p>{attempt.raw_output?.slice(0, 220) || attempt.error_message || 'No output'}</p>
                    </article>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="card">Launch a run to see detailed model comparison.</div>
          )}
        </section>
      </main>

      {error && <aside className="error-banner">{error}</aside>}
    </div>
  )
}

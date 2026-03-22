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

// New Dashboard Imports
import { Router } from './components/SimpleRouter'
import Dashboard1 from './pages/Dashboard1'
import Dashboard2 from './pages/Dashboard2'
import Dashboard3 from './pages/Dashboard3'
import Dashboard4 from './pages/Dashboard4'
import Dashboard5 from './pages/Dashboard5'
import InsightsDashboard from './pages/InsightsDashboard'
import UiKit from './pages/UiKit'
import Home1 from './pages/Home1'
import Home5 from './pages/Home5'
import HomeVariation1 from './pages/HomeVariation1'
import HomeVariation2 from './pages/HomeVariation2'
import HomeVariation3 from './pages/HomeVariation3'
import HomeVariation4 from './pages/HomeVariation4'
import HomeVariation5 from './pages/HomeVariation5'

interface CreateFormState {
  name: string
  workload_type: WorkloadType
  dataset_ref: string
  repo_ref: string
  budget_usd: string
  max_tasks: number
  sample_percent: number
  lookback_limit: number
  runner_backend: 'local' | 'podman'
  runtime_profile: 'python' | 'node' | 'dotnet' | 'java' | 'polyglot'
  container_image: string
  setup_commands: string
  validation_commands: string
  seed: number
  model_arms: ModelArm[]
}

const defaultForm: CreateFormState = {
  name: 'Phase1 Evaluation',
  workload_type: 'pr_review',
  dataset_ref: 'pr_review/v1.jsonl',
  repo_ref: '',
  budget_usd: '25.00',
  max_tasks: 3,
  sample_percent: 10,
  lookback_limit: 20,
  runner_backend: 'podman',
  runtime_profile: 'python',
  container_image: '',
  setup_commands: '',
  validation_commands: '',
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

function LegacyDashboard() {
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
  const leaderboardGroups = summary?.leaderboards
    ? [
        ['Correctness', summary.leaderboards.correctness],
        ['Evaluator', summary.leaderboards.evaluator_score],
        ['Speed', summary.leaderboards.speed],
        ['Cost', summary.leaderboards.cost],
      ] as const
    : []

  async function onCreateExperiment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const isGithubShadow = form.workload_type === 'github_pr_shadow'
      const payload = {
        name: form.name,
        workload_type: form.workload_type,
        dataset_ref: isGithubShadow ? `github://${form.repo_ref.trim()}` : form.dataset_ref,
        budget_usd: form.budget_usd,
        sampling: {
          max_tasks: form.max_tasks,
          ...(isGithubShadow
            ? {
                sample_percent: form.sample_percent,
                lookback_limit: form.lookback_limit,
                runner_backend: form.runner_backend,
                runtime_profile: form.runtime_profile,
                ...(form.container_image.trim() ? { container_image: form.container_image.trim() } : {}),
                setup_commands: form.setup_commands
                  .split('\n')
                  .map((row) => row.trim())
                  .filter(Boolean),
                validation_commands: form.validation_commands
                  .split('\n')
                  .map((row) => row.trim())
                  .filter(Boolean),
              }
            : {}),
        },
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
                    dataset_ref:
                      workload === 'pr_review'
                        ? 'pr_review/v1.jsonl'
                        : workload === 'ci_triage'
                          ? 'ci_triage/v1.jsonl'
                          : prev.dataset_ref,
                  }))
                }}
              >
                <option value="pr_review">pr_review</option>
                <option value="ci_triage">ci_triage</option>
                <option value="github_pr_shadow">github_pr_shadow</option>
              </select>
            </label>

            {form.workload_type === 'github_pr_shadow' ? (
              <>
                <label>
                  GitHub Repo
                  <input
                    placeholder="owner/repo"
                    value={form.repo_ref}
                    onChange={(event) => setForm((prev) => ({ ...prev, repo_ref: event.target.value }))}
                  />
                </label>

                <label>
                  Sample Percent
                  <input
                    type="number"
                    min={1}
                    max={100}
                    value={form.sample_percent}
                    onChange={(event) => setForm((prev) => ({ ...prev, sample_percent: Number(event.target.value) }))}
                  />
                </label>

                <label>
                  Lookback PRs
                  <input
                    type="number"
                    min={1}
                    value={form.lookback_limit}
                    onChange={(event) => setForm((prev) => ({ ...prev, lookback_limit: Number(event.target.value) }))}
                  />
                </label>

                <label>
                  Runner Backend
                  <select
                    value={form.runner_backend}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        runner_backend: event.target.value as CreateFormState['runner_backend'],
                      }))
                    }
                  >
                    <option value="podman">podman</option>
                    <option value="local">local</option>
                  </select>
                </label>

                <label>
                  Runtime Profile
                  <select
                    value={form.runtime_profile}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        runtime_profile: event.target.value as CreateFormState['runtime_profile'],
                      }))
                    }
                  >
                    <option value="python">python</option>
                    <option value="node">node</option>
                    <option value="dotnet">dotnet</option>
                    <option value="java">java</option>
                    <option value="polyglot">polyglot</option>
                  </select>
                </label>

                <label>
                  Container Image
                  <input
                    placeholder="optional override, e.g. python:3.11-slim"
                    value={form.container_image}
                    onChange={(event) => setForm((prev) => ({ ...prev, container_image: event.target.value }))}
                  />
                </label>

                <label className="full-span">
                  Setup Commands
                  <textarea
                    rows={4}
                    placeholder={'pip install -r requirements.txt\nnpm ci'}
                    value={form.setup_commands}
                    onChange={(event) => setForm((prev) => ({ ...prev, setup_commands: event.target.value }))}
                  />
                </label>

                <label className="full-span">
                  Validation Commands
                  <textarea
                    rows={4}
                    placeholder={'python -m pytest tests/unit\nnpm test'}
                    value={form.validation_commands}
                    onChange={(event) => setForm((prev) => ({ ...prev, validation_commands: event.target.value }))}
                  />
                </label>
              </>
            ) : (
              <label>
                Dataset
                <input
                  value={form.dataset_ref}
                  onChange={(event) => setForm((prev) => ({ ...prev, dataset_ref: event.target.value }))}
                />
              </label>
            )}

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
                    <option value="azure_openai">azure_openai</option>
                    <option value="openrouter">openrouter</option>
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
              {selectedExperiment.workload_type === 'github_pr_shadow' && (
                <>
                  <p>Sample: {selectedExperiment.sampling.sample_percent ?? 100}%</p>
                  <p>Lookback: {selectedExperiment.sampling.lookback_limit ?? 20} merged PRs</p>
                  <p>Runner: {selectedExperiment.sampling.runner_backend ?? 'local'}</p>
                  <p>Profile: {selectedExperiment.sampling.runtime_profile ?? 'auto'}</p>
                  {selectedExperiment.sampling.container_image && (
                    <p>Image: {selectedExperiment.sampling.container_image}</p>
                  )}
                </>
              )}

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
                      <th>Correctness</th>
                      <th>Evaluator</th>
                      <th>Pass Rate</th>
                      <th>P50 / P95</th>
                      <th>Total Cost</th>
                      <th>Risk</th>
                      <th>Errors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(summary?.models ?? []).map((row) => (
                      <tr key={row.model_arm_id}>
                        <td>{row.display_name}</td>
                        <td>{row.quality_avg.toFixed(3)}</td>
                        <td>{row.correctness_avg.toFixed(3)}</td>
                        <td>{row.evaluator_score_avg.toFixed(3)}</td>
                        <td>{(row.pass_rate * 100).toFixed(1)}%</td>
                        <td>
                          {row.latency_p50_ms.toFixed(0)} / {row.latency_p95_ms.toFixed(0)} ms
                        </td>
                        <td>${row.total_cost_usd.toFixed(6)}</td>
                        <td>{row.risk_avg.toFixed(3)}</td>
                        <td>{row.error_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {leaderboardGroups.length > 0 && (
                <div className="card table-card">
                  <h3>Leaderboards</h3>
                  <div className="attempt-feed">
                    {leaderboardGroups.map(([label, rows]) => (
                      <article key={label}>
                        <header>
                          <strong>{label}</strong>
                          <span>{rows[0]?.display_name ?? 'n/a'}</span>
                        </header>
                        <p>
                          {rows
                            .map((row) => `${row.display_name} (${row.value.toFixed(3)})`)
                            .join(' · ')}
                        </p>
                      </article>
                    ))}
                  </div>
                </div>
              )}

              {summary?.tasks && summary.tasks.length > 0 && (
                <div className="card">
                  <h3>Sampled Pull Requests</h3>
                  <div className="attempt-feed">
                    {summary.tasks.map((task) => (
                      <article key={task.task_instance_id}>
                        <header>
                          <strong>
                            {task.repo_ref ? `${task.repo_ref}#${task.pr_number}` : task.dataset_item_id}
                          </strong>
                          <span>{task.title ?? 'Untitled task'}</span>
                        </header>
                        <p>{task.html_url ?? 'No URL captured'}</p>
                      </article>
                    ))}
                  </div>
                </div>
              )}

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

export default function App() {
  return (
    <Router 
      routes={{
        '/': <LegacyDashboard />,
        '/1': <Dashboard1 />,
        '/2': <Dashboard2 />,
        '/3': <Dashboard3 />,
        '/4': <Dashboard4 />,
        '/5': <Dashboard5 />,
        '/6': <UiKit />,
        '/7': <InsightsDashboard />,
        '/home1': <Home1 />,
        '/home5': <Home5 />,
        '/home-v1': <HomeVariation1 />,
        '/home-v2': <HomeVariation2 />,
        '/home-v3': <HomeVariation3 />,
        '/home-v4': <HomeVariation4 />,
        '/home-v5': <HomeVariation5 />,
      }} 
    />
  )
}

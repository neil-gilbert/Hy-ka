export type ProviderType = 'openai' | 'anthropic' | 'mock'
export type WorkloadType = 'pr_review' | 'ci_triage'

export interface ModelArm {
  id?: string
  provider: ProviderType
  model_name: string
  display_name: string
  config: Record<string, unknown>
}

export interface Experiment {
  id: string
  organization_id: string
  name: string
  workload_type: WorkloadType
  dataset_ref: string
  dataset_hash: string | null
  sampling: { max_tasks: number }
  budget_usd: string
  seed: number
  model_arms: ModelArm[]
  created_at: string
  updated_at?: string
}

export type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed'

export interface Run {
  id: string
  experiment_id: string
  status: RunStatus
  seed: number
  failure_threshold: number
  correlation_id: string
  error_message: string | null
  created_at: string
  started_at: string | null
  completed_at: string | null
}

export interface Attempt {
  id: string
  run_id: string
  task_instance_id: string
  model_arm_id: string
  raw_output: string | null
  usage_prompt_tokens: number
  usage_completion_tokens: number
  usage_total_tokens: number
  latency_ms: number
  cost_usd: string
  error_message: string | null
  created_at: string
}

export interface SummaryModel {
  model_arm_id: string
  display_name: string
  provider: string
  model_name: string
  quality_avg: number
  pass_rate: number
  attempt_count: number
  error_count: number
  latency_p50_ms: number
  latency_p95_ms: number
  total_cost_usd: number
}

export interface RunSummary {
  run_id: string
  models: SummaryModel[]
  failure_ratio: number
  failure_threshold: number
  total_attempts: number
  total_errors: number
}

import type { Attempt, Experiment, Run, RunSummary } from './types'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`${response.status} ${text}`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export function listExperiments() {
  return request<Experiment[]>('/experiments')
}

export function getExperiment(id: string) {
  return request<Experiment>(`/experiments/${id}`)
}

export function createExperiment(payload: unknown) {
  return request<Experiment>('/experiments', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function launchRun(experimentId: string, payload: { seed?: number; failure_threshold: number }) {
  return request<Run>(`/experiments/${experimentId}/runs`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getRun(runId: string) {
  return request<Run>(`/runs/${runId}`)
}

export function getRunSummary(runId: string) {
  return request<{ run_id: string; status: string; summary: RunSummary | null }>(`/runs/${runId}/summary`)
}

export function getAttempts(runId: string) {
  return request<Attempt[]>(`/runs/${runId}/attempts`)
}

import type { Pipeline } from './pipeline'
import type { Settings } from './storage'
import type { ComposerState } from '../components/EmailComposer'

// --- Types ---
export type JobDescription = {
  id: string;
  title: string;
  description: string;
};

// --- Helper ---
function getBackendUrl() {
  // In a real extension, this might be configurable. For now, we hardcode it.
  return "https://bb62135fa08b.ngrok-free.app";
}

// --- Job Description API ---
export async function fetchJDs(): Promise<JobDescription[]> {
  const url = getBackendUrl()
  const res = await fetch(`${url}/job-descriptions`, {
    headers: { "ngrok-skip-browser-warning": "any" }
  })
  if (!res.ok) throw new Error('Failed to fetch Job Descriptions')
  return res.json()
}

export async function saveJD(jd: Omit<JobDescription, 'id'> & { id?: string }): Promise<JobDescription> {
  const url = getBackendUrl()
  const endpoint = jd.id ? `${url}/job-descriptions/${jd.id}` : `${url}/job-descriptions`
  const method = jd.id ? 'PUT' : 'POST'
  
  const res = await fetch(endpoint, {
    method,
    headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "any" },
    body: JSON.stringify(jd)
  })
  if (!res.ok) throw new Error('Failed to save Job Description')
  return res.json()
}

export async function deleteJD(id: string): Promise<void> {
  const url = getBackendUrl()
  const res = await fetch(`${url}/job-descriptions/${id}`, { 
    method: 'DELETE',
    headers: { "ngrok-skip-browser-warning": "any" }
  })
  if (!res.ok) throw new Error('Failed to delete Job Description')
}

// --- Pipeline API ---
export async function fetchPipeline(): Promise<Pipeline> {
  const url = getBackendUrl();
  const res = await fetch(`${url}/pipeline`, {
    headers: { "ngrok-skip-browser-warning": "any" }
  });
  if (!res.ok) throw new Error('Failed to fetch pipeline');
  return res.json();
}

export async function savePipeline(pipeline: Pipeline): Promise<Pipeline> {
  const url = getBackendUrl();
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "any" },
    body: JSON.stringify(pipeline)
  });
  if (!res.ok) throw new Error('Failed to save pipeline');
  return res.json();
}

// --- Composer API ---
export async function fetchComposerState(): Promise<ComposerState> {
  const url = getBackendUrl();
  const res = await fetch(`${url}/composer`, {
    headers: { "ngrok-skip-browser-warning": "any" }
  });
  if (!res.ok) throw new Error('Failed to fetch composer state');
  return res.json();
}

export async function saveComposerState(state: ComposerState): Promise<ComposerState> {
  const url = getBackendUrl();
  const res = await fetch(`${url}/composer`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', "ngrok-skip-browser-warning": "any" },
    body: JSON.stringify(state)
  });
  if (!res.ok) throw new Error('Failed to save composer state');
  return res.json();
}

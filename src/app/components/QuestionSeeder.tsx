import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  Database,
  Upload,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Info,
  ChevronDown,
  ChevronUp,
  Loader2,
  BarChart2,
  Trash2
} from 'lucide-react';

interface QuestionSeederProps {
  onBack?: () => void;
}

type SeedMode = 'upsert' | 'replace' | 'skip_existing';

interface StatusData {
  exists: boolean;
  total: number;
  groups: Record<string, number>;
  error?: string;
}

interface SeedResult {
  success: boolean;
  total_rows: number;
  inserted: number;
  skipped: number;
  mode: string;
  breakdown?: Record<string, number>;
  errors?: string[];
  error?: string;
}

const BASE_URL = `https://femvnconxoefpctiptkj.supabase.co/functions/v1/make-server-fc8eb847/admin`;
const SUPABASE_URL = `https://femvnconxoefpctiptkj.supabase.co`;
const SUPABASE_ANON_KEY = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZlbXZuY29ueG9lZnBjdGlwdGtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI0NTY1ODMsImV4cCI6MjA3ODAzMjU4M30.kmYrjWIfgzXZuLda3D8LjqL6V20DBgo8fkHsnIdQLGA`;

const QUESTION_SOURCES = [
  { label: 'Kolb Learning Styles (Likert)', framework: 'kolb', type: 'learning', format: 'likert', count: 100, ageGroup: 'general', color: '#5B7DB1' },
  { label: 'Sternberg Thinking Styles (Likert)', framework: 'sternberg', type: 'thinking', format: 'likert', count: 100, ageGroup: 'general', color: '#6B4C9A' },
  { label: 'Dual-Process Decision (Likert)', framework: 'dual-process', type: 'decision', format: 'likert', count: 100, ageGroup: 'general', color: '#1E8A6E' },
  { label: 'VARK Learning Styles (Multiple Choice)', framework: 'vark', type: 'learning', format: 'multiple-choice', count: 15, ageGroup: 'general', color: '#E0A020' },
  { label: 'Sternberg Thinking (Multiple Choice)', framework: 'sternberg-mc', type: 'thinking', format: 'multiple-choice', count: 15, ageGroup: 'general', color: '#DC2626' },
  { label: 'Decision Styles (Multiple Choice)', framework: 'vark-decision', type: 'decision', format: 'multiple-choice', count: 15, ageGroup: 'general', color: '#7C3AED' }
];

const TOTAL_QUESTIONS = QUESTION_SOURCES.reduce((s, src) => s + src.count, 0);

function getAdminToken(): string | null {
  return localStorage.getItem('admin_token');
}

function getAuthHeaders(): Record<string, string> {
  const token = getAdminToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'X-Admin-Token': token, 'Authorization': `Bearer ${token}` } : {})
  };
}

export const QuestionSeeder: React.FC<QuestionSeederProps> = ({ onBack }) => {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<SeedResult | null>(null);
  const [mode, setMode] = useState<SeedMode>('upsert');
  const [showGroups, setShowGroups] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    setLoadingStatus(true);
    try {
      const res = await fetch(
        `${SUPABASE_URL}/rest/v1/assessment_questions?select=assessment_type,framework,age_group,question_format&is_active=eq.true`,
        {
          headers: {
            'apikey': SUPABASE_ANON_KEY,
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            'Prefer': 'return=representation'
          }
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const rows: { assessment_type: string; framework: string; age_group: string; question_format: string }[] = await res.json();
      const groups: Record<string, number> = {};
      for (const row of rows) {
        const key = `${row.assessment_type}|${row.framework}|${row.age_group}|${row.question_format}`;
        groups[key] = (groups[key] ?? 0) + 1;
      }
      setStatus({ exists: rows.length > 0, total: rows.length, groups });
    } catch (err) {
      setStatus({ exists: false, total: 0, groups: {}, error: 'Could not reach Supabase' });
    } finally {
      setLoadingStatus(false);
    }
  };

  const runSeed = async () => {
    if (mode === 'replace' && !confirmReplace) {
      setConfirmReplace(true);
      return;
    }
    setSeeding(true);
    setSeedResult(null);
    setConfirmReplace(false);
    try {
      const res = await fetch(`${BASE_URL}/seed-questions`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ mode })
      });
      const data: SeedResult = await res.json();
      setSeedResult(data);
      if (data.success || data.inserted > 0) {
        await fetchStatus();
      }
    } catch (err: any) {
      setSeedResult({ success: false, total_rows: 0, inserted: 0, skipped: 0, mode, error: err.message });
    } finally {
      setSeeding(false);
    }
  };

  const formatGroupKey = (key: string) => {
    const [type, framework, ageGroup, format] = key.split('|');
    return `${type} · ${framework} · ${ageGroup} · ${format}`;
  };

  const getStatusForSource = (src: typeof QUESTION_SOURCES[0]) => {
    if (!status?.groups) return 0;
    const key = `${src.type}|${src.framework}|${src.ageGroup}|${src.format}`;
    return status.groups[key] ?? 0;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl mb-1 flex items-center gap-2">
            <Database className="w-6 h-6" style={{ color: '#5B7DB1' }} />
            Question Bank Seeder
          </h2>
          <p className="text-gray-600">Upload all {TOTAL_QUESTIONS} assessment questions to Supabase</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchStatus} disabled={loadingStatus}>
          {loadingStatus ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span className="ml-1.5">Refresh Status</span>
        </Button>
      </div>

      {/* Current DB status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BarChart2 className="w-4 h-4" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingStatus && !status ? (
            <div className="flex items-center gap-2 text-gray-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" /> Checking...
            </div>
          ) : status?.error && !status.exists ? (
            <div className="flex items-start gap-2 text-red-600 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p>Table not found or error: {status.error}</p>
                <p className="text-gray-500 mt-1">Run the migration SQL first, or the seed will attempt to create the table.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 flex-wrap">
                {status?.total && status.total > 0 ? (
                  <Badge className="bg-green-100 text-green-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {status.total.toLocaleString()} questions in Supabase
                  </Badge>
                ) : (
                  <Badge variant="secondary">Table empty — not seeded yet</Badge>
                )}
                {status?.total && status.total > 0 && (
                  <span className="text-sm text-gray-500">
                    {Math.round((status.total / TOTAL_QUESTIONS) * 100)}% of total question bank
                  </span>
                )}
              </div>

              {/* Per-source status */}
              <div className="space-y-2">
                {QUESTION_SOURCES.map((src, i) => {
                  const inDb = getStatusForSource(src);
                  const pct = Math.min(100, Math.round((inDb / src.count) * 100));
                  return (
                    <div key={i}>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>{src.label}</span>
                        <span>{inDb}/{src.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: src.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              {status?.groups && Object.keys(status.groups).length > 0 && (
                <button
                  onClick={() => setShowGroups(!showGroups)}
                  className="text-xs text-blue-600 flex items-center gap-1 mt-2"
                >
                  {showGroups ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  {showGroups ? 'Hide' : 'Show'} raw breakdown
                </button>
              )}

              {showGroups && status?.groups && (
                <div className="bg-gray-50 border rounded-lg p-3 text-xs space-y-1 max-h-48 overflow-y-auto">
                  {Object.entries(status.groups).map(([key, count]) => (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{formatGroupKey(key)}</span>
                      <span className="text-gray-900">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Question sources summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Questions to Upload</CardTitle>
          <CardDescription>All question banks compiled and ready for upload</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {QUESTION_SOURCES.map((src, i) => (
              <div key={i} className="flex items-start gap-3 p-3 border rounded-lg bg-white">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1.5" style={{ backgroundColor: src.color }} />
                <div className="flex-1">
                  <p className="text-sm text-gray-900">{src.label}</p>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{src.count} questions</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{src.type}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-600">{src.format}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-900">
              <strong>Total: {TOTAL_QUESTIONS} questions</strong> across {QUESTION_SOURCES.length} banks, 3 assessment types, 2 question formats.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Seed options */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upload Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-700 mb-3">Seed Mode</p>
            <div className="space-y-2">
              {([
                { value: 'upsert', label: 'Upsert (Recommended)', desc: 'Insert new questions; update existing ones by external_id. Safe to run multiple times.' },
                { value: 'skip_existing', label: 'Skip Existing', desc: 'Only insert questions that are not yet in the database. Never updates.' },
                { value: 'replace', label: 'Full Replace', desc: 'Delete ALL existing questions then re-insert everything. Use carefully.' }
              ] as { value: SeedMode; label: string; desc: string }[]).map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-start gap-3 p-3 border rounded-lg cursor-pointer transition-all ${mode === opt.value ? 'bg-purple-50 border-purple-300' : 'bg-white border-gray-200'}`}
                >
                  <input
                    type="radio"
                    name="mode"
                    value={opt.value}
                    checked={mode === opt.value}
                    onChange={() => { setMode(opt.value); setConfirmReplace(false); }}
                    className="mt-0.5"
                  />
                  <div>
                    <p className={`text-sm ${mode === opt.value ? 'text-purple-900' : 'text-gray-900'}`}>{opt.label}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{opt.desc}</p>
                  </div>
                  {opt.value === 'replace' && (
                    <Trash2 className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5 ml-auto" />
                  )}
                </label>
              ))}
            </div>
          </div>

          {mode === 'replace' && !confirmReplace && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-900">
                <strong>Warning:</strong> Replace mode will permanently delete all existing questions in Supabase before re-inserting. Click "Upload to Supabase" again to confirm.
              </p>
            </div>
          )}

          {confirmReplace && (
            <div className="flex items-start gap-2 p-3 bg-red-100 border-2 border-red-400 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-900">
                <strong>Confirm:</strong> Click "Upload to Supabase" one more time to delete all existing questions and re-seed.
              </p>
            </div>
          )}

          <Button
            onClick={runSeed}
            disabled={seeding}
            className="w-full"
            style={{ backgroundColor: mode === 'replace' && !confirmReplace ? '#DC2626' : '#5B7DB1' }}
          >
            {seeding ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading {TOTAL_QUESTIONS} questions...</>
            ) : (
              <><Upload className="w-4 h-4 mr-2" />Upload to Supabase{confirmReplace ? ' (CONFIRM REPLACE)' : ''}</>
            )}
          </Button>

          <div className="flex items-start gap-2 text-xs text-gray-500">
            <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
            <p>Questions are uploaded in batches of 100. The operation typically takes 5–15 seconds for the full set.</p>
          </div>
        </CardContent>
      </Card>

      {/* Seed result */}
      {seedResult && (
        <Card className={`border-l-4 ${seedResult.success ? 'border-l-green-500' : 'border-l-red-500'}`}>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 text-base ${seedResult.success ? 'text-green-900' : 'text-red-900'}`}>
              {seedResult.success ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <AlertCircle className="w-5 h-5 text-red-600" />}
              {seedResult.success ? 'Seed Complete' : 'Seed Failed'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {seedResult.error ? (
              <p className="text-sm text-red-700">{seedResult.error}</p>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center p-3 bg-gray-50 border rounded-lg">
                    <div className="text-xl text-gray-900">{seedResult.total_rows}</div>
                    <p className="text-xs text-gray-500">Total rows</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="text-xl text-green-700">{seedResult.inserted}</div>
                    <p className="text-xs text-green-600">Inserted/updated</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="text-xl text-blue-700">{seedResult.skipped}</div>
                    <p className="text-xs text-blue-600">Skipped</p>
                  </div>
                </div>

                {seedResult.breakdown && (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 mb-2">Breakdown by question bank:</p>
                    {Object.entries(seedResult.breakdown).map(([key, count]) => (
                      <div key={key} className="flex justify-between text-xs">
                        <span className="text-gray-600">{key.replace(/_/g, ' ')}</span>
                        <span className="text-gray-900">{count} questions</span>
                      </div>
                    ))}
                  </div>
                )}

                {seedResult.errors && seedResult.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-xs text-red-900 mb-1">Errors encountered:</p>
                    {seedResult.errors.map((e, i) => (
                      <p key={i} className="text-xs text-red-700">{e}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SQL migration reference */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Database className="w-4 h-4" />
            Migration SQL Reference
          </CardTitle>
          <CardDescription>
            Run this migration in Supabase SQL Editor if the table doesn't exist yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
            <pre className="text-xs text-green-300 whitespace-pre-wrap">{`-- Run in Supabase SQL Editor: supabase.com/dashboard

create table if not exists assessment_questions (
  id uuid primary key default gen_random_uuid(),
  external_id text unique,
  assessment_type text not null,
  framework text not null,
  age_group text not null default 'general',
  dimension text not null,
  question_text text not null,
  question_format text not null default 'likert',
  options jsonb default null,
  points integer default 1,
  display_order integer,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Allow public reads
alter table assessment_questions enable row level security;
create policy "public_read_questions"
  on assessment_questions for select using (is_active = true);`}</pre>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            File also saved at: <code>supabase/migrations/20260609000000_create_assessment_questions.sql</code>
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

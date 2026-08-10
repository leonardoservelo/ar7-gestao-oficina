-- AR7 Gestão da Oficina V20.2.8 — Integração Omie Fase 1
-- Migração exclusivamente aditiva. Não apaga, não trunca e não altera dados operacionais.

CREATE TABLE IF NOT EXISTS ar7_integration_settings (
  organization_id text NOT NULL,
  provider text NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  sync_mode text NOT NULL DEFAULT 'manual',
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'NOT_CONFIGURED',
  company_external_id text,
  company_name text,
  last_sync_at timestamptz,
  last_error text,
  sync_count bigint NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, provider)
);

CREATE TABLE IF NOT EXISTS ar7_integration_mappings (
  id text PRIMARY KEY,
  organization_id text NOT NULL,
  provider text NOT NULL,
  entity_type text NOT NULL,
  local_id text NOT NULL,
  external_id text,
  external_code text,
  sync_status text NOT NULL DEFAULT 'PENDING',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS ar7_integration_mappings_local_uq
  ON ar7_integration_mappings(organization_id, provider, entity_type, local_id);
CREATE UNIQUE INDEX IF NOT EXISTS ar7_integration_mappings_external_uq
  ON ar7_integration_mappings(organization_id, provider, entity_type, external_id)
  WHERE external_id IS NOT NULL AND external_id <> '';
CREATE INDEX IF NOT EXISTS ar7_integration_mappings_status_idx
  ON ar7_integration_mappings(organization_id, provider, sync_status, updated_at DESC);

CREATE TABLE IF NOT EXISTS ar7_integration_logs (
  id bigserial PRIMARY KEY,
  organization_id text NOT NULL,
  provider text NOT NULL,
  entity_type text,
  local_id text,
  external_id text,
  direction text NOT NULL,
  action text NOT NULL,
  status text NOT NULL,
  message text,
  request_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  response_summary jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS ar7_integration_logs_scope_idx
  ON ar7_integration_logs(organization_id, provider, created_at DESC);

CREATE TABLE IF NOT EXISTS ar7_integration_webhook_events (
  event_key text NOT NULL,
  organization_id text NOT NULL,
  provider text NOT NULL,
  topic text,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'PENDING',
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  received_at timestamptz NOT NULL DEFAULT now(),
  processed_at timestamptz,
  PRIMARY KEY (organization_id, provider, event_key)
);
CREATE INDEX IF NOT EXISTS ar7_integration_webhook_scope_idx
  ON ar7_integration_webhook_events(organization_id, provider, received_at DESC);

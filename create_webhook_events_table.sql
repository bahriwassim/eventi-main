-- Table pour suivre les événements webhook déjà traités (idempotence)
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  idempotency_key TEXT UNIQUE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour une recherche rapide par clé d'idempotence
CREATE INDEX IF NOT EXISTS idx_webhook_events_idempotency_key ON webhook_events(idempotency_key);

-- Index pour une recherche rapide par type d'événement
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);

-- Activer RLS
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre l'insertion par le service role
CREATE POLICY "Service role can insert webhook events" ON webhook_events
  FOR INSERT WITH CHECK (true);

-- Politique pour permettre la lecture par le service role
CREATE POLICY "Service role can read webhook events" ON webhook_events
  FOR SELECT USING (true);

-- Politique pour permettre la suppression par le service role (garbage collection)
CREATE POLICY "Service role can delete old webhook events" ON webhook_events
  FOR DELETE USING (created_at < NOW() - INTERVAL '30 days');
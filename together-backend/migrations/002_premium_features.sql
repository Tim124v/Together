-- Together 1.3 — Time Capsules + Shared Budget
-- psql -d together -f migrations/002_premium_features.sql

CREATE TABLE IF NOT EXISTS time_capsules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_date DATE NOT NULL,
  open_date DATE,
  content TEXT,
  is_opened BOOLEAN NOT NULL DEFAULT FALSE,
  opened_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL DEFAULT 'other',
  description VARCHAR(255),
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  paid_by VARCHAR(20) NOT NULL DEFAULT 'both',
  split_type VARCHAR(20) NOT NULL DEFAULT 'equal',
  he_percent INT NOT NULL DEFAULT 50,
  she_percent INT NOT NULL DEFAULT 50,
  created_date DATE,
  is_settled BOOLEAN NOT NULL DEFAULT FALSE,
  settled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS budget_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couple_id UUID NOT NULL REFERENCES couples(id) ON DELETE CASCADE,
  slug VARCHAR(50) NOT NULL,
  name VARCHAR(100) NOT NULL,
  icon VARCHAR(50),
  color VARCHAR(10)
);

CREATE INDEX IF NOT EXISTS idx_capsules_couple ON time_capsules(couple_id, created_date DESC);
CREATE INDEX IF NOT EXISTS idx_budget_items_couple ON budget_items(couple_id, created_date DESC);
CREATE INDEX IF NOT EXISTS idx_budget_categories_couple ON budget_categories(couple_id);

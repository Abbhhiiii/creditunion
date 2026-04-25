/**
 * Database Schema - PostgreSQL/Supabase
 * Run these SQL commands to set up the database
 */

-- ============ USERS TABLE ============
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  kyc_verified BOOLEAN DEFAULT FALSE,
  account_type VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ CONVERSATIONS TABLE ============
CREATE TABLE IF NOT EXISTS conversations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255),
  status VARCHAR(50) DEFAULT 'active', -- active, closed, escalated
  started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ended_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- ============ MESSAGES TABLE ============
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  content TEXT NOT NULL,
  sender VARCHAR(50) NOT NULL, -- 'user' or 'ai'
  metadata JSONB, -- Store intent, sentiment, etc.
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ CASES TABLE ============
CREATE TABLE IF NOT EXISTS cases (
  id SERIAL PRIMARY KEY,
  conversation_id INTEGER REFERENCES conversations(id) ON DELETE CASCADE,
  user_id INTEGER REFERENCES users(id),
  issue_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'pending', -- pending, resolved, escalated
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high
  description TEXT,
  summary JSONB, -- Structured summary for dashboard
  resolution TEXT,
  notes TEXT,
  sentiment VARCHAR(50),
  sentiment_score FLOAT,
  requires_escalation BOOLEAN DEFAULT FALSE,
  staff_assigned_to INTEGER REFERENCES users(id),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  resolved_at TIMESTAMP
);

-- ============ KNOWLEDGE BASE TABLE ============
CREATE TABLE IF NOT EXISTS knowledge_docs (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  content TEXT NOT NULL,
  keywords TEXT[],
  embedding VECTOR(1536), -- For vector DB (if using pgvector)
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ ANALYTICS TABLE ============
CREATE TABLE IF NOT EXISTS analytics (
  id SERIAL PRIMARY KEY,
  metric_name VARCHAR(255),
  metric_value NUMERIC,
  metric_date DATE DEFAULT CURRENT_DATE,
  metadata JSONB
);

-- ============ ACTIONS/AUDIT LOG ============
CREATE TABLE IF NOT EXISTS audit_log (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  action VARCHAR(255),
  resource_type VARCHAR(100),
  resource_id INTEGER,
  old_values JSONB,
  new_values JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============ INDEXES FOR PERFORMANCE ============
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_status ON conversations(status);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_cases_user_id ON cases(user_id);
CREATE INDEX idx_cases_status ON cases(status);
CREATE INDEX idx_cases_priority ON cases(priority);
CREATE INDEX idx_cases_created_at ON cases(created_at);
CREATE INDEX idx_knowledge_docs_category ON knowledge_docs(category);

-- ============ SAMPLE DATA ============
INSERT INTO users (email, name, phone, account_type, kyc_verified) VALUES
('member1@example.com', 'John Doe', '+1-555-0101', 'Savings Account', true),
('member2@example.com', 'Jane Smith', '+1-555-0102', 'Checking Account', true),
('staff1@example.com', 'Mike Johnson', '+1-555-0103', 'Staff', true);

INSERT INTO knowledge_docs (title, category, content, keywords) VALUES
('Savings Account Policies', 'Accounts', 'Minimum balance: $100. Interest rate: 0.75% APY...', ARRAY['savings', 'account', 'balance', 'interest']),
('Dispute Process', 'Disputes', 'File dispute within 90 days. Investigation takes 10-15 days...', ARRAY['dispute', 'process', 'investigation']);

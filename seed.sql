-- Optional seed data for manual testing.
-- Run this ONLY if you want pre-populated sample data.
-- This does NOT drop or recreate any tables.
--
-- Usage: paste into MySQL Workbench and run, OR:
--   mysql -u root -p TaskTracker < seed.sql

-- Two sample users (password for both is: password123)
INSERT INTO users (name, email, password_hash) VALUES
  ('Alice', 'alice@example.com', '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'),
  ('Bob',   'bob@example.com',   '$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy');

-- A sample project owned by Alice (assume Alice gets id = 1)
INSERT INTO projects (name, owner_id) VALUES
  ('My First Project', 1);

-- Add Alice as owner and Bob as member (assume project gets id = 1)
INSERT INTO project_members (project_id, user_id, role) VALUES
  (1, 1, 'owner'),
  (1, 2, 'member');

-- Two sample tasks
INSERT INTO tasks (title, project_id, created_by, assigned_to, status) VALUES
  ('Set up the database',   1, 1, 1, 'done'),
  ('Build the API routes',  1, 1, 2, 'in_progress');

-- A sample comment (assume tasks get ids 1 and 2)
INSERT INTO comments (body, task_id, user_id) VALUES
  ('Great progress on this!', 2, 1);

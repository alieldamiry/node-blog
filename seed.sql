BEGIN;

-- Users (passwords are dummy bcrypt-shaped strings, not real hashes)
INSERT INTO users (email, password, role, is_verified, first_name, last_name)
VALUES
  ('ali@example.com',     '$2b$10$dummyhashdummyhashdummyhashdummyhashdum', 'admin', true,  'Ali',     'Eldamiry'),
  ('sara@example.com',    '$2b$10$dummyhashdummyhashdummyhashdummyhashdum', 'user',  true,  'Sara',    'Hassan'),
  ('omar@example.com',    '$2b$10$dummyhashdummyhashdummyhashdummyhashdum', 'user',  false, 'Omar',    'Khaled'),
  ('mona@example.com',    '$2b$10$dummyhashdummyhashdummyhashdummyhashdum', 'user',  true,  'Mona',    'Adel'),
  ('youssef@example.com', '$2b$10$dummyhashdummyhashdummyhashdummyhashdum', 'user',  true,  'Youssef', 'Nabil');

-- Posts
INSERT INTO posts (user_id, title, content, is_published)
VALUES
  ((SELECT id FROM users WHERE email = 'ali@example.com'),
   'Getting Started with PostgreSQL Indexing', 'A deep dive into B-tree, GIN, and partial indexes.', true),
  ((SELECT id FROM users WHERE email = 'ali@example.com'),
   'Draft: BullMQ Job Queues Explained', 'Work in progress notes on Redis-backed queues.', false),
  ((SELECT id FROM users WHERE email = 'sara@example.com'),
   'Why I Switched to Docker Compose', 'Container networking finally clicked for me.', true),
  ((SELECT id FROM users WHERE email = 'omar@example.com'),
   'Frontend vs Fullstack: My Journey', 'Thoughts on expanding into backend dev.', true),
  ((SELECT id FROM users WHERE email = 'mona@example.com'),
   'Understanding CTEs in Postgres', 'Recursive queries made simple.', true),
  ((SELECT id FROM users WHERE email = 'youssef@example.com'),
   'Draft: JSONB Full-Text Search', 'Notes on tsvector and GIN indexes.', false);

-- Comments
INSERT INTO comments (post_id, user_id, content)
VALUES
  ((SELECT id FROM posts WHERE title = 'Getting Started with PostgreSQL Indexing'),
   (SELECT id FROM users WHERE email = 'sara@example.com'), 'This helped me understand covering indexes finally!'),
  ((SELECT id FROM posts WHERE title = 'Getting Started with PostgreSQL Indexing'),
   (SELECT id FROM users WHERE email = 'omar@example.com'), 'Great breakdown, thanks for sharing.'),
  ((SELECT id FROM posts WHERE title = 'Why I Switched to Docker Compose'),
   (SELECT id FROM users WHERE email = 'ali@example.com'), 'Bridge networks confused me too at first.'),
  ((SELECT id FROM posts WHERE title = 'Understanding CTEs in Postgres'),
   (SELECT id FROM users WHERE email = 'youssef@example.com'), 'Recursive CTEs are underrated.'),
  ((SELECT id FROM posts WHERE title = 'Frontend vs Fullstack: My Journey'),
   (SELECT id FROM users WHERE email = 'mona@example.com'), 'Relatable, I made the same switch last year.');

-- Likes
INSERT INTO likes (post_id, user_id)
VALUES
  ((SELECT id FROM posts WHERE title = 'Getting Started with PostgreSQL Indexing'),
   (SELECT id FROM users WHERE email = 'sara@example.com')),
  ((SELECT id FROM posts WHERE title = 'Getting Started with PostgreSQL Indexing'),
   (SELECT id FROM users WHERE email = 'omar@example.com')),
  ((SELECT id FROM posts WHERE title = 'Why I Switched to Docker Compose'),
   (SELECT id FROM users WHERE email = 'ali@example.com')),
  ((SELECT id FROM posts WHERE title = 'Understanding CTEs in Postgres'),
   (SELECT id FROM users WHERE email = 'sara@example.com')),
  ((SELECT id FROM posts WHERE title = 'Frontend vs Fullstack: My Journey'),
   (SELECT id FROM users WHERE email = 'youssef@example.com'));

COMMIT;
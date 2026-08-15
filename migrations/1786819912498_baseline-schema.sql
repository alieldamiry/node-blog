-- Up Migration

-- Extensions
CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;
CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA public;

-- Types
CREATE TYPE public.user_role AS ENUM (
    'user',
    'admin'
);

-- Functions
CREATE FUNCTION public.update_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- Tables
CREATE TABLE public.users (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email public.citext NOT NULL,
    password character varying(255) NOT NULL,
    role public.user_role DEFAULT 'user'::public.user_role NOT NULL,
    is_verified boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    first_name character varying(255) NOT NULL,
    last_name character varying(255) NOT NULL,
    avatar_url text,
    avatar_public_id character varying,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_email_key UNIQUE (email)
);

CREATE TABLE public.posts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    title character varying(255) NOT NULL,
    content text NOT NULL,
    is_published boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT posts_pkey PRIMARY KEY (id),
    CONSTRAINT posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT
);

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT comments_pkey PRIMARY KEY (id),
    CONSTRAINT comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
    CONSTRAINT comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT
);

CREATE TABLE public.likes (
    post_id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT likes_pkey PRIMARY KEY (user_id, post_id),
    CONSTRAINT likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.posts(id) ON DELETE CASCADE,
    CONSTRAINT likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE RESTRICT
);

CREATE TABLE public.notifications (
    id SERIAL NOT NULL,
    user_id uuid NOT NULL,
    type character varying(50) NOT NULL,
    message text NOT NULL,
    read boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT notifications_pkey PRIMARY KEY (id),
    CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX idx_comments_created_at_desc ON public.comments USING btree (created_at DESC);
CREATE INDEX idx_comments_post_id ON public.comments USING btree (post_id);
CREATE INDEX idx_comments_user_id ON public.comments USING btree (user_id);

CREATE INDEX idx_likes_post_id ON public.likes USING btree (post_id);
CREATE INDEX idx_likes_user_id ON public.likes USING btree (user_id);

CREATE INDEX idx_notifications_unread ON public.notifications USING btree (user_id, created_at DESC) WHERE (read = false);
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);
CREATE INDEX idx_notifications_user_id_read ON public.notifications USING btree (user_id, read);

CREATE INDEX idx_posts_covering ON public.posts USING btree (user_id, created_at DESC) INCLUDE (id, title, is_published);
CREATE INDEX idx_posts_created_at_desc ON public.posts USING btree (created_at DESC);
CREATE INDEX idx_posts_user_created ON public.posts USING btree (user_id, created_at DESC);

-- Triggers
CREATE TRIGGER trigger_posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
CREATE TRIGGER trigger_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Down Migration

DROP TRIGGER IF EXISTS trigger_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS trigger_posts_updated_at ON public.posts;

DROP TABLE IF EXISTS public.notifications;
DROP TABLE IF EXISTS public.likes;
DROP TABLE IF EXISTS public.comments;
DROP TABLE IF EXISTS public.posts;
DROP TABLE IF EXISTS public.users;

DROP FUNCTION IF EXISTS public.update_updated_at();

DROP TYPE IF EXISTS public.user_role;

-- Extensions are usually left in place since other schemas/DBs may rely on them.
-- Uncomment if you're sure nothing else needs them:
-- DROP EXTENSION IF EXISTS pg_stat_statements;
-- DROP EXTENSION IF EXISTS citext;
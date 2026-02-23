-- ═══════════════════════════════════════════════════════════════
-- BXE INTAKE PORTAL — Full Schema for Shared Supabase Project
-- Run this in the Supabase SQL Editor for: twkqrmkuhmcxygabskfe
-- (Same project as BXE Travel + BoldX Hub)
--
-- This is the COMPLETE schema including all columns the app expects.
-- Safe to re-run — uses IF NOT EXISTS guards.
-- ═══════════════════════════════════════════════════════════════

-- ============================================
-- 1. Applications table
-- ============================================
CREATE TABLE IF NOT EXISTS intake_applications (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID NOT NULL REFERENCES auth.users(id),
  company_name     TEXT,
  company_website  TEXT,
  status           TEXT NOT NULL DEFAULT 'draft'
                   CHECK (status IN (
                     'draft','in_progress','submitted','under_review',
                     'conditional_approval','approved','declined','expired','disqualified'
                   )),
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at     TIMESTAMPTZ,
  expires_at       TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '45 days'),
  missed_deadlines INTEGER NOT NULL DEFAULT 0,
  current_section  INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_intake_apps_user ON intake_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_intake_apps_status ON intake_applications(status);

-- ============================================
-- 2. Sections table (JSONB data per section)
-- ============================================
CREATE TABLE IF NOT EXISTS intake_sections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES intake_applications(id) ON DELETE CASCADE,
  section_key     TEXT NOT NULL,
  section_number  INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'not_started'
                  CHECK (status IN (
                    'not_started','in_progress','submitted',
                    'accepted','needs_update','additional_info_requested','locked'
                  )),
  data            JSONB NOT NULL DEFAULT '{}',
  last_saved_at   TIMESTAMPTZ,
  submitted_at    TIMESTAMPTZ,
  reviewer_notes  TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(application_id, section_key)
);

CREATE INDEX IF NOT EXISTS idx_intake_sections_app ON intake_sections(application_id);

-- ============================================
-- 3. Documents table (file uploads)
-- ============================================
CREATE TABLE IF NOT EXISTS intake_documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES intake_applications(id) ON DELETE CASCADE,
  section_key     TEXT NOT NULL DEFAULT 'documents',
  checklist_item  TEXT,
  file_name       TEXT NOT NULL,
  file_size       INTEGER NOT NULL,
  file_type       TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  scan_status     TEXT NOT NULL DEFAULT 'pending'
                  CHECK (scan_status IN ('pending','clean','infected','error')),
  uploaded_by     UUID NOT NULL REFERENCES auth.users(id),
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_intake_docs_app ON intake_documents(application_id);
CREATE INDEX IF NOT EXISTS idx_intake_docs_checklist ON intake_documents(application_id, checklist_item);

-- ============================================
-- 4. Audit log table
-- ============================================
CREATE TABLE IF NOT EXISTS intake_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES intake_applications(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  action          TEXT NOT NULL,
  section_key     TEXT,
  details         JSONB DEFAULT '{}',
  ip_address      INET,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_intake_audit_app ON intake_audit_log(application_id);
CREATE INDEX IF NOT EXISTS idx_intake_audit_time ON intake_audit_log(created_at);

-- ═══════════════════════════════════════════════════════════════
-- ROW-LEVEL SECURITY (RLS) — User Policies
-- ═══════════════════════════════════════════════════════════════

ALTER TABLE intake_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_audit_log ENABLE ROW LEVEL SECURITY;

-- ── intake_applications ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own applications' AND tablename = 'intake_applications') THEN
    CREATE POLICY "Users can view own applications"
      ON intake_applications FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own applications' AND tablename = 'intake_applications') THEN
    CREATE POLICY "Users can insert own applications"
      ON intake_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own applications' AND tablename = 'intake_applications') THEN
    CREATE POLICY "Users can update own applications"
      ON intake_applications FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- ── intake_sections ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own sections' AND tablename = 'intake_sections') THEN
    CREATE POLICY "Users can view own sections"
      ON intake_sections FOR SELECT
      USING (application_id IN (SELECT id FROM intake_applications WHERE user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own sections' AND tablename = 'intake_sections') THEN
    CREATE POLICY "Users can insert own sections"
      ON intake_sections FOR INSERT
      WITH CHECK (application_id IN (SELECT id FROM intake_applications WHERE user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update own sections' AND tablename = 'intake_sections') THEN
    CREATE POLICY "Users can update own sections"
      ON intake_sections FOR UPDATE
      USING (application_id IN (SELECT id FROM intake_applications WHERE user_id = auth.uid()));
  END IF;
END $$;

-- ── intake_documents ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own documents' AND tablename = 'intake_documents') THEN
    CREATE POLICY "Users can view own documents"
      ON intake_documents FOR SELECT
      USING (application_id IN (SELECT id FROM intake_applications WHERE user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert own documents' AND tablename = 'intake_documents') THEN
    CREATE POLICY "Users can insert own documents"
      ON intake_documents FOR INSERT
      WITH CHECK (application_id IN (SELECT id FROM intake_applications WHERE user_id = auth.uid()));
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete own documents' AND tablename = 'intake_documents') THEN
    CREATE POLICY "Users can delete own documents"
      ON intake_documents FOR DELETE
      USING (application_id IN (SELECT id FROM intake_applications WHERE user_id = auth.uid()));
  END IF;
END $$;

-- ── intake_audit_log ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view own audit log' AND tablename = 'intake_audit_log') THEN
    CREATE POLICY "Users can view own audit log"
      ON intake_audit_log FOR SELECT USING (user_id = auth.uid());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert audit log entries' AND tablename = 'intake_audit_log') THEN
    CREATE POLICY "Users can insert audit log entries"
      ON intake_audit_log FOR INSERT WITH CHECK (user_id = auth.uid());
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- ADMIN POLICIES
-- Admins (thearcstudio.com, boldxenterprises.com) can see everything
-- ═══════════════════════════════════════════════════════════════

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all applications' AND tablename = 'intake_applications') THEN
    CREATE POLICY "Admins can view all applications"
      ON intake_applications FOR SELECT
      USING (
        (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@thearcstudio.com'
        OR (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@boldxenterprises.com'
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update all applications' AND tablename = 'intake_applications') THEN
    CREATE POLICY "Admins can update all applications"
      ON intake_applications FOR UPDATE
      USING (
        (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@thearcstudio.com'
        OR (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@boldxenterprises.com'
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all sections' AND tablename = 'intake_sections') THEN
    CREATE POLICY "Admins can view all sections"
      ON intake_sections FOR SELECT
      USING (
        (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@thearcstudio.com'
        OR (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@boldxenterprises.com'
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can update all sections' AND tablename = 'intake_sections') THEN
    CREATE POLICY "Admins can update all sections"
      ON intake_sections FOR UPDATE
      USING (
        (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@thearcstudio.com'
        OR (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@boldxenterprises.com'
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all documents' AND tablename = 'intake_documents') THEN
    CREATE POLICY "Admins can view all documents"
      ON intake_documents FOR SELECT
      USING (
        (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@thearcstudio.com'
        OR (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@boldxenterprises.com'
      );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Admins can view all audit logs' AND tablename = 'intake_audit_log') THEN
    CREATE POLICY "Admins can view all audit logs"
      ON intake_audit_log FOR SELECT
      USING (
        (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@thearcstudio.com'
        OR (SELECT email FROM auth.users WHERE id = auth.uid()) LIKE '%@boldxenterprises.com'
      );
  END IF;
END $$;

-- ═══════════════════════════════════════════════════════════════
-- STORAGE BUCKET for document uploads
-- ═══════════════════════════════════════════════════════════════

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'intake-documents',
  'intake-documents',
  false,
  52428800,
  ARRAY['application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg']
)
ON CONFLICT (id) DO NOTHING;

-- Storage access policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload intake docs' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can upload intake docs"
      ON storage.objects FOR INSERT
      WITH CHECK (bucket_id = 'intake-documents' AND auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can read intake docs' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can read intake docs"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'intake-documents' AND auth.uid() IS NOT NULL);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can delete intake docs' AND tablename = 'objects') THEN
    CREATE POLICY "Authenticated users can delete intake docs"
      ON storage.objects FOR DELETE
      USING (bucket_id = 'intake-documents' AND auth.uid() IS NOT NULL);
  END IF;
END $$;

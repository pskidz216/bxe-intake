-- BXE Intake Portal — Database Schema
-- Run this in the Supabase SQL Editor for your new project

-- ============================================
-- 1. Applications table
-- ============================================
CREATE TABLE intake_applications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  company_name    TEXT,
  company_website TEXT,
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN (
                    'draft','in_progress','submitted','under_review',
                    'conditional_approval','approved','declined','expired','disqualified'
                  )),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  submitted_at    TIMESTAMPTZ,
  expires_at      TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '45 days'),
  missed_deadlines INTEGER NOT NULL DEFAULT 0,
  current_section  INTEGER NOT NULL DEFAULT 1
);

CREATE INDEX idx_intake_apps_user ON intake_applications(user_id);
CREATE INDEX idx_intake_apps_status ON intake_applications(status);
CREATE INDEX idx_intake_apps_expires ON intake_applications(expires_at)
  WHERE status IN ('draft','in_progress');

-- ============================================
-- 2. Sections table (JSONB data per section)
-- ============================================
CREATE TABLE intake_sections (
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

CREATE INDEX idx_intake_sections_app ON intake_sections(application_id);

-- ============================================
-- 3. Documents table (file uploads)
-- ============================================
CREATE TABLE intake_documents (
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

CREATE INDEX idx_intake_docs_app ON intake_documents(application_id);
CREATE INDEX idx_intake_docs_checklist ON intake_documents(application_id, checklist_item);

-- ============================================
-- 4. Audit log table
-- ============================================
CREATE TABLE intake_audit_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id  UUID NOT NULL REFERENCES intake_applications(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id),
  action          TEXT NOT NULL,
  section_key     TEXT,
  details         JSONB DEFAULT '{}',
  ip_address      INET,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_app ON intake_audit_log(application_id);
CREATE INDEX idx_audit_time ON intake_audit_log(created_at);

-- ============================================
-- 5. Row-Level Security Policies
-- ============================================

-- Applications: users can only see/modify their own
ALTER TABLE intake_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own applications"
  ON intake_applications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
  ON intake_applications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
  ON intake_applications FOR UPDATE
  USING (auth.uid() = user_id);

-- Sections: access through application ownership
ALTER TABLE intake_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own sections"
  ON intake_sections FOR SELECT
  USING (application_id IN (
    SELECT id FROM intake_applications WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own sections"
  ON intake_sections FOR INSERT
  WITH CHECK (application_id IN (
    SELECT id FROM intake_applications WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own sections"
  ON intake_sections FOR UPDATE
  USING (application_id IN (
    SELECT id FROM intake_applications WHERE user_id = auth.uid()
  ));

-- Documents: access through application ownership
ALTER TABLE intake_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own documents"
  ON intake_documents FOR SELECT
  USING (application_id IN (
    SELECT id FROM intake_applications WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can insert own documents"
  ON intake_documents FOR INSERT
  WITH CHECK (application_id IN (
    SELECT id FROM intake_applications WHERE user_id = auth.uid()
  ));

CREATE POLICY "Users can update own documents"
  ON intake_documents FOR UPDATE
  USING (application_id IN (
    SELECT id FROM intake_applications WHERE user_id = auth.uid()
  ));

-- Audit log: users can insert, read restricted to service role
ALTER TABLE intake_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert audit logs"
  ON intake_audit_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own audit logs"
  ON intake_audit_log FOR SELECT
  USING (user_id = auth.uid());

-- ============================================
-- 6. Storage bucket (run in Supabase Dashboard)
-- ============================================
-- Create a storage bucket named "intake-documents"
-- Settings:
--   Public: false
--   Max file size: 52428800 (50MB)
--   Allowed MIME types: application/pdf,
--     application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,
--     application/vnd.ms-excel,
--     application/vnd.openxmlformats-officedocument.wordprocessingml.document,
--     image/png, image/jpeg
--
-- Storage RLS policy:
-- INSERT: (bucket_id = 'intake-documents' AND auth.uid() IS NOT NULL)
-- SELECT: (bucket_id = 'intake-documents' AND auth.uid() IS NOT NULL)
-- DELETE: (bucket_id = 'intake-documents' AND auth.uid() IS NOT NULL)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'intake-documents',
  'intake-documents',
  false,
  52428800,
  ARRAY['application/pdf','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.wordprocessingml.document','image/png','image/jpeg']
);

-- Storage access policies
CREATE POLICY "Authenticated users can upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'intake-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can read own files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'intake-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete own files"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'intake-documents' AND auth.uid() IS NOT NULL);

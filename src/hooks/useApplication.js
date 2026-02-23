import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { SECTIONS, APPLICATION_LIFETIME_DAYS } from '../utils/constants';

export function useApplication(user) {
  const [applications, setApplications] = useState([]);
  const [currentApp, setCurrentApp] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load all applications for dashboard
  const loadMyApplications = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data, error: err } = await supabase
      .from('intake_applications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (err) {
      setError(err.message);
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  }, [user]);

  // Load a single application with its sections
  const loadApplication = useCallback(async (appId) => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const [appResult, sectionsResult] = await Promise.all([
      supabase.from('intake_applications').select('*').eq('id', appId).single(),
      supabase.from('intake_sections').select('*').eq('application_id', appId).order('section_number'),
    ]);

    if (appResult.error) {
      setError(appResult.error.message);
      setLoading(false);
      return null;
    }

    setCurrentApp(appResult.data);
    setSections(sectionsResult.data || []);
    setLoading(false);
    return appResult.data;
  }, [user]);

  // Create a new application with 10 empty sections
  const createApplication = useCallback(async () => {
    if (!user) return null;
    setError(null);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + APPLICATION_LIFETIME_DAYS);

    const { data: app, error: appErr } = await supabase
      .from('intake_applications')
      .insert({
        user_id: user.id,
        status: 'draft',
        expires_at: expiresAt.toISOString(),
        current_section: 1,
      })
      .select()
      .single();

    if (appErr) {
      setError(appErr.message);
      return null;
    }

    // Create 10 section rows
    const sectionRows = SECTIONS.map(s => ({
      application_id: app.id,
      section_key: s.key,
      section_number: s.number,
      status: 'not_started',
      data: {},
    }));

    const { error: secErr } = await supabase
      .from('intake_sections')
      .insert(sectionRows);

    if (secErr) {
      setError(secErr.message);
      return null;
    }

    // Log audit
    await supabase.from('intake_audit_log').insert({
      application_id: app.id,
      user_id: user.id,
      action: 'application_created',
      details: { expires_at: expiresAt.toISOString() },
    });

    return app;
  }, [user]);

  // Update application status
  const updateAppStatus = useCallback(async (appId, status) => {
    const updates = { status, updated_at: new Date().toISOString() };
    if (status === 'submitted') updates.submitted_at = new Date().toISOString();

    const { error: err } = await supabase
      .from('intake_applications')
      .update(updates)
      .eq('id', appId);

    if (err) {
      setError(err.message);
      return false;
    }

    setCurrentApp(prev => prev ? { ...prev, ...updates } : prev);
    return true;
  }, []);

  // Update company name (denormalized for dashboard display)
  const updateCompanyName = useCallback(async (appId, name) => {
    await supabase
      .from('intake_applications')
      .update({ company_name: name, updated_at: new Date().toISOString() })
      .eq('id', appId);
  }, []);

  // Update current section (wizard position)
  const updateCurrentSection = useCallback(async (appId, sectionNumber) => {
    await supabase
      .from('intake_applications')
      .update({ current_section: sectionNumber })
      .eq('id', appId);
    setCurrentApp(prev => prev ? { ...prev, current_section: sectionNumber } : prev);
  }, []);

  // Submit the entire application
  const submitApplication = useCallback(async (appId) => {
    setError(null);

    const { error: err } = await supabase
      .from('intake_applications')
      .update({
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', appId);

    if (err) {
      setError(err.message);
      return false;
    }

    // Log audit
    await supabase.from('intake_audit_log').insert({
      application_id: appId,
      user_id: user.id,
      action: 'application_submitted',
    });

    return true;
  }, [user]);

  // Load on mount
  useEffect(() => {
    if (user) loadMyApplications();
  }, [user, loadMyApplications]);

  return {
    applications,
    currentApp,
    sections,
    loading,
    error,
    loadMyApplications,
    loadApplication,
    createApplication,
    updateAppStatus,
    updateCompanyName,
    updateCurrentSection,
    submitApplication,
  };
}

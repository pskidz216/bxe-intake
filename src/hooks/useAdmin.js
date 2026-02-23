import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useAdmin() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Per-application detail state
  const [currentSections, setCurrentSections] = useState([]);
  const [currentDocuments, setCurrentDocuments] = useState([]);
  const [currentAuditLog, setCurrentAuditLog] = useState([]);

  const loadAllApplications = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('intake_applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (searchQuery) {
      query = query.ilike('company_name', `%${searchQuery}%`);
    }

    const { data, error: err } = await query;

    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }

    setApplications(data || []);
    setLoading(false);
  }, [statusFilter, searchQuery]);

  const updateApplicationStatus = useCallback(async (appId, newStatus) => {
    setError(null);
    const { error: err } = await supabase
      .from('intake_applications')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', appId);

    if (err) {
      setError('Failed to update status: ' + err.message);
      return false;
    }

    setApplications(prev =>
      prev.map(app => app.id === appId ? { ...app, status: newStatus } : app)
    );
    return true;
  }, []);

  const addReviewerNotes = useCallback(async (sectionId, notes) => {
    setError(null);
    const { error: err } = await supabase
      .from('intake_sections')
      .update({ reviewer_notes: notes, updated_at: new Date().toISOString() })
      .eq('id', sectionId);

    if (err) {
      setError('Failed to save notes: ' + err.message);
      return false;
    }

    setCurrentSections(prev =>
      prev.map(s => s.id === sectionId ? { ...s, reviewer_notes: notes } : s)
    );
    return true;
  }, []);

  const loadApplicationSections = useCallback(async (appId) => {
    const { data, error: err } = await supabase
      .from('intake_sections')
      .select('*')
      .eq('application_id', appId)
      .order('section_number');

    if (err) {
      setError('Failed to load sections: ' + err.message);
      return;
    }
    setCurrentSections(data || []);
  }, []);

  const loadApplicationDocuments = useCallback(async (appId) => {
    const { data, error: err } = await supabase
      .from('intake_documents')
      .select('*')
      .eq('application_id', appId)
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false });

    if (err) {
      setError('Failed to load documents: ' + err.message);
      return;
    }
    setCurrentDocuments(data || []);
  }, []);

  const loadApplicationAuditLog = useCallback(async (appId) => {
    const { data, error: err } = await supabase
      .from('intake_audit_log')
      .select('*')
      .eq('application_id', appId)
      .order('created_at', { ascending: false });

    if (err) {
      setError('Failed to load audit log: ' + err.message);
      return;
    }
    setCurrentAuditLog(data || []);
  }, []);

  const getDocumentUrl = useCallback(async (storagePath) => {
    const { data, error: err } = await supabase.storage
      .from('intake-documents')
      .createSignedUrl(storagePath, 3600);

    if (err) {
      setError('Failed to get download URL: ' + err.message);
      return null;
    }
    return data?.signedUrl;
  }, []);

  return {
    applications,
    loading,
    error,
    statusFilter,
    searchQuery,
    setStatusFilter,
    setSearchQuery,
    loadAllApplications,
    updateApplicationStatus,
    addReviewerNotes,
    loadApplicationSections,
    loadApplicationDocuments,
    loadApplicationAuditLog,
    getDocumentUrl,
    currentSections,
    currentDocuments,
    currentAuditLog,
  };
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useLocalSection } from './useLocalSection';

/**
 * useSection — unified hook for section data.
 *
 * When applicationId is provided → persists to Supabase (authenticated mode).
 * When applicationId is null     → stores in localStorage (public mode).
 *
 * The API is identical in both modes, so section components don't need to know.
 */
export function useSection(applicationId, sectionKey, userId) {
  // Delegate to local mode when there's no applicationId
  const localHook = useLocalSection(sectionKey);

  const [data, setData] = useState({});
  const [status, setStatus] = useState('not_started');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const [sectionId, setSectionId] = useState(null);
  const saveTimeoutRef = useRef(null);

  // If no applicationId, use local mode
  const isLocalMode = !applicationId;

  // Load section data from Supabase
  useEffect(() => {
    if (isLocalMode || !sectionKey) return;

    async function load() {
      setLoading(true);
      const { data: section, error } = await supabase
        .from('intake_sections')
        .select('*')
        .eq('application_id', applicationId)
        .eq('section_key', sectionKey)
        .single();

      if (error) {
        console.error('Error loading section:', error);
      } else if (section) {
        setSectionId(section.id);
        setData(section.data || {});
        setStatus(section.status);
        setLastSaved(section.last_saved_at);
      }
      setLoading(false);
    }

    load();
  }, [applicationId, sectionKey, isLocalMode]);

  // Debounced save — 1.5s after last change
  const saveField = useCallback((fieldName, value) => {
    if (isLocalMode) return; // Should not be called in local mode

    setData(prev => {
      const updated = { ...prev, [fieldName]: value };

      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      saveTimeoutRef.current = setTimeout(async () => {
        setSaving(true);
        const now = new Date().toISOString();
        const { error } = await supabase
          .from('intake_sections')
          .update({
            data: updated,
            status: 'in_progress',
            last_saved_at: now,
            updated_at: now,
          })
          .eq('application_id', applicationId)
          .eq('section_key', sectionKey);

        if (error) {
          console.error('Error saving section:', error);
        } else {
          setLastSaved(now);
          setStatus('in_progress');
        }
        setSaving(false);
      }, 1500);

      return updated;
    });
  }, [applicationId, sectionKey, isLocalMode]);

  // Save entire data object
  const saveData = useCallback((newData) => {
    if (isLocalMode) return;

    setData(newData);

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(async () => {
      setSaving(true);
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('intake_sections')
        .update({
          data: newData,
          status: 'in_progress',
          last_saved_at: now,
          updated_at: now,
        })
        .eq('application_id', applicationId)
        .eq('section_key', sectionKey);

      if (error) {
        console.error('Error saving section:', error);
      } else {
        setLastSaved(now);
        setStatus('in_progress');
      }
      setSaving(false);
    }, 1500);
  }, [applicationId, sectionKey, isLocalMode]);

  // Immediate save
  const saveNow = useCallback(async (overrideData) => {
    if (isLocalMode) return;

    const toSave = overrideData || data;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaving(true);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('intake_sections')
      .update({
        data: toSave,
        status: status === 'not_started' ? 'in_progress' : status,
        last_saved_at: now,
        updated_at: now,
      })
      .eq('application_id', applicationId)
      .eq('section_key', sectionKey);

    if (error) {
      console.error('Error saving section:', error);
    } else {
      setLastSaved(now);
      if (status === 'not_started') setStatus('in_progress');
    }
    setSaving(false);

    if (userId) {
      await supabase.from('intake_audit_log').insert({
        application_id: applicationId,
        user_id: userId,
        action: 'section_saved',
        section_key: sectionKey,
        details: { field_count: Object.keys(toSave).length },
      });
    }
  }, [applicationId, sectionKey, data, status, userId, isLocalMode]);

  // Submit section
  const submitSection = useCallback(async () => {
    if (isLocalMode) return true;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    setSaving(true);
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('intake_sections')
      .update({
        data,
        status: 'submitted',
        submitted_at: now,
        last_saved_at: now,
        updated_at: now,
      })
      .eq('application_id', applicationId)
      .eq('section_key', sectionKey);

    if (error) {
      console.error('Error submitting section:', error);
      setSaving(false);
      return false;
    }

    setStatus('submitted');
    setLastSaved(now);
    setSaving(false);
    return true;
  }, [applicationId, sectionKey, data, isLocalMode]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  // Return local hook results when in local mode
  if (isLocalMode) {
    return localHook;
  }

  return {
    data,
    status,
    loading,
    saving,
    lastSaved,
    sectionId,
    saveField,
    saveData,
    saveNow,
    submitSection,
    setData,
  };
}

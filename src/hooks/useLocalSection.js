import { useState, useEffect, useCallback, useRef } from 'react';

const STORAGE_PREFIX = 'bxe_intake_';

/**
 * useLocalSection — same API as useSection but stores data in localStorage.
 * Used for the public (unauthenticated) form flow.
 * Data is persisted to localStorage with a debounce for performance.
 */
export function useLocalSection(sectionKey) {
  const storageKey = `${STORAGE_PREFIX}${sectionKey}`;
  const [data, setData] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [status, setStatus] = useState(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? 'in_progress' : 'not_started';
    } catch {
      return 'not_started';
    }
  });
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState(null);
  const saveTimeoutRef = useRef(null);

  // Persist to localStorage with debounce
  const persistToStorage = useCallback((newData) => {
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setSaving(true);
    saveTimeoutRef.current = setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(newData));
        const now = new Date().toISOString();
        setLastSaved(now);
        setStatus('in_progress');
      } catch (e) {
        console.error('Error saving to localStorage:', e);
      }
      setSaving(false);
    }, 500);
  }, [storageKey]);

  // Save a single field
  const saveField = useCallback((fieldName, value) => {
    setData(prev => {
      const updated = { ...prev, [fieldName]: value };
      persistToStorage(updated);
      return updated;
    });
  }, [persistToStorage]);

  // Save entire data object (for bulk updates like arrays)
  const saveData = useCallback((newData) => {
    setData(newData);
    persistToStorage(newData);
  }, [persistToStorage]);

  // Immediate save (no debounce)
  const saveNow = useCallback((overrideData) => {
    const toSave = overrideData || data;
    try {
      localStorage.setItem(storageKey, JSON.stringify(toSave));
      const now = new Date().toISOString();
      setLastSaved(now);
      if (status === 'not_started') setStatus('in_progress');
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  }, [data, storageKey, status]);

  // Submit section (local mode just marks as submitted in memory)
  const submitSection = useCallback(async () => {
    setStatus('submitted');
    return true;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

  return {
    data,
    status,
    loading: false, // Never loading in local mode
    saving,
    lastSaved,
    sectionId: null,
    saveField,
    saveData,
    saveNow,
    submitSection,
    setData,
  };
}

/**
 * Get all local section data — used when persisting to Supabase after auth
 */
export function getAllLocalSectionData() {
  const sections = {};
  const keys = ['company', 'transaction', 'financials_hist', 'financials_proj',
    'cap_table', 'valuation', 'use_of_proceeds', 'kpis', 'documents', 'summary'];

  for (const key of keys) {
    try {
      const stored = localStorage.getItem(`${STORAGE_PREFIX}${key}`);
      if (stored) {
        sections[key] = JSON.parse(stored);
      }
    } catch {
      // Skip invalid data
    }
  }
  return sections;
}

/**
 * Clear all local section data — called after successful persist to Supabase
 */
export function clearAllLocalSectionData() {
  const keys = ['company', 'transaction', 'financials_hist', 'financials_proj',
    'cap_table', 'valuation', 'use_of_proceeds', 'kpis', 'documents', 'summary'];

  for (const key of keys) {
    localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  }
}

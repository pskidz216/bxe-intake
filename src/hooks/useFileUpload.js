import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE } from '../utils/constants';

export function useFileUpload(applicationId, userId) {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  // Load documents for this application
  const loadDocuments = useCallback(async () => {
    if (!applicationId) return;
    const { data, error } = await supabase
      .from('intake_documents')
      .select('*')
      .eq('application_id', applicationId)
      .is('deleted_at', null)
      .order('uploaded_at', { ascending: false });

    if (error) {
      console.error('Error loading documents:', error);
    } else {
      setDocuments(data || []);
    }
  }, [applicationId]);

  // Upload a file
  const uploadFile = useCallback(async (file, sectionKey, checklistItem) => {
    setUploadError(null);

    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      setUploadError('File type not allowed. Accepted: PDF, XLSX, XLS, DOCX, PNG, JPEG');
      return null;
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError('File too large. Maximum size is 50MB.');
      return null;
    }

    setUploading(true);

    // Upload to Supabase Storage
    const storagePath = `${applicationId}/${sectionKey}/${Date.now()}_${file.name}`;
    const { error: storageError } = await supabase.storage
      .from('intake-documents')
      .upload(storagePath, file);

    if (storageError) {
      setUploadError('Upload failed: ' + storageError.message);
      setUploading(false);
      return null;
    }

    // Insert document record
    const { data: doc, error: dbError } = await supabase
      .from('intake_documents')
      .insert({
        application_id: applicationId,
        section_key: sectionKey || 'documents',
        checklist_item: checklistItem || null,
        file_name: file.name,
        file_size: file.size,
        file_type: file.type,
        storage_path: storagePath,
        scan_status: 'pending',
        uploaded_by: userId,
      })
      .select()
      .single();

    if (dbError) {
      setUploadError('Failed to save document record: ' + dbError.message);
      setUploading(false);
      return null;
    }

    // Audit log
    await supabase.from('intake_audit_log').insert({
      application_id: applicationId,
      user_id: userId,
      action: 'file_uploaded',
      section_key: sectionKey,
      details: {
        file_name: file.name,
        file_size: file.size,
        checklist_item: checklistItem,
      },
    });

    setDocuments(prev => [doc, ...prev]);
    setUploading(false);
    return doc;
  }, [applicationId, userId]);

  // Get signed download URL
  const getSignedUrl = useCallback(async (storagePath) => {
    const { data, error } = await supabase.storage
      .from('intake-documents')
      .createSignedUrl(storagePath, 3600); // 60-minute expiry

    if (error) {
      console.error('Error creating signed URL:', error);
      return null;
    }
    return data.signedUrl;
  }, []);

  // Soft-delete a document
  const deleteDocument = useCallback(async (documentId) => {
    const { error } = await supabase
      .from('intake_documents')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', documentId);

    if (error) {
      console.error('Error deleting document:', error);
      return false;
    }

    setDocuments(prev => prev.filter(d => d.id !== documentId));
    return true;
  }, []);

  return {
    documents,
    uploading,
    uploadError,
    loadDocuments,
    uploadFile,
    getSignedUrl,
    deleteDocument,
    setUploadError,
  };
}

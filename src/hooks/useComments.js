import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export function useComments(appId) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch comments for this app
  const fetchComments = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_comments')
      .select('*')
      .eq('app_id', appId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setComments(data);
    }
    setLoading(false);
  }, [appId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  // Add a comment
  const addComment = useCallback(async (text, pageContext = '') => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('app_comments')
      .insert({
        app_id: appId,
        comment: text,
        page_context: pageContext || null,
        created_by: user.id,
        created_by_email: user.email,
      });

    if (error) {
      console.error('Failed to add comment:', error);
      return false;
    }
    await fetchComments();
    return true;
  }, [appId, fetchComments]);

  // Resolve / reopen a comment
  const toggleResolved = useCallback(async (commentId, currentStatus) => {
    const newStatus = currentStatus === 'open' ? 'resolved' : 'open';
    const updates = {
      status: newStatus,
      resolved_at: newStatus === 'resolved' ? new Date().toISOString() : null,
    };

    const { error } = await supabase
      .from('app_comments')
      .update(updates)
      .eq('id', commentId);

    if (error) {
      console.error('Failed to toggle comment:', error);
      return false;
    }
    await fetchComments();
    return true;
  }, [fetchComments]);

  // Delete a comment
  const deleteComment = useCallback(async (commentId) => {
    const { error } = await supabase
      .from('app_comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Failed to delete comment:', error);
      return false;
    }
    await fetchComments();
    return true;
  }, [fetchComments]);

  const openCount = comments.filter(c => c.status === 'open').length;

  return {
    comments,
    loading,
    addComment,
    toggleResolved,
    deleteComment,
    openCount,
    refresh: fetchComments,
  };
}

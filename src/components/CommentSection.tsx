"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { MessageSquare, Send } from "lucide-react";
import Link from "next/link";

interface CommentSectionProps {
  promptId: number;
}

export default function CommentSection({ promptId }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Load comments & check user
  useEffect(() => {
    const fetchData = async () => {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // 2. Fetch comments + Author details
      // We join the 'profiles' table to get the username of the commenter
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id,
          created_at,
          content,
          user_id,
          profiles ( username, avatar_url )
        `)
        .eq('prompt_id', promptId)
        .order('created_at', { ascending: false });

      if (data) setComments(data);
    };

    fetchData();
  }, [promptId]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !user) return;
    setLoading(true);

    // Insert into DB
    const { error } = await supabase
      .from('comments')
      .insert({
        content: newComment,
        prompt_id: promptId,
        user_id: user.id
      });

    if (!error) {
      setNewComment("");
      // Refresh the list immediately manually to feel fast
      window.location.reload(); 
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: '4rem', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '2rem' }}>
      
      <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <MessageSquare size={20} color="var(--accent-purple)" />
        Discussion ({comments.length})
      </h3>

      {/* Input Box (Only if logged in) */}
      {user ? (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '2rem' }}>
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Ask a question or leave a review..."
            style={{
              width: '100%',
              padding: '12px',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white',
              outline: 'none'
            }}
          />
          <button 
            onClick={handlePostComment}
            disabled={loading}
            style={{
              background: 'var(--accent-purple)',
              border: 'none',
              borderRadius: '8px',
              padding: '0 15px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <Send size={18} />
          </button>
        </div>
      ) : (
        <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#888', marginBottom: '0.5rem' }}>Login to join the discussion.</p>
            <Link href="/auth">
                <button style={{ background: 'transparent', border: '1px solid var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '5px 15px', borderRadius: '4px', cursor: 'pointer' }}>
                    Sign In
                </button>
            </Link>
        </div>
      )}

      {/* List of Comments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {comments.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No comments yet. Be the first!</p>
        ) : (
            comments.map((comment) => (
                <div key={comment.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)', fontSize: '0.9rem' }}>
                            @{comment.profiles?.username || "User"}
                        </span>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>
                            {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                    </div>
                    <p style={{ color: '#ccc', lineHeight: '1.5' }}>{comment.content}</p>
                </div>
            ))
        )}
      </div>

    </div>
  );
}
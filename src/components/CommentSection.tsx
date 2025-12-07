"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { MessageSquare, Send } from "lucide-react";

interface CommentSectionProps {
  promptId: number;
}

export default function CommentSection({ promptId }: CommentSectionProps) {
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      const { data } = await supabase
        .from('comments')
        .select(`
          id,
          created_at,
          content,
          user_id,
          profiles ( username )
        `)
        .eq('prompt_id', promptId)
        .order('created_at', { ascending: false });

      if (data) setComments(data);
    };

    fetchData();
  }, [promptId]);

  const handlePostComment = async () => {
    if (!newComment.trim() || !user) return;

    // 1. Insert the Comment
    const { error } = await supabase
      .from('comments')
      .insert({
        content: newComment,
        prompt_id: promptId,
        user_id: user.id
      });

    if (!error) {
      setNewComment("");
      
      // 2. --- NOTIFICATION LOGIC ---
      // Fetch Prompt Owner first
      const { data: prompt } = await supabase
        .from('prompts')
        .select('author_id, title')
        .eq('id', promptId)
        .single();

      // Only notify if we are NOT the owner commenting on our own post
      if (prompt && prompt.author_id !== user.id) {
          await supabase.from('notifications').insert({
              user_id: prompt.author_id, // The Owner gets the alert
              actor_id: user.id, // Me (The Commenter)
              type: 'comment',
              message: `commented on ${prompt.title}: "${newComment.substring(0, 20)}..."`,
              link: `/prompt/${promptId}`
          });
      }
      
      // Refresh page to see new comment
      window.location.reload(); 
    }
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
        <p style={{ color: '#888', marginBottom: '2rem', fontStyle: 'italic' }}>
            Login to join the discussion.
        </p>
      )}

      {/* List of Comments */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {comments.map((comment) => (
            <div key={comment.id} style={{ background: 'rgba(0,0,0,0.2)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 'bold', color: 'var(--accent-cyan)' }}>
                        @{comment.profiles?.username || "User"}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: '#666' }}>
                        {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                </div>
                <p style={{ color: '#ccc', lineHeight: '1.5' }}>{comment.content}</p>
            </div>
        ))}
      </div>

    </div>
  );
}
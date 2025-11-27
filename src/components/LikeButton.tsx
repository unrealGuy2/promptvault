"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface LikeButtonProps {
  promptId: number;
  initialCount?: number;
}

export default function LikeButton({ promptId }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, [promptId]);

  const checkStatus = async () => {
    // 1. Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (user) setUserId(user.id);

    // 2. Get Total Likes count
    const { count: total } = await supabase
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('prompt_id', promptId);
    
    setCount(total || 0);

    // 3. Check if WE liked it (only if logged in)
    if (user) {
      const { data } = await supabase
        .from('likes')
        .select('*')
        .eq('prompt_id', promptId)
        .eq('user_id', user.id)
        .single();
      
      if (data) setLiked(true);
    }
  };

  const toggleLike = async (e: any) => {
    e.preventDefault();
    e.stopPropagation(); // Don't click the card link
    
    if (!userId) {
        alert("Please sign in to like prompts.");
        return;
    }
    if (loading) return;
    setLoading(true);

    if (liked) {
      // UNLIKE
      await supabase.from('likes').delete().eq('prompt_id', promptId).eq('user_id', userId);
      setLiked(false);
      setCount(prev => prev - 1);
    } else {
      // LIKE
      await supabase.from('likes').insert({ prompt_id: promptId, user_id: userId });
      setLiked(true);
      setCount(prev => prev + 1);
    }
    setLoading(false);
  };

  return (
    <button 
      onClick={toggleLike}
      style={{
        background: 'transparent',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        cursor: 'pointer',
        color: liked ? '#ff4444' : '#888',
        transition: 'all 0.2s'
      }}
    >
      <Heart size={18} fill={liked ? "#ff4444" : "none"} />
      <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{count}</span>
    </button>
  );
}
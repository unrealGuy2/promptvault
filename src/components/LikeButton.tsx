"use client";
import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface LikeButtonProps {
  promptId: number;
}

export default function LikeButton({ promptId }: LikeButtonProps) {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, [promptId]);

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
        setUserId(user.id);
        const { data } = await supabase.from('likes').select('*').eq('prompt_id', promptId).eq('user_id', user.id).single();
        if (data) setLiked(true);
    }

    const { count: total } = await supabase.from('likes').select('*', { count: 'exact', head: true }).eq('prompt_id', promptId);
    setCount(total || 0);
  };

  const toggleLike = async (e: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!userId) { alert("Please sign in."); return; }

    if (liked) {
      // UNLIKE
      await supabase.from('likes').delete().eq('prompt_id', promptId).eq('user_id', userId);
      setLiked(false);
      setCount(prev => prev - 1);
    } else {
      // LIKE
      const { error } = await supabase.from('likes').insert({ prompt_id: promptId, user_id: userId });
      setLiked(true);
      setCount(prev => prev + 1);

      if (!error) {
        // 1. Get Prompt Owner
        const { data: prompt } = await supabase.from('prompts').select('author_id, title').eq('id', promptId).single();
        
        // 2. Send Notification (If not liking our own post)
        if (prompt && prompt.author_id !== userId) {
            await supabase.from('notifications').insert({
                user_id: prompt.author_id, // Owner gets alert
                actor_id: userId, // Me
                type: 'like',
                message: `liked your prompt: ${prompt.title.substring(0, 20)}...`,
                link: `/prompt/${promptId}`
            });
        }
      }
    }
  };

  return (
    <button onClick={toggleLike} style={{ background: 'transparent', border: 'none', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', color: liked ? '#ff4444' : '#888' }}>
      <Heart size={18} fill={liked ? "#ff4444" : "none"} />
      <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{count}</span>
    </button>
  );
}
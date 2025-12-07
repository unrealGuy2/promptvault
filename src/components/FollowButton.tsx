"use client";
import { useState, useEffect } from "react";
import { UserPlus, UserCheck } from "lucide-react";
import { supabase } from "../lib/supabaseClient";

interface FollowButtonProps {
  targetUserId: string; // The person we want to follow
}

export default function FollowButton({ targetUserId }: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  useEffect(() => {
    checkFollowStatus();
  }, [targetUserId]);

  const checkFollowStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        setLoading(false);
        return;
    }
    setCurrentUserId(user.id);

    // 1. Fetch our own profile to get the username (for the notification link)
    const { data: profile } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .single();
    
    if (profile) setCurrentUsername(profile.username);

    // 2. Don't let users follow themselves
    if (user.id === targetUserId) {
        setLoading(false);
        return;
    }

    // 3. Check DB to see if already following
    const { data } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', user.id)
      .eq('following_id', targetUserId)
      .single();

    if (data) setIsFollowing(true);
    setLoading(false);
  };

  const toggleFollow = async () => {
    if (!currentUserId) {
        alert("Please login to follow creators.");
        return;
    }
    
    // Optimistic Update (Change UI immediately)
    const previousState = isFollowing;
    setIsFollowing(!isFollowing);

    if (previousState) {
      // UNFOLLOW
      await supabase
        .from('follows')
        .delete()
        .eq('follower_id', currentUserId)
        .eq('following_id', targetUserId);
    } else {
      // FOLLOW
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: currentUserId,
          following_id: targetUserId
        });

      // --- SEND NOTIFICATION (Only if follow succeeded) ---
      if (!error) {
          await supabase.from('notifications').insert({
            user_id: targetUserId, // The person receiving the follow
            actor_id: currentUserId, // Me (Who triggered it)
            type: 'follow',
            message: 'started following you.',
            link: currentUsername ? `/u/${currentUsername}` : '#' // Link to my profile
          });
      }
    }
  };

  if (loading || currentUserId === targetUserId) return null; // Hide if loading or self

  return (
    <button 
      onClick={toggleFollow}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '8px 16px',
        borderRadius: '20px',
        border: isFollowing ? '1px solid rgba(255,255,255,0.2)' : 'none',
        background: isFollowing ? 'transparent' : 'white',
        color: isFollowing ? 'white' : 'black',
        fontWeight: 'bold',
        cursor: 'pointer',
        transition: 'all 0.2s'
      }}
    >
      {isFollowing ? <UserCheck size={16} /> : <UserPlus size={16} />}
      {isFollowing ? "Following" : "Follow"}
    </button>
  );
}
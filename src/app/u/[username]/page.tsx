"use client";
import { useEffect, useState } from "react";
import { MapPin, ShieldCheck, Trophy, Zap, AlertCircle, Loader } from "lucide-react"; 
import styles from "./page.module.scss";
import PromptCard from "../../../components/PromptCard"; 
import FollowButton from "../../../components/FollowButton"; // <--- NEW
import { supabase } from "../../../lib/supabaseClient";
import { useParams } from "next/navigation";

export default function PublicProfile() {
  const params = useParams();
  const rawUsername = params.username as string;
  const username = decodeURIComponent(rawUsername);

  const [profile, setProfile] = useState<any>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [followerCount, setFollowerCount] = useState(0);

  useEffect(() => {
    const getPublicData = async () => {
      setLoading(true);

      // 1. Find User
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (!profileData) {
        setLoading(false);
        return;
      }

      setProfile(profileData);

      // 2. Fetch Prompts
      const { data: userPrompts } = await supabase
        .from('prompts')
        .select('*')
        .eq('author_id', profileData.id)
        .order('created_at', { ascending: false });

      if (userPrompts) setPrompts(userPrompts);

      // 3. Count Followers
      const { count } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', profileData.id);
      
      setFollowerCount(count || 0);
      setLoading(false);
    };

    if (username) getPublicData();
  }, [username]);

  // Helper to render Badge Icons
  const renderBadge = (badge: string) => {
    switch(badge) {
        case 'verified': 
            return <span title="Verified Creator" style={{color:'#00f3ff'}}><ShieldCheck size={18} fill="rgba(0,243,255,0.2)" /></span>;
        case 'top-1%': 
            return <span title="Top 1% Seller" style={{color:'#ffd700'}}><Trophy size={18} fill="rgba(255,215,0,0.2)" /></span>;
        case 'automation-king': 
            return <span title="Automation Challenge Winner" style={{color:'#ff0080'}}><Zap size={18} fill="rgba(255,0,128,0.2)" /></span>;
        default: return null;
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px', color: 'white' }}><Loader className="animate-spin" /></div>;
  if (!profile) return <div style={{ textAlign: 'center', marginTop: '100px', color: '#ff4444' }}>User Not Found</div>;

  return (
    <main className={styles.container}>
      
      {/* HEADER */}
      <section className={styles.header}>
        <div className={styles.avatar}>
          {profile.username?.charAt(0).toUpperCase() || "U"}
        </div>

        <div className={styles.info}>
          <div className={styles.nameRow}>
            <h1>{profile.username}</h1>
            
            {/* BADGES ROW */}
            <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                {profile.badges && profile.badges.map((b: string) => renderBadge(b))}
            </div>

            {/* FOLLOW BUTTON */}
            <div style={{ marginLeft: '1rem' }}>
                <FollowButton targetUserId={profile.id} />
            </div>
          </div>

          <p className={styles.bio}>{profile.bio || "No bio set."}</p>
          
          <div className={styles.stats}>
            <div><span>{prompts.length}</span><span>Prompts</span></div>
            <div><span>{followerCount}</span><span>Followers</span></div>
          </div>
        </div>
      </section>

      <div className={styles.grid}>
        {prompts.map((prompt: any) => (
            <div key={prompt.id} onClick={() => window.location.href = `/prompt/${prompt.id}`}>
                <PromptCard 
                    id={prompt.id}
                    tool={prompt.ai_model || "AI"}
                    title={prompt.title}
                    description={prompt.description}
                    author={profile.username}
                    price={prompt.price || "Free"}
                />
            </div>
        ))}
      </div>
    </main>
  );
}
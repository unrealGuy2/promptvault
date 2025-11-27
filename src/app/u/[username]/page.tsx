"use client";
import { useEffect, useState } from "react";
import { MapPin, Link as LinkIcon, UserPlus, Loader, AlertCircle } from "lucide-react"; 
import styles from "./page.module.scss";
import PromptCard from "../../../components/PromptCard"; // Go up 3 levels
import { supabase } from "../../../lib/supabaseClient";
import { useParams } from "next/navigation";

export default function PublicProfile() {
  const params = useParams();
  // The username from the URL (e.g., "HunterX4")
  // We need to decode it because URLs change spaces to %20
  const rawUsername = params.username as string;
  const username = decodeURIComponent(rawUsername);

  const [profile, setProfile] = useState<any>(null);
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPublicData = async () => {
      setLoading(true);

      // 1. Find the User by their Username
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (!profileData) {
        setLoading(false);
        return; // User not found
      }

      setProfile(profileData);

      // 2. Fetch Prompts by this User's ID
      const { data: userPrompts } = await supabase
        .from('prompts')
        .select('*')
        .eq('author_id', profileData.id) // Use the ID we just found
        .order('created_at', { ascending: false });

      if (userPrompts) {
        setPrompts(userPrompts);
      }
      setLoading(false);
    };

    if (username) {
        getPublicData();
    }
  }, [username]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px', color: 'white' }}>
        <Loader className="animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
        <div style={{ textAlign: 'center', marginTop: '100px', color: '#ff4444' }}>
            <AlertCircle size={40} style={{ margin: '0 auto', display: 'block', marginBottom: '10px' }}/>
            <h2>User Not Found</h2>
            <p>The user "@{username}" does not exist.</p>
        </div>
    );
  }

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
            
            {/* FOLLOW BUTTON (Visual only for now) */}
            <button className={styles.editBtn}>
                <UserPlus size={14} style={{ marginRight: '5px' }}/> 
                Follow
            </button>
          </div>

          <p className={styles.bio}>
            {profile.bio || "No bio set."}
          </p>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#888' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={14}/> Earth</span>
          </div>

          <div className={styles.stats}>
            <div>
              <span>{prompts.length}</span>
              <span>Prompts</span>
            </div>
            <div>
              <span>0</span>
              <span>Followers</span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.active}`}>Deployments</button>
      </div>

      <div className={styles.grid}>
        {prompts.length === 0 ? (
            <div style={{ color: '#666', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                This user hasn't deployed any prompts yet.
            </div>
        ) : (
            prompts.map((prompt: any) => (
                <div key={prompt.id} onClick={() => window.location.href = `/prompt/${prompt.id}`}>
                    <PromptCard 
                        id={prompt.id} // <--- ADD THIS
                        tool={prompt.ai_model || "AI Tool"}
                        title={prompt.title || "Untitled"}
                        description={prompt.description || "No description"}
                        author={profile.username}
                        price={prompt.price || "Free"}
                    />
                </div>
            ))
        )}
      </div>

    </main>
  );
}
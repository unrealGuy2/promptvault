"use client";
import { useEffect, useState } from "react";
// Added 'Plus' icon
import { MapPin, Link as LinkIcon, Edit, Loader, Settings, Plus } from "lucide-react"; 
import styles from "./page.module.scss";
import PromptCard from "../../components/PromptCard";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  
  const [user, setUser] = useState<any>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [prompts, setPrompts] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }
      setUser(user);

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (profile) setProfileData(profile);

      const { data: userPrompts } = await supabase
        .from('prompts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (userPrompts) setPrompts(userPrompts);
      setLoading(false);
    };

    getData();
  }, [router]);

  if (loading) {
    return (
      <main className={styles.container} style={{ display: 'flex', justifyContent: 'center', height: '50vh', alignItems: 'center' }}>
        <Loader className="animate-spin" size={40} color="var(--accent-cyan)" />
      </main>
    );
  }

  return (
    <main className={styles.container}>
      
      <section className={styles.header}>
        <div className={styles.avatar}>
          {profileData?.username?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
        </div>

        <div className={styles.info}>
          <div className={styles.nameRow}>
            <h1>{profileData?.username || "Unnamed Engineer"}</h1>
            
            <div style={{ display: 'flex', gap: '10px' }}>
                {/* 1. EDIT PROFILE BUTTON */}
                <Link href="/onboarding" style={{ textDecoration: 'none' }}>
                    <button className={styles.editBtn} style={{ display: 'flex', alignItems: 'center' }}>
                        <Settings size={14} style={{ marginRight: '5px' }}/> 
                        Edit
                    </button>
                </Link>

                {/* 2. NEW PROMPT BUTTON (Only for Engineers) */}
                {profileData?.role === 'engineer' && (
                    <Link href="/sell" style={{ textDecoration: 'none' }}>
                        <button className={styles.editBtn} style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            borderColor: 'var(--accent-cyan)', 
                            color: 'var(--accent-cyan)',
                            background: 'rgba(0, 243, 255, 0.05)'
                        }}>
                            <Plus size={14} style={{ marginRight: '5px' }}/> 
                            New Prompt
                        </button>
                    </Link>
                )}
            </div>
          </div>

          <div className={styles.bio}>
            {profileData?.bio ? <p>{profileData.bio}</p> : <p style={{ color: '#666', fontStyle: 'italic' }}>No bio set yet.</p>}
            
            {profileData?.role && (
                <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '4px 8px', borderRadius: '4px', marginTop: '10px', display: 'inline-block', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {profileData.role}
                </span>
            )}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', fontSize: '0.9rem', color: '#888' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><MapPin size={14}/> Earth</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><LinkIcon size={14}/> promptvault.com</span>
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
            <div>
              <span>0</span>
              <span>Sales</span>
            </div>
          </div>
        </div>
      </section>

      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.active}`}>My Deployments</button>
        <button className={styles.tab}>Saved</button>
      </div>

      <div className={styles.grid}>
        {prompts.length === 0 ? (
            <div style={{ color: '#666', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                You haven't deployed any prompts yet. <br />
                {profileData?.role === 'engineer' ? (
                    <Link href="/sell" style={{ color: 'var(--accent-cyan)' }}>Start Selling &rarr;</Link>
                ) : (
                    <span>Switch role to 'Engineer' to start selling.</span>
                )}
            </div>
        ) : (
            prompts.map((prompt: any) => (
                <div key={prompt.id} onClick={() => window.location.href = `/prompt/${prompt.id}`}>
                    <PromptCard 
                        id={prompt.id} // <--- ADD THIS
                        tool={prompt.ai_model || "AI Tool"}
                        title={prompt.title || "Untitled"}
                        description={prompt.description || "No description"}
                        author={profileData?.username || "Me"}
                        price={prompt.price || "Free"}
                    />
                </div>
            ))
        )}
      </div>

    </main>
  );
}
"use client";
import { useEffect, useState } from "react";
// Swapped Edit3/Loader2 for standard icons to prevent version errors
import { MapPin, Link as LinkIcon, Edit, Loader } from "lucide-react"; 
import styles from "./page.module.scss";
import PromptCard from "../../components/PromptCard";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  
  // We use <any> to ignore strict TypeScript warnings for now
  const [user, setUser] = useState<any>(null);
  const [prompts, setPrompts] = useState<any[]>([]); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/auth');
        return;
      }
      setUser(user);

      const { data: userPrompts, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('author_id', user.id)
        .order('created_at', { ascending: false });

      if (userPrompts) {
        setPrompts(userPrompts);
      }
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
      
      {/* HEADER */}
      <section className={styles.header}>
        <div className={styles.avatar}>
          {/* Safety check: if email is missing, show 'U' */}
          {user?.email?.charAt(0).toUpperCase() || "U"}
        </div>

        <div className={styles.info}>
          <div className={styles.nameRow}>
            {/* Show username or email part */}
            <h1>{user?.user_metadata?.username || user?.email?.split('@')[0]}</h1>
            <button className={styles.editBtn}>
                <Edit size={14} style={{ marginRight: '5px' }}/> 
                Edit Profile
            </button>
          </div>

          <p className={styles.bio}>
            Prompt Engineer & Automation Enthusiast.
          </p>
          
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

      {/* TABS */}
      <div className={styles.tabs}>
        <button className={`${styles.tab} ${styles.active}`}>My Deployments</button>
        <button className={styles.tab}>Saved</button>
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        {prompts.length === 0 ? (
            <div style={{ color: '#666', gridColumn: '1 / -1', textAlign: 'center', padding: '2rem' }}>
                You haven't deployed any prompts yet. <br />
                <a href="/sell" style={{ color: 'var(--accent-cyan)' }}>Start Selling &rarr;</a>
            </div>
        ) : (
            prompts.map((prompt: any) => (
                <PromptCard 
                    key={prompt.id}
                    // SAFETY CHECKS: The || "" prevents errors if DB is empty
                    tool={prompt.ai_model || "AI Tool"}
                    title={prompt.title || "Untitled"}
                    description={prompt.description || "No description"}
                    author={prompt.author_name || "Me"}
                    price={prompt.price || "Free"}
                />
            ))
        )}
      </div>

    </main>
  );
}
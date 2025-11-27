"use client";
import { useEffect, useState } from "react";
import { Lock, GitFork, AlertCircle, Loader } from "lucide-react"; 
import styles from "./page.module.scss";
import { supabase } from "../../../lib/supabaseClient"; 
import { useParams } from "next/navigation";
// Import the new Comment Section
import CommentSection from "../../../components/CommentSection";

export default function PromptDetails() {
  const params = useParams();
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getPrompt = async () => {
      // 1. Fetch the specific prompt by ID
      const { data, error } = await supabase
        .from('prompts')
        .select('*')
        .eq('id', params.id)
        .single();

      if (data) {
        setPrompt(data);
      }
      setLoading(false);
    };

    if (params.id) {
        getPrompt();
    }
  }, [params.id]);

  if (loading) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px', color: 'white' }}>
            <Loader className="animate-spin" />
        </div>
    );
  }

  if (!prompt) {
    return (
        <div style={{ textAlign: 'center', marginTop: '100px', color: '#ff4444' }}>
            <AlertCircle size={40} style={{ margin: '0 auto', display: 'block', marginBottom: '10px' }}/>
            <h2>Prompt Not Found</h2>
            <p>This prompt might have been deleted.</p>
        </div>
    );
  }

  return (
    <main className={styles.container}>
      
      {/* LEFT SIDE: Content */}
      <div className={styles.content}>
        <div className={styles.tags}>
          <span className={styles.tag}>{prompt.ai_model || "AI"}</span>
          <span className={styles.tag}>Generative AI</span>
        </div>

        <h1 className={styles.title}>{prompt.title}</h1>
        
        {/* Real Image from Database */}
        <div className={styles.previewImage} style={{ 
            backgroundImage: prompt.image_url ? `url(${prompt.image_url})` : 'none',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
        }}>
          {!prompt.image_url && "[ No Preview Image ]"}
        </div>

        <h2 className={styles.sectionTitle}>Description</h2>
        <p className={styles.description}>
          {prompt.description}
        </p>

        <h2 className={styles.sectionTitle}>The Prompt</h2>
        <div className={styles.promptBox}>
          
          {/* We show a blurred version */}
          <div style={{ filter: 'blur(5px)', userSelect: 'none', opacity: 0.5 }}>
             {prompt.prompt_content?.substring(0, 50)}... [Content Hidden] ...
          </div>

          <div className={styles.blurOverlay}>
            <Lock size={32} color="white" />
            <p>Purchase to Unlock</p>
          </div>
        </div>

        {/* --- NEW: DISCUSSION SECTION --- */}
        <CommentSection promptId={prompt.id} />

      </div>

      {/* RIGHT SIDE: Checkout & Actions */}
      <aside className={styles.sidebar}>
        <div className={styles.checkoutCard}>
          <span className={styles.price}>{prompt.price}</span>
          <span className={styles.sub}>One-time payment</span>

          <button className={styles.buyBtn}>
            Buy Prompt Access
          </button>

          <button style={{
            width: '100%',
            marginTop: '1rem',
            padding: '12px',
            background: 'transparent',
            border: '1px solid var(--glass-border)',
            color: 'var(--text-muted)',
            borderRadius: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.9rem',
            transition: 'all 0.2s'
          }}>
            <GitFork size={16} />
            Fork this Prompt
          </button>
          
          <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: '#888' }}>
            <p>✅ Instant Access</p>
            <p>✅ Support from @{prompt.author_name || "Engineer"}</p>
          </div>
        </div>
      </aside>

    </main>
  );
}
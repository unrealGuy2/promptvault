"use client";
import { useEffect, useState } from "react";
import { Lock, GitFork, AlertCircle, Loader, Trash2 } from "lucide-react"; // Added Trash2
import styles from "./page.module.scss";
import { supabase } from "../../../lib/supabaseClient"; 
import { useParams, useRouter } from "next/navigation"; // Added useRouter
import CommentSection from "../../../components/CommentSection";

export default function PromptDetails() {
  const params = useParams();
  const router = useRouter(); // To redirect after delete
  
  const [prompt, setPrompt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null); // Track who is looking

  useEffect(() => {
    const getData = async () => {
      // 1. Get Current User
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);

      // 2. Get Prompt
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

    if (params.id) getData();
  }, [params.id]);

  // DELETE FUNCTION
  const handleDelete = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete this prompt? This cannot be undone.");
    if (!confirmDelete) return;

    // Delete from DB (Comments and Likes will auto-delete because of 'cascade')
    const { error } = await supabase
        .from('prompts')
        .delete()
        .eq('id', prompt.id);

    if (error) {
        alert("Error deleting: " + error.message);
    } else {
        alert("Prompt deleted.");
        router.push('/profile'); // Go back to profile
    }
  };

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

  // Check if I am the owner
  const isOwner = currentUser && currentUser.id === prompt.author_id;

  return (
    <main className={styles.container}>
      
      {/* LEFT SIDE */}
      <div className={styles.content}>
        <div className={styles.tags}>
          <span className={styles.tag}>{prompt.ai_model || "AI"}</span>
          <span className={styles.tag}>Generative AI</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <h1 className={styles.title}>{prompt.title}</h1>
            
            {/* ONLY SHOW IF OWNER */}
            {isOwner && (
                <button 
                    onClick={handleDelete}
                    style={{ 
                        background: 'rgba(255, 68, 68, 0.1)', 
                        color: '#ff4444', 
                        border: '1px solid #ff4444', 
                        padding: '8px 12px', 
                        borderRadius: '6px', 
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px'
                    }}
                >
                    <Trash2 size={16} /> Delete
                </button>
            )}
        </div>
        
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
          <div style={{ filter: 'blur(5px)', userSelect: 'none', opacity: 0.5 }}>
             {prompt.prompt_content?.substring(0, 50)}... [Content Hidden] ...
          </div>
          <div className={styles.blurOverlay}>
            <Lock size={32} color="white" />
            <p>Purchase to Unlock</p>
          </div>
        </div>

        <CommentSection promptId={prompt.id} />
      </div>

      {/* RIGHT SIDE */}
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
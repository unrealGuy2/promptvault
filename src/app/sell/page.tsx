"use client";
import { useState, useEffect, Suspense } from "react";
import { UploadCloud, Loader, GitFork } from "lucide-react";
import styles from "./page.module.scss";
import { supabase } from "../../lib/supabaseClient";
import { useRouter, useSearchParams } from "next/navigation";

function SellForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const forkId = searchParams.get('fork'); // Check if we are forking

  const [loading, setLoading] = useState(false);
  const [fetchingFork, setFetchingFork] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [aiModel, setAiModel] = useState("GPT-4");
  const [category, setCategory] = useState("Student");
  const [promptContent, setPromptContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const init = async () => {
      // 1. Check Auth
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }
      setUser(user);

      // 2. If Forking, Fetch Original Data
      if (forkId) {
        setFetchingFork(true);
        const { data: original } = await supabase
            .from('prompts')
            .select('*')
            .eq('id', forkId)
            .single();
        
        if (original) {
            setTitle(`Remix: ${original.title}`); // Auto-rename
            setDescription(`Forked from ${original.author_name}. ${original.description}`);
            setAiModel(original.ai_model);
            setCategory(original.category || "Student");
            setPromptContent(original.prompt_content);
            // We don't copy the image or price, let them set new ones
        }
        setFetchingFork(false);
      }
    };
    init();
  }, [router, forkId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      let imageUrl = null;

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `${user.id}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('prompt-images').upload(filePath, imageFile);
        if (uploadError) throw uploadError;
        const { data: publicData } = supabase.storage.from('prompt-images').getPublicUrl(filePath);
        imageUrl = publicData.publicUrl;
      }

      const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single();
      const authorName = profile?.username || user.email?.split('@')[0] || "Engineer";

      const { error: insertError } = await supabase
        .from('prompts')
        .insert({
          title, description, price: price || "Free", ai_model: aiModel, category,
          prompt_content: promptContent, image_url: imageUrl,
          author_id: user.id, author_name: authorName
        });

      if (insertError) throw insertError;
      alert("Prompt deployed successfully! 🚀");
      router.push('/profile');

    } catch (error: any) {
      console.error(error);
      alert("Error uploading: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetchingFork) return <div style={{padding:'4rem', textAlign:'center', color:'white'}}>Fetching original prompt...</div>;

  return (
    <main className={styles.container}>
      <header className={styles.header}>
        {forkId ? (
            // Show Fork Header if Remixing
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                <span style={{ background: 'rgba(0,255,136,0.1)', color: '#00ff88', padding: '5px 15px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <GitFork size={16}/> Fork Mode Active
                </span>
                <h1>Remix & Improve</h1>
            </div>
        ) : (
            <>
                <h1>Deploy a Prompt</h1>
                <p>Share your specialized prompts with the right audience.</p>
            </>
        )}
      </header>

      <form className={styles.form} onSubmit={handleUpload}>
        <div className={styles.row}>
          <div className={styles.group}>
            <label>Prompt Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>
          <div className={styles.group}>
            <label>AI Model</label>
            <select value={aiModel} onChange={(e) => setAiModel(e.target.value)}>
              <option>GPT-4</option>
              <option>GPT-3.5</option>
              <option>Midjourney</option>
              <option>Claude 3</option>
              <option>Stable Diffusion</option>
              <option>DALL-E 3</option>
            </select>
          </div>
        </div>

        <div className={styles.row}>
            <div className={styles.group}>
                <label>Target Audience (Category)</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ border: '1px solid var(--accent-purple)' }}>
                    <option value="Student">🎓 Student / Academic</option>
                    <option value="Business">💼 Business / Corporate</option>
                    <option value="Creative">🎨 Creative / Artist</option>
                    <option value="Developer">💻 Developer / Coder</option>
                </select>
            </div>
            <div className={styles.group}>
                <label>Price (Naira)</label>
                <input type="text" placeholder="e.g. 1000" value={price} onChange={(e) => setPrice(e.target.value)} />
            </div>
        </div>

        <div className={styles.group}>
          <label>Public Description</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} required />
        </div>

        <div className={styles.group}>
          <label className={styles.secretLabel}><UploadCloud size={18} /> The Prompt Code (Hidden)</label>
          <textarea className={styles.secretInput} rows={6} value={promptContent} onChange={(e) => setPromptContent(e.target.value)} required />
        </div>

        <div className={styles.group}>
          <label>Result Image (Optional)</label>
          <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
        </div>

        <button className={styles.submitBtn} disabled={loading}>
          {loading ? <Loader className="animate-spin" /> : (forkId ? "Deploy Remix" : "Deploy to Market")}
        </button>
      </form>
    </main>
  );
}

// Wrap in Suspense for Next.js 14
export default function SellPrompt() {
    return (
        <Suspense fallback={<div style={{color:'white', padding:'2rem'}}>Loading...</div>}>
            <SellForm />
        </Suspense>
    )
}
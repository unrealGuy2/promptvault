"use client";
import { useState, useEffect } from "react";
import { UploadCloud, DollarSign } from "lucide-react";
import styles from "./page.module.scss";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function SellPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<any>(null);

  // Form Data
  const [title, setTitle] = useState("");
  const [model, setModel] = useState("Midjourney v6");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [promptContent, setPromptContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Check if user is logged in
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth'); // Kick them out if not logged in
      }
      setUser(user);
    };
    getUser();
  }, [router]);

  const handleDeploy = async () => {
    if (!title || !promptContent || !user) {
      alert("Please fill in the Title and Prompt Content.");
      return;
    }
    
    setLoading(true);

    try {
      let imageUrl = "";

      // 1. Upload Image (if selected)
      if (imageFile) {
        const fileName = `${Date.now()}-${imageFile.name}`; // Unique name
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('prompt-images')
          .upload(fileName, imageFile);

        if (uploadError) throw uploadError;
        
        // Get the Public URL so we can display it later
        const { data: publicUrlData } = supabase.storage
          .from('prompt-images')
          .getPublicUrl(fileName);
          
        imageUrl = publicUrlData.publicUrl;
      }

      // 2. Insert Data into Database
      const finalPrice = price ? `$${price}` : "Free"; // Handle empty price as Free

      const { error: dbError } = await supabase
        .from('prompts')
        .insert([
          {
            title,
            description,
            price: finalPrice,
            ai_model: model,
            prompt_content: promptContent,
            image_url: imageUrl,
            author_id: user.id,
            author_name: user.user_metadata?.username || "Engineer", // Use username from signup
          },
        ]);

      if (dbError) throw dbError;

      alert("Prompt Deployed Successfully!");
      router.push('/profile'); // Send them to their profile

    } catch (error: any) {
      alert("Error deploying prompt: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      
      <div className={styles.header}>
        <h1>Deploy New Prompt</h1>
        <p>Monetize your engineering skills. Upload your prompt to the vault.</p>
      </div>

      <div className={styles.form}>
        
        {/* Title */}
        <div className={styles.formGroup}>
          <label>Project Title</label>
          <input 
            type="text" 
            className={styles.input} 
            placeholder="e.g. Hyper-Realistic Portrait Generator"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Category & Model Row */}
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label>AI Model</label>
            <select className={styles.select} value={model} onChange={(e) => setModel(e.target.value)}>
              <option>Midjourney v6</option>
              <option>GPT-4</option>
              <option>DALL-E 3</option>
              <option>Stable Diffusion</option>
              <option>Claude 3</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Price ($) <span style={{fontSize: '0.8rem', color: '#888'}}>(Leave empty for Free)</span></label>
            <div style={{ position: 'relative' }}>
              <input 
                type="number" 
                className={styles.input} 
                placeholder="4.99" 
                style={{ paddingLeft: '2.5rem' }} 
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
              <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: '#888' }} />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className={styles.formGroup}>
          <label>Description</label>
          <textarea 
            className={styles.textarea} 
            placeholder="Describe what your prompt does..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          ></textarea>
        </div>

        {/* The Prompt Code */}
        <div className={styles.formGroup}>
          <label>The Prompt Code <span style={{ color: 'var(--accent-cyan)', fontSize: '0.8rem' }}>*Locked until purchased</span></label>
          <textarea 
            className={styles.textarea} 
            style={{ fontFamily: 'monospace', color: 'var(--accent-cyan)' }}
            placeholder="/imagine prompt: ..."
            value={promptContent}
            onChange={(e) => setPromptContent(e.target.value)}
          ></textarea>
        </div>

        {/* Image Upload */}
        <div className={styles.formGroup}>
            <label>Result Preview Image</label>
            {/* Hidden real input, customized label */}
            <input 
              type="file" 
              id="fileInput" 
              style={{ display: 'none' }} 
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
            />
            
            <label htmlFor="fileInput" className={styles.uploadBox} style={{ borderColor: imageFile ? 'var(--accent-cyan)' : 'var(--glass-border)' }}>
                <UploadCloud size={40} color={imageFile ? 'var(--accent-cyan)' : 'currentColor'} />
                <p>{imageFile ? `Selected: ${imageFile.name}` : "Click to upload result.png"}</p>
            </label>
        </div>

        <button 
          onClick={handleDeploy} 
          className={styles.submitBtn} 
          disabled={loading}
          style={{ opacity: loading ? 0.5 : 1 }}
        >
          {loading ? "Uploading to Vault..." : "Deploy to Marketplace"}
        </button>

      </div>
    </main>
  );
}
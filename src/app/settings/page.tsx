"use client";

import { useState, useEffect } from "react";
// FIX: Using the new library that works with Next.js 15
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { User, Camera, Save, Loader2, Terminal } from "lucide-react";
// Ensure this path matches your file structure
import styles from "./settings.module.scss"; 

export default function SettingsPage() {
  // FIX: Initialize client manually
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  // Form State
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [website, setWebsite] = useState("");
  const [bio, setBio] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      console.log("Current User:", user); 

      if (!user) {
        // Redirect disabled for now so you can debug if needed
        // router.push("/auth");
        console.log("No user found");
        setLoading(false);
        return;
      }
      setUser(user);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        setFullName(data.full_name || "");
        setUsername(data.username || "");
        setWebsite(data.website || "");
        setBio(data.bio || "");
        setAvatarUrl(data.avatar_url || "");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  async function uploadAvatar(event: any) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error("You must select an image to upload.");
      }

      const file = event.target.files[0];
      const fileExt = file.name.split(".").pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (uploadError) {
        console.error("Supabase Upload Error:", uploadError); // Check console for details
        throw uploadError;
      }

      const { data } = supabase.storage.from("avatars").getPublicUrl(filePath);
      setAvatarUrl(data.publicUrl);
    } catch (error) {
      alert("Error uploading avatar! Check console for details.");
      console.error(error);
    } finally {
      setUploading(false);
    }
  }

  async function updateProfile() {
    try {
      setSaving(true);
      
      const updates = {
        id: user?.id,
        full_name: fullName,
        username,
        website,
        bio,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("profiles")
        .upsert(updates);

      if (error) throw error;
      alert("Profile updated successfully!");
    } catch (error) {
      alert("Error updating the data!");
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <Loader2 className={`${styles.loader} h-8 w-8 text-green-500`} />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.settingsCard}>
        <div className={styles.header}>
            <h1><Terminal size={28} /> IDENTITY_CONFIG</h1>
            <p>// Configure your public persona node</p>
        </div>

        <div className={styles.avatarSection}>
            <div className={styles.avatarWrapper}>
                {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" />
                ) : (
                    <div className={styles.placeholder}>
                        <User size={40} />
                    </div>
                )}
                <div className={styles.overlay}>
                    <Camera size={24} />
                </div>
                <input
                    type="file"
                    accept="image/*"
                    onChange={uploadAvatar}
                    disabled={uploading}
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
            </div>
            <p className={styles.uploadText}>
                {uploading ? "UPLOADING..." : "CLICK TO CHANGE AVATAR"}
            </p>
        </div>

        <div className={styles.form}>
            <div className={styles.inputGroup}>
                <label>Username</label>
                <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="fazza"
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Display Name</label>
                <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Fazza Automations"
                />
            </div>
             <div className={styles.inputGroup}>
                <label>Website URL</label>
                <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://your-portfolio.com"
                />
            </div>
            <div className={styles.inputGroup}>
                <label>Bio / Expertise</label>
                <textarea
                    rows={4}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Explain what you build..."
                />
            </div>
            <button
                className={styles.saveButton}
                onClick={updateProfile}
                disabled={saving || !user}
            >
                {saving ? (
                    <Loader2 className={styles.loader} size={20} />
                ) : (
                    <>
                        <Save size={20} />
                        <span>SAVE CHANGES</span>
                    </>
                )}
            </button>
        </div>
      </div>
    </div>
  );
}
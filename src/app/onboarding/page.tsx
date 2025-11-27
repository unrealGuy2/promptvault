"use client";
import { useState, useEffect } from "react";
import { Camera, Loader } from "lucide-react";
import styles from "./page.module.scss";
// FIX: Ensure correct path to supabase
import { supabase } from "../../lib/supabaseClient"; 
import { useRouter } from "next/navigation";

export default function Onboarding() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Form Data
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState("explorer"); // Default to Explorer

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) router.push('/auth');
      setUser(user);
    };
    getUser();
  }, [router]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!user) return;

      // Insert or Update the profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
            id: user.id, // Links to their login email
            username,
            bio,
            role,
            avatar_url: "" // We can add image upload later to keep it fast
        });

      if (error) throw error;

      // Success! Redirect based on role
      if (role === 'engineer') {
        router.push('/sell'); // Engineers go straight to selling
      } else {
        router.push('/explore'); // Explorers go to shopping
      }

    } catch (error: any) {
      alert("Error saving profile: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Setup Profile</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Tell us how you want to use PromptVault.
      </p>

      <form className={styles.form} onSubmit={handleSaveProfile}>
        
        {/* Username */}
        <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Display Name</label>
            <input 
                type="text" 
                className={styles.input} 
                placeholder="e.g. CodeMaster" 
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
            />
        </div>

        {/* Bio */}
        <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Bio</label>
            <textarea 
                className={styles.textarea} 
                placeholder="Tell us what you build..." 
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                required
            ></textarea>
        </div>

        {/* Role Selector */}
        <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>I want to...</label>
            <select 
                className={styles.input} 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
            >
                <option value="explorer">Explore & Buy Prompts (Explorer)</option>
                <option value="engineer">Sell & Create Prompts (Engineer)</option>
            </select>
        </div>

        <button className={styles.btn} disabled={loading}>
            {loading ? "Saving..." : "Complete Setup →"}
        </button>

      </form>
    </main>
  );
}
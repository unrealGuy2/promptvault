"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import { Loader2, Github } from "lucide-react";
import Link from "next/link";
// IMPORTING THE CORRECT EXISTING FILE
import styles from "./page.module.scss"; 

export default function AuthPage() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      router.push("/settings");
      router.refresh();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGithubLogin() {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
      },
    });
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        
        {/* Header */}
        <div className={styles.header}>
          <h1>Welcome Back</h1>
          <p>Enter your credentials to access your terminal.</p>
        </div>

        {/* Form Container */}
        <div className={styles.form}>
          
          {/* Email Input */}
          <div className={styles.inputGroup}>
             <label>Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          {/* Password Input */}
          <div className={styles.inputGroup}>
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {/* Main Button */}
          <button
            onClick={handleSignIn}
            disabled={loading}
            className={styles.primaryButton}
          >
            {loading ? <Loader2 className="animate-spin" /> : "Sign In"}
          </button>

          {/* Divider */}
          <div className={styles.divider}>
            <span>Or</span>
          </div>

          {/* Github Button */}
          <button
            onClick={handleGithubLogin}
            className={styles.githubButton}
          >
            <Github size={20} />
            <span>Continue with GitHub</span>
          </button>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          New to PromptVault?
          <Link href="/signup">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
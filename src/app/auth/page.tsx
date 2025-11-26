"use client";
import { useState } from "react";
import { Github } from "lucide-react";
import styles from "./page.module.scss";
import { supabase } from "../../lib/supabaseClient"; // Import the connection
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  
  // Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState(""); // Only used for signup
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // 1. Handle Sign Up
  const handleSignUp = async () => {
    setLoading(true);
    setError(null);
    
    // Create user in Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username: username }, // Save username as metadata
      },
    });

    if (authError) {
      setError(authError.message);
    } else {
      setMessage("Success! Check your email to confirm your account.");
    }
    setLoading(false);
  };

  // 2. Handle Login
  const handleLogin = async () => {
    setLoading(true);
    setError(null);

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
    } else {
      // Login successful -> Go to Profile
      router.push("/profile");
      router.refresh(); // Refresh to update Navbar state later
    }
  };

  // Decide which function to call
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Stop page reload
    if (isLogin) {
      handleLogin();
    } else {
      handleSignUp();
    }
  };

  return (
    <main className={styles.container}>
      <div className={styles.authCard}>
        
        <h1 className={styles.title}>
          {isLogin ? "Welcome Back" : "Join the Vault"}
        </h1>
        <p className={styles.subtitle}>
          {isLogin 
            ? "Enter your credentials to access your terminal." 
            : "Create an account to start selling and buying prompts."}
        </p>

        {/* Error / Success Messages */}
        {error && <div style={{ color: '#ff4444', marginBottom: '1rem', background: 'rgba(255,0,0,0.1)', padding: '10px', borderRadius: '5px' }}>{error}</div>}
        {message && <div style={{ color: '#00ff88', marginBottom: '1rem', background: 'rgba(0,255,0,0.1)', padding: '10px', borderRadius: '5px' }}>{message}</div>}

        <form onSubmit={handleSubmit}>
          <div className={styles.inputGroup}>
            {!isLogin && (
                <input 
                  type="text" 
                  placeholder="Username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required={!isLogin}
                />
            )}
            <input 
              type="email" 
              placeholder="Email Address" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className={styles.submitBtn} disabled={loading}>
            {loading ? "Processing..." : (isLogin ? "Sign In" : "Create Account")}
          </button>
        </form>

        <div className={styles.divider}>
          <span>OR</span>
        </div>

        <button className={styles.socialBtn}>
          <Github size={18} />
          Continue with GitHub
        </button>

        <div className={styles.toggle}>
          {isLogin ? "New to PromptVault?" : "Already have an account?"}
          <button onClick={() => { setIsLogin(!isLogin); setError(null); setMessage(null); }} type="button">
            {isLogin ? "Sign Up" : "Log In"}
          </button>
        </div>
      
      </div>
    </main>
  );
}
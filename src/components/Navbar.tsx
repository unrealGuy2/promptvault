"use client"; // This makes the component interactive
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Terminal, User, LogOut } from 'lucide-react';
import styles from './Navbar.module.scss';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  // Check login status when the Navbar loads
  useEffect(() => {
    // 1. Get current user
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();

    // 2. Listen for login/logout events automatically
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') {
        router.push('/'); // Go home if logged out
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Handle Logout Function
  const handleLogout = async () => {
    await supabase.auth.signOut();
    // State will update automatically because of the listener above
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        <Terminal size={20} color="var(--accent-cyan)" />
        Prompt<span>Vault</span>
      </Link>

      <div className={styles.navLinks}>
        <Link href="/explore">Explore</Link>
        {/* Only show "Sell" if logged in, otherwise redirect to Auth */}
        <Link href={user ? "/sell" : "/auth"}>Sell Prompts</Link>
      </div>

      <div className={styles.actions}>
        {user ? (
          // IF LOGGED IN: Show Profile & Logout
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/profile" style={{ textDecoration: 'none' }}>
                <button className={styles.loginBtn} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} />
                    Profile
                </button>
            </Link>
            
            <button 
                onClick={handleLogout}
                className={styles.loginBtn} 
                style={{ borderColor: '#ff4444', color: '#ff4444', padding: '8px' }}
                title="Log Out"
            >
                <LogOut size={16} />
            </button>
          </div>
        ) : (
          // IF LOGGED OUT: Show Sign In
          <Link href="/auth">
            <button className={styles.loginBtn}>
              // Sign_In
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}
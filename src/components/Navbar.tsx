"use client"; 
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Terminal, User, LogOut } from 'lucide-react';
import styles from './Navbar.module.scss';
import { supabase } from '../lib/supabaseClient';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>("explorer"); // Default

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Fetch their role from the new 'profiles' table
        const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        
        if (profile) {
            setRole(profile.role);
        }
      }
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === 'SIGNED_OUT') router.push('/');
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        <Terminal size={20} color="var(--accent-cyan)" />
        Prompt<span>Vault</span>
      </Link>

      <div className={styles.navLinks}>
        <Link href="/explore">Explore</Link>
        
        {/* ONLY SHOW SELL LINK IF USER IS AN ENGINEER */}
        {user && role === 'engineer' && (
            <Link href="/sell">Sell Prompts</Link>
        )}
      </div>

      <div className={styles.actions}>
        {user ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <Link href="/profile" style={{ textDecoration: 'none' }}>
                <button className={styles.loginBtn} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <User size={16} />
                    Profile
                </button>
            </Link>
            
            <button onClick={handleLogout} className={styles.loginBtn} style={{ borderColor: '#ff4444', color: '#ff4444', padding: '8px' }}>
                <LogOut size={16} />
            </button>
          </div>
        ) : (
          <Link href="/auth">
            <button className={styles.loginBtn}>// Sign_In</button>
          </Link>
        )}
      </div>
    </nav>
  );
}
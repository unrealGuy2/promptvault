"use client"; 
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Terminal, User, LogOut, Bell } from 'lucide-react'; // Added Bell
import styles from './Navbar.module.scss';
import { supabase } from '../lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation'; // Added usePathname

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<string>("explorer"); 
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // 1. Fetch Role
        const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
        if (profile) setRole(profile.role);

        // 2. Fetch Notification Count
        const { count } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user.id)
            .eq('is_read', false);
        
        setUnreadCount(count || 0);
      }
    };
    getUser();

    // Realtime Listener for new Notifications could go here later
  }, [pathname]); // Re-check when changing pages

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  return (
    <nav className={styles.navbar}>
      <Link href="/" className={styles.logo}>
        <Terminal size={20} color="var(--accent-cyan)" />
        Prompt<span>Vault</span>
      </Link>

      <div className={styles.navLinks}>
        <Link href="/explore">Explore</Link>
        {user && role === 'engineer' && (
            <Link href="/sell">Sell Prompts</Link>
        )}
      </div>

      <div className={styles.actions}>
        {user ? (
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            
            {/* NOTIFICATION BELL */}
            <Link href="/notifications" style={{ position: 'relative', color: 'white', display: 'flex' }}>
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '-5px',
                        right: '-5px',
                        background: '#ff4444',
                        color: 'white',
                        fontSize: '0.6rem',
                        fontWeight: 'bold',
                        width: '15px',
                        height: '15px',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {unreadCount}
                    </span>
                )}
            </Link>

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
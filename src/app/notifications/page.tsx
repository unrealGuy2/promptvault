"use client";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { Bell, Heart, UserPlus, ShoppingBag, GitFork, MessageSquare, Loader } from "lucide-react";
import styles from "./page.module.scss"; // reuse profile styles or create new
import { useRouter } from "next/navigation";

export default function NotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotes = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push('/auth'); return; }

      // Get Notifications
      const { data } = await supabase
        .from('notifications')
        .select(`
            *,
            actor:actor_id ( username ) 
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) setNotifications(data);
      setLoading(false);

      // Mark all as read
      await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id);
    };

    fetchNotes();
  }, [router]);

  const getIcon = (type: string) => {
    switch (type) {
        case 'like': return <Heart size={18} color="#ff4444" />;
        case 'follow': return <UserPlus size={18} color="#00f3ff" />;
        case 'sale': return <ShoppingBag size={18} color="#ffd700" />;
        case 'fork': return <GitFork size={18} color="#00ff88" />;
        case 'comment': return <MessageSquare size={18} color="#ec4899" />;
        default: return <Bell size={18} color="white" />;
    }
  };

  return (
    <main style={{ padding: '4rem 1rem', maxWidth: '800px', margin: '0 auto', minHeight: '80vh' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Bell /> Notifications
      </h1>

      {loading ? (
        <Loader className="animate-spin" />
      ) : notifications.length === 0 ? (
        <p style={{ color: '#666' }}>No new notifications. Go make some noise!</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {notifications.map((note) => (
                <div 
                    key={note.id} 
                    onClick={() => note.link && router.push(note.link)}
                    style={{
                        background: note.is_read ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)',
                        padding: '1.5rem',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        cursor: note.link ? 'pointer' : 'default',
                        border: '1px solid rgba(255,255,255,0.05)',
                        transition: 'all 0.2s'
                    }}
                >
                    <div style={{ 
                        background: 'rgba(255,255,255,0.1)', 
                        padding: '10px', 
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        {getIcon(note.type)}
                    </div>
                    <div>
                        <p style={{ fontSize: '1rem', color: '#eee' }}>
                            <span style={{ fontWeight: 'bold' }}>@{note.actor?.username || "Someone"}</span> {note.message}
                        </p>
                        <span style={{ fontSize: '0.8rem', color: '#666' }}>
                            {new Date(note.created_at).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            ))}
        </div>
      )}
    </main>
  );
}
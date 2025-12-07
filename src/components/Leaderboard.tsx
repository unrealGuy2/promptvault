"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { Trophy, Zap, ShieldCheck, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function Leaderboard() {
  const [topUsers, setTopUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchTopUsers = async () => {
      // Fetch profiles (We will just limit to 5 for now)
      // In a real app, you would sort by 'reputation' or 'sales_count'
      const { data } = await supabase
        .from('profiles')
        .select('id, username, badges')
        .limit(5);

      if (data) setTopUsers(data);
    };

    fetchTopUsers();
  }, []);

  const renderBadge = (badge: string) => {
    if (badge === 'verified') return <ShieldCheck size={14} color="#00f3ff" />;
    if (badge === 'top-1%') return <Trophy size={14} color="#ffd700" />;
    return null;
  };

  return (
    <div style={{ 
      background: 'rgba(255,255,255,0.03)', 
      border: '1px solid rgba(255,255,255,0.05)', 
      borderRadius: '16px', 
      padding: '1.5rem',
      marginTop: '2rem'
    }}>
      
      {/* 🏆 LEADERBOARD SECTION */}
      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Trophy size={18} color="#ffd700" /> Top Engineers
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {topUsers.map((user, index) => (
          <Link key={user.id} href={`/u/${user.username}`} style={{ textDecoration: 'none' }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              padding: '8px',
              borderRadius: '8px',
              background: 'rgba(0,0,0,0.2)',
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: 'bold', color: '#666', width: '10px' }}>{index + 1}</span>
                <div style={{ 
                  width: '30px', height: '30px', 
                  borderRadius: '50%', background: '#333', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 'bold'
                }}>
                  {user.username?.charAt(0).toUpperCase()}
                </div>
                <span style={{ color: 'white', fontSize: '0.9rem' }}>{user.username}</span>
                {/* Show Badges */}
                <div style={{ display: 'flex', gap: '2px' }}>
                    {user.badges?.map((b: string) => renderBadge(b))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div style={{ margin: '2rem 0', height: '1px', background: 'rgba(255,255,255,0.1)' }}></div>

      {/* ⚡ ACTIVE CHALLENGE SECTION */}
      <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Zap size={18} color="#ff0080" /> Monthly Challenge
      </h3>

      <div style={{ 
        background: 'linear-gradient(45deg, rgba(255,0,128,0.1), transparent)', 
        border: '1px solid rgba(255,0,128,0.3)', 
        borderRadius: '12px', 
        padding: '1rem' 
      }}>
        <h4 style={{ color: '#ff0080', margin: '0 0 5px 0' }}>Automation King 👑</h4>
        <p style={{ fontSize: '0.85rem', color: '#ccc', lineHeight: '1.4', marginBottom: '10px' }}>
          Build the best "Lead Gen" workflow using Python or n8n.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
          <span style={{ color: '#ffd700' }}>Prize: $200</span>
          <span style={{ color: '#666' }}>Ends: Nov 30</span>
        </div>
      </div>

    </div>
  );
}
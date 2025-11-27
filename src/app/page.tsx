"use client"; // <--- THE FIX. Makes this page interactive.
import { useEffect, useState } from "react";
import Hero from "../components/Hero";
import PromptCard from "../components/PromptCard";
import { supabase } from "../lib/supabaseClient";
import Link from "next/link"; // Use Link for smoother navigation

export default function Home() {
  const [trendingPrompts, setTrendingPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrending = async () => {
      // Fetch 3 newest prompts for the homepage
      const { data } = await supabase
        .from('prompts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(3);

      if (data) {
        setTrendingPrompts(data);
      }
      setLoading(false);
    };

    fetchTrending();
  }, []);

  return (
    <main>
      <Hero />
      
      {/* Trending Section */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Fresh <span style={{ color: 'var(--accent-purple)' }}>Drops</span></h2>
          <a href="/explore" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>View all &rarr;</a>
        </div>

        {/* The Grid of Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          {loading ? (
             <p style={{ color: '#666' }}>Loading trending prompts...</p>
          ) : trendingPrompts.length === 0 ? (
             <p style={{ color: '#666' }}>No prompts yet. Be the first to upload!</p>
          ) : (
            trendingPrompts.map((prompt) => (
                // We wrap the card in a Link. This is better than onClick.
                <Link 
                    key={prompt.id} 
                    href={`/prompt/${prompt.id}`} 
                    style={{ textDecoration: 'none' }}
                >
                    <PromptCard 
                        id={prompt.id} // <--- ADD THIS
                        tool={prompt.ai_model || "AI"}
                        title={prompt.title}
                        description={prompt.description}
                        author={prompt.author_name || "Engineer"}
                        price={prompt.price || "Free"}
                    />
                </Link>
            ))
          )}

        </div>
      </section>
    </main>
  );
}
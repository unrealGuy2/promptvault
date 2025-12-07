"use client";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, SlidersHorizontal, Loader } from "lucide-react";
import styles from "./page.module.scss";
import PromptCard from "../../components/PromptCard";
import { supabase } from "../../lib/supabaseClient";
// Import the new Leaderboard Component
import Leaderboard from "../../components/Leaderboard";

function ExploreFeed() {
  const searchParams = useSearchParams();
  const category = searchParams.get('category'); 

  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  // 1. Define the Theme Class based on Category
  const getThemeClass = () => {
    switch (category) {
      case "Student": return styles.themeStudent;
      case "Business": return styles.themeBusiness;
      case "Creative": return styles.themeCreative;
      default: return styles.themeDev; // Default/Developer
    }
  };

  const getHeader = () => {
    switch (category) {
      case "Student": return "The Academy 🎓";
      case "Business": return "The Boardroom 💼";
      case "Creative": return "The Studio 🎨";
      case "Developer": return "Dev Terminal 💻";
      default: return "Explore All";
    }
  };

  useEffect(() => {
    const fetchPrompts = async () => {
      setLoading(true);
      let query = supabase.from('prompts').select('*').order('created_at', { ascending: false });

      if (category) query = query.eq('category', category);
      if (searchTerm) query = query.ilike('title', `%${searchTerm}%`);

      const { data } = await query;
      if (data) setPrompts(data);
      setLoading(false);
    };

    fetchPrompts();
  }, [category, searchTerm]);

  return (
    // Apply Dynamic Theme Class
    <div className={`${styles.container} ${getThemeClass()}`}>
      
      {/* HEADER */}
      <header className={styles.header}>
        <h1>{getHeader()}</h1>
        <p className={styles.subtext}>
            {category ? `Welcome to the ${category} workspace.` : "Discover prompts from all sectors."}
        </p>
      </header>

      {/* SEARCH BAR */}
      <div className={styles.searchBar}>
        <Search className={styles.searchIcon} />
        <input 
          type="text" 
          placeholder={`Search ${category || "all"}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className={styles.filterBtn}>
          <SlidersHorizontal size={18} />
        </button>
      </div>

      {/* MAIN LAYOUT SPLIT (Left: Feed, Right: Leaderboard) */}
      <div className={styles.layoutSplit} style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 300px', 
          gap: '2rem', 
          maxWidth: '1200px', 
          margin: '0 auto' 
      }}>
        
        {/* LEFT COLUMN: THE FEED */}
        <div>
            {loading ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
                    <Loader className="animate-spin" />
                </div>
            ) : (
                <div className={styles.grid}>
                {prompts.length === 0 ? (
                    <div className={styles.emptyState}>
                        <h3>No prompts here yet.</h3>
                        <p>Be the first to upload to the {category} section!</p>
                    </div>
                ) : (
                    prompts.map((prompt) => (
                        <div key={prompt.id} onClick={() => window.location.href = `/prompt/${prompt.id}`}>
                            <PromptCard 
                                id={prompt.id}
                                tool={prompt.ai_model || "AI"}
                                title={prompt.title}
                                description={prompt.description}
                                author={prompt.author_name || "Engineer"}
                                price={prompt.price || "Free"}
                            />
                        </div>
                    ))
                )}
                </div>
            )}
        </div>

        {/* RIGHT COLUMN: LEADERBOARD */}
        <aside className={styles.sidebarRight}>
            <Leaderboard />
        </aside>

      </div>
    </div>
  );
}

export default function Explore() {
  return (
    <main style={{ minHeight: '100vh' }}>
        <Suspense fallback={<div style={{color:'white', padding:'2rem'}}>Loading Vault...</div>}>
            <ExploreFeed />
        </Suspense>
    </main>
  );
}
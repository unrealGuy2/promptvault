"use client";
import { useEffect, useState } from "react";
import { Search, Filter, Loader } from "lucide-react";
import styles from "./page.module.scss";
import PromptCard from "../../components/PromptCard"; // Go up 2 levels
import { supabase } from "../../lib/supabaseClient"; // Go up 2 levels

export default function ExplorePage() {
  const [prompts, setPrompts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    setLoading(true);
    // Fetch ALL prompts from the database, newest first
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setPrompts(data);
    }
    setLoading(false);
  };

  // Simple Search Filter logic
  const filteredPrompts = prompts.filter(prompt => 
    prompt.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    prompt.ai_model.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className={styles.container}>
      
      {/* LEFT SIDEBAR: Filters (Visual Only for now) */}
      <aside className={styles.sidebar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '2rem', color: 'var(--accent-purple)' }}>
            <Filter size={20} />
            <span style={{ fontWeight: 'bold' }}>Filters</span>
        </div>

        <div className={styles.filterGroup}>
          <h3>Price</h3>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" /> Free Only
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" /> Under $5
          </label>
        </div>

        <div className={styles.filterGroup}>
          <h3>AI Model</h3>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" /> GPT-4
          </label>
          <label className={styles.checkboxLabel}>
            <input type="checkbox" /> Midjourney
          </label>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <section className={styles.mainContent}>
        
        {/* Search Bar - NOW FUNCTIONAL */}
        <div className={styles.searchBar}>
            <Search color="var(--text-muted)" />
            <input 
                type="text" 
                placeholder="Search for prompts..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>

        {/* Results Grid */}
        <div className={styles.grid}>
            
            {loading ? (
                <div style={{ color: 'white', display: 'flex', gap: '10px' }}>
                    <Loader className="animate-spin"/> Loading Marketplace...
                </div>
            ) : filteredPrompts.length === 0 ? (
                <p style={{ color: '#888' }}>No prompts found matching "{searchTerm}"</p>
            ) : (
                filteredPrompts.map((prompt) => (
                    // We wrap the ID in a Link inside the PromptCard component, 
                    // but PromptCard expects specific props.
                    // We need to pass the ID to the card if we want to make the link work perfectly,
                    // OR we modify PromptCard to accept an ID. 
                    // For now, let's just render the card.
                    // NOTE: Our PromptCard component has a hardcoded Link to /prompt/1.
                    // We need to fix that momentarily. For now, let's see the data.
                    <div key={prompt.id} onClick={() => window.location.href = `/prompt/${prompt.id}`}>
                        <PromptCard 
                            tool={prompt.ai_model} 
                            title={prompt.title} 
                            description={prompt.description} 
                            author={prompt.author_name || "Engineer"} 
                            price={prompt.price} 
                        />
                    </div>
                ))
            )}
            
        </div>
      </section>

    </main>
  );
}
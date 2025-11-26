import Hero from "../components/Hero";
import PromptCard from "../components/PromptCard";

export default function Home() {
  return (
    <main>
      <Hero />
      
      {/* Trending Section */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 'bold' }}>Trending <span style={{ color: 'var(--accent-purple)' }}>Prompts</span></h2>
          <a href="/explore" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>View all &rarr;</a>
        </div>

        {/* The Grid of Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
          
          <PromptCard 
            tool="Midjourney v6"
            title="Cyberpunk Cityscapes - Hyper Realistic"
            description="Generate stunning 8k cyberpunk environments with consistent lighting and neon aesthetics."
            author="Fazza"
            price="$4.99"
          />

          <PromptCard 
            tool="GPT-4"
            title="SEO Blog Post Generator Agent"
            description="A complex system prompt that acts as an SEO expert, writing human-like articles with proper keywords."
            author="CodeMaster"
            price="$9.99"
          />

          <PromptCard 
            tool="Stable Diffusion"
            title="Isometric 3D Icons Pack"
            description="Create consistent 3D icons for your web designs. Perfect for landing pages and SaaS products."
            author="DesignBot"
            price="$2.50"
          />

        </div>
      </section>
    </main>
  );
}
import Link from 'next/link';
import styles from './PromptCard.module.scss';
import { User } from 'lucide-react';

interface PromptCardProps {
  title: string;
  description: string;
  price: string;
  tool: string;
  author: string;
}

export default function PromptCard({ title, description, price, tool, author }: PromptCardProps) {
  
  const isFree = price === "Free" || price === "$0.00";

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.toolTag}>{tool}</span>
        {isFree && (
            <span style={{ fontSize: '0.7rem', background: 'rgba(0, 255, 136, 0.1)', color: '#00ff88', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', border: '1px solid #00ff88' }}>
                FREE
            </span>
        )}
      </div>
      
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.description}>{description}</p>
      
      <div className={styles.footer}>
        {/* MAKE THE AUTHOR CLICKABLE */}
        {/* e.stopPropagation prevents the card click from firing */}
        <div 
            className={styles.author} 
            onClick={(e) => {
                e.stopPropagation(); // Don't open the prompt, just go to profile
                window.location.href = `/u/${author}`;
            }}
            style={{ cursor: 'pointer', zIndex: 10 }}
        >
          <User size={14} />
          <span style={{ textDecoration: 'underline' }}>@{author}</span>
        </div>
        
        <div className={styles.price} style={{ color: isFree ? '#00ff88' : 'var(--accent-cyan)' }}>
            {price}
        </div>
      </div>
    </div>
  );
}
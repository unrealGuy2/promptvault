import Link from 'next/link'; // Import Link
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
    // We wrap the whole card in a Link to /prompt/1 (Hardcoded ID for now)
    <Link href="/prompt/1" style={{ textDecoration: 'none' }}>
        <div className={styles.card}>
        <div className={styles.header}>
            <span className={styles.toolTag}>{tool}</span>
            {isFree && (
                <span style={{ 
                    fontSize: '0.7rem', 
                    background: 'rgba(0, 255, 136, 0.1)', 
                    color: '#00ff88', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    fontWeight: 'bold',
                    border: '1px solid #00ff88'
                }}>
                    FREE
                </span>
            )}
        </div>
        
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.description}>{description}</p>
        
        <div className={styles.footer}>
            <div className={styles.author}>
            <User size={14} />
            <span>@{author}</span>
            </div>
            
            <div className={styles.price} style={{ color: isFree ? '#00ff88' : 'var(--accent-cyan)' }}>
                {price}
            </div>
        </div>
        </div>
    </Link>
  );
}
import Link from 'next/link';
import styles from './Hero.module.scss';

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* Background Glow Effect */}
      <div className={styles.glowBackground}></div>

      {/* Small Badge */}
      <div className={styles.badge}>
        v1.0 // The Marketplace for AI Builders
      </div>

      {/* Main Headline */}
      <h1 className={styles.headline}>
        Unlock the Code <br />
        to <span>Generative AI</span>
      </h1>

      {/* Subtext */}
      <p className={styles.subheadline}>
        Buy, sell, and discover advanced prompts for ChatGPT, Midjourney, and Claude. 
        Stop guessing. Start engineering.
      </p>

      {/* Buttons */}
      <div className={styles.ctaGroup}>
        <Link href="/explore" className={styles.primaryBtn}>
          Explore Prompts
        </Link>
        <Link href="/sell" className={styles.secondaryBtn}>
          Start Selling
        </Link>
      </div>
    </section>
  );
}
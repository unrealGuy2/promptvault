"use client";
import Link from "next/link";
import { GraduationCap, Briefcase, Palette, Terminal, ArrowRight } from "lucide-react";
import styles from "./page.module.scss";

export default function Home() {
  return (
    <main className={styles.main}>
      
      {/* HEADER */}
      <h1 className={styles.headline}>Choose Your Path.</h1>
      <p className={styles.sub}>
        PromptVault is now specialized. Select your workspace to enter a tailored experience.
      </p>

      {/* THE SORTING GRID */}
      <div className={styles.grid}>
        
        {/* 1. STUDENT */}
        <Link href="/explore?category=Student" className={`${styles.card} ${styles.student}`}>
          <div style={{ color: '#00f3ff' }}>
            <GraduationCap size={40} />
          </div>
          <h2>The Academy <ArrowRight size={20}/></h2>
          <p>
            For Students & Researchers. Unlock essay helpers, thesis analyzers, and study planners.
          </p>
        </Link>

        {/* 2. BUSINESS */}
        <Link href="/explore?category=Business" className={`${styles.card} ${styles.business}`}>
          <div style={{ color: '#ffd700' }}>
            <Briefcase size={40} />
          </div>
          <h2>The Boardroom <ArrowRight size={20}/></h2>
          <p>
            For Entrepreneurs & Managers. Marketing strategy, cold emails, and productivity systems.
          </p>
        </Link>

        {/* 3. CREATIVE */}
        <Link href="/explore?category=Creative" className={`${styles.card} ${styles.creative}`}>
          <div style={{ color: '#ff0080' }}>
            <Palette size={40} />
          </div>
          <h2>The Studio <ArrowRight size={20}/></h2>
          <p>
            For Artists & Designers. Midjourney styles, DALL-E prompts, and video generation scripts.
          </p>
        </Link>

        {/* 4. DEVELOPER */}
        <Link href="/explore?category=Developer" className={`${styles.card} ${styles.dev}`}>
          <div style={{ color: '#00ff88' }}>
            <Terminal size={40} />
          </div>
          <h2>Dev Terminal <ArrowRight size={20}/></h2>
          <p>
            For Coders & Automation Engineers. Code debugging, SQL queries, and system architecture.
          </p>
        </Link>

      </div>

    </main>
  );
}
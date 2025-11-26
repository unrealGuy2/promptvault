import { Camera } from "lucide-react";
import styles from "./page.module.scss";

export default function Onboarding() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Setup Profile</h1>
      <p style={{ color: '#888', marginBottom: '2rem' }}>
        Let's finish setting up your engineer profile.
      </p>

      <form className={styles.form}>
        
        {/* Profile Pic Upload */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
            <div style={{ 
                width: '100px', height: '100px', borderRadius: '50%', 
                background: '#222', display: 'flex', alignItems: 'center', 
                justifyContent: 'center', border: '1px dashed #666', cursor: 'pointer' 
            }}>
                <Camera color="#666" />
            </div>
        </div>

        <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Display Name</label>
            <input type="text" className={styles.input} placeholder="e.g. CodeMaster" />
        </div>

        <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Bio</label>
            <textarea className={styles.textarea} placeholder="Tell us what you build..." rows={4}></textarea>
        </div>

        <div>
            <label style={{ display: 'block', marginBottom: '0.5rem' }}>Role</label>
            <select className={styles.input}>
                <option>Prompt Engineer (I want to sell)</option>
                <option>Explorer (I just want to buy)</option>
            </select>
        </div>

        <button className={styles.btn}>Complete Setup &rarr;</button>

      </form>
    </main>
  );
}
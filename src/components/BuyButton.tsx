"use client";
import { useState, useEffect } from "react";
import { PaystackButton } from "react-paystack";
import { supabase } from "../lib/supabaseClient";
import { Check, ShoppingCart, Loader } from "lucide-react";

interface BuyButtonProps {
  promptId: number;
  price: number; 
  title: string;
}

export default function BuyButton({ promptId, price, title }: BuyButtonProps) {
  const [user, setUser] = useState<any>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY || "";
  const amount = price * 100; // Paystack works in Kobo

  useEffect(() => {
    const checkUserAndPurchase = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (user) {
        // Check if already bought
        const { data } = await supabase
          .from('purchases')
          .select('*')
          .eq('user_id', user.id)
          .eq('prompt_id', promptId)
          .single();
        
        if (data) setHasPurchased(true);
      }
      setLoading(false);
    };

    checkUserAndPurchase();
  }, [promptId]);

  const handleSuccess = async (reference: any) => {
    if (!user) return;

    // 1. Record Purchase
    const { error } = await supabase.from('purchases').insert({
      user_id: user.id,
      prompt_id: promptId,
      amount: price,
      reference: reference.reference
    });

    if (!error) {
      setHasPurchased(true);
      alert("Payment Successful! Prompt Unlocked.");

      // 2. --- SEND SALES NOTIFICATION ---
      // Fetch the Seller (Prompt Author)
      const { data: prompt } = await supabase
        .from('prompts')
        .select('author_id, title')
        .eq('id', promptId)
        .single();
      
      if (prompt) {
          await supabase.from('notifications').insert({
            user_id: prompt.author_id, // Seller
            actor_id: user.id, // Buyer (Me)
            type: 'sale',
            message: `purchased your prompt "${prompt.title}" for ₦${price}!`,
            link: `/prompt/${promptId}`
          });
      }

      // Reload to unblur content
      window.location.reload(); 
    }
  };

  const handleClose = () => {
    console.log("Payment closed");
  };

  const componentProps = {
    email: user?.email || "guest@example.com",
    amount,
    metadata: {
      name: user?.user_metadata?.username || "User",
      phone: "",
    },
    publicKey,
    text: "Buy Prompt Access",
    onSuccess: handleSuccess,
    onClose: handleClose,
  };

  if (loading) return <div style={{ padding:'15px', textAlign:'center', color:'#666' }}>Checking...</div>;

  if (hasPurchased) {
    return (
      <button 
        disabled
        style={{
          width: '100%',
          padding: '15px',
          background: 'rgba(0, 255, 136, 0.1)',
          color: '#00ff88',
          fontWeight: 'bold',
          border: '1px solid #00ff88',
          borderRadius: '8px',
          cursor: 'default',
          fontSize: '1.1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '10px'
        }}
      >
        <Check size={20} /> Owned / Unlocked
      </button>
    );
  }

  // If not logged in, redirect to login
  if (!user) {
    return (
        <a href="/auth" style={{ textDecoration: 'none' }}>
            <button style={{
                width: '100%',
                padding: '15px',
                background: 'var(--accent-cyan)',
                color: 'black',
                fontWeight: 'bold',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '1.1rem'
            }}>
                Login to Buy
            </button>
        </a>
    )
  }

  return (
    // @ts-ignore
    <PaystackButton {...componentProps} className="paystack-btn" />
  );
}
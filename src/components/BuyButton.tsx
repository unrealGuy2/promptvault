"use client";
import { useState, useEffect } from "react";
import { PaystackButton } from "react-paystack";
import { supabase } from "../lib/supabaseClient";
import { ShoppingCart, Check } from "lucide-react";

interface BuyButtonProps {
  promptId: number;
  price: number; // Price in NAIRA (e.g. 5000 for 5k)
  title: string;
}

export default function BuyButton({ promptId, price, title }: BuyButtonProps) {
  const [user, setUser] = useState<any>(null);
  const [hasPurchased, setHasPurchased] = useState(false);
  
  // Paystack Config
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY || "";
  
  // Paystack expects amount in Kobo (Naira * 100)
  // If price is 500 Naira, amount should be 50000
  const amount = price * 100; 

  useEffect(() => {
    checkUserAndPurchase();
  }, [promptId]);

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
  };

  const handleSuccess = async (reference: any) => {
    // Payment Successful! Save to DB.
    if (!user) return;

    const { error } = await supabase.from('purchases').insert({
      user_id: user.id,
      prompt_id: promptId,
      amount: price,
      reference: reference.reference
    });

    if (!error) {
      setHasPurchased(true);
      alert("Payment Successful! Prompt Unlocked.");
      window.location.reload(); // Reload page to unblur content
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
        <Check size={20} /> Owned
      </button>
    );
  }

  // Only render Paystack button if user is logged in, else show Login button
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
    // @ts-ignore (Ignore TypeScript warning for Paystack button types)
    <PaystackButton 
        {...componentProps} 
        className="paystack-btn" 
    />
  );
}
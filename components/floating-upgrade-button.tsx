"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Crown, X, Zap } from "lucide-react";
import Link from "next/link";

interface FloatingUpgradeButtonProps {
  tokenStatus?: {
    remaining: number;
    dailyLimit: number;
  };
  subscription?: {
    plan: string;
  };
}

export function FloatingUpgradeButton({ tokenStatus, subscription }: FloatingUpgradeButtonProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show upgrade button if:
    // 1. User is on basic plan
    // 2. Has 3 or fewer tokens remaining
    // 3. Hasn't dismissed it
    // 4. Not on subscription page
    const shouldShow = 
      subscription?.plan === 'basic' &&
      tokenStatus &&
      tokenStatus.remaining <= 3 &&
      tokenStatus.dailyLimit !== -1 &&
      !isDismissed &&
      !window.location.pathname.includes('/subscription');

    setIsVisible(shouldShow);
  }, [tokenStatus, subscription, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
    // Store dismissal in localStorage for this session
    localStorage.setItem('upgradeButtonDismissed', 'true');
  };

  // Check if user has dismissed it in this session
  useEffect(() => {
    const dismissed = localStorage.getItem('upgradeButtonDismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-2 duration-300">
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-4 shadow-2xl border border-purple-400/30 backdrop-blur-md max-w-sm">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Crown className="w-5 h-5 text-white" />
            <h3 className="text-white font-semibold text-sm">Upgrade to Pro</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="text-white/90 text-sm mb-3">
          <div className="flex items-center space-x-2 mb-1">
            <Zap className="w-4 h-4" />
            <span>Only {tokenStatus?.remaining} tokens left today</span>
          </div>
          <p>Get 100 tokens daily with Pro plan for just ₹399/month</p>
        </div>
        
        <Link href="/subscription" onClick={handleDismiss}>
          <Button className="w-full bg-white text-purple-600 hover:bg-white/90 font-medium">
            <Crown className="w-4 h-4 mr-2" />
            Upgrade Now
          </Button>
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Crown, X, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";

interface UpgradeBannerProps {
  tokenStatus?: {
    remaining: number;
    dailyLimit: number;
  };
  subscription?: {
    plan: string;
  };
  variant?: 'banner' | 'card';
}

export function UpgradeBanner({ tokenStatus, subscription, variant = 'banner' }: UpgradeBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Show banner if user is on basic plan and has low tokens
    const shouldShow = 
      subscription?.plan === 'basic' &&
      tokenStatus &&
      tokenStatus.remaining <= 5 &&
      tokenStatus.dailyLimit !== -1 &&
      !isDismissed;

    setIsVisible(shouldShow);
  }, [tokenStatus, subscription, isDismissed]);

  const handleDismiss = () => {
    setIsDismissed(true);
    setIsVisible(false);
  };

  if (!isVisible) return null;

  if (variant === 'card') {
    return (
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-2xl border border-purple-400/30">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Crown className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Upgrade to Pro</h3>
              <p className="text-white/80 text-sm">Unlock unlimited AI processing</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-8 w-8 p-0 text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="space-y-3 mb-6">
          <div className="flex items-center space-x-2 text-white/90">
            <Zap className="w-4 h-4" />
            <span>Only {tokenStatus?.remaining} tokens left today</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-white/10 rounded-lg p-3">
              <div className="font-semibold">Current Plan</div>
              <div className="text-white/80">10 tokens/day</div>
            </div>
            <div className="bg-white/20 rounded-lg p-3">
              <div className="font-semibold">Pro Plan</div>
              <div className="text-white/80">100 tokens/day</div>
            </div>
          </div>
        </div>
        
        <Link href="/subscription" onClick={handleDismiss}>
          <Button className="w-full bg-white text-purple-600 hover:bg-white/90 font-medium h-12">
            <Crown className="w-5 h-5 mr-2" />
            Upgrade to Pro - ₹399/month
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/90 to-pink-600/90"></div>
      <div className="relative z-10 max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Crown className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">Running low on tokens?</h3>
            <p className="text-white/90 text-sm">
              You have {tokenStatus?.remaining} tokens left. Upgrade to Pro for 100 tokens daily.
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Link href="/subscription" onClick={handleDismiss}>
            <Button className="bg-white text-purple-600 hover:bg-white/90 font-medium">
              <Crown className="w-4 h-4 mr-2" />
              Upgrade Now
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="text-white hover:bg-white/20"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

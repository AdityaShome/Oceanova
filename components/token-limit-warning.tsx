"use client";

import { useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Crown, Zap, AlertTriangle } from "lucide-react";
import Link from "next/link";

interface TokenLimitWarningProps {
  isOpen: boolean;
  onClose: () => void;
  tokensRemaining?: number;
  currentPlan?: string;
}

export function TokenLimitWarning({ isOpen, onClose, tokensRemaining = 0, currentPlan = 'basic' }: TokenLimitWarningProps) {
  const [showUpgrade, setShowUpgrade] = useState(false);

  const handleUpgrade = () => {
    setShowUpgrade(true);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <span>Daily Token Limit Reached</span>
          </DialogTitle>
          <DialogDescription>
            You've used all your daily AI processing tokens. Upgrade your plan to continue using our AI features.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Zap className="h-4 w-4" />
            <AlertTitle>Current Usage</AlertTitle>
            <AlertDescription>
              You have {tokensRemaining} tokens remaining today. Each AI analysis (species recognition, eDNA processing) consumes 1 token.
            </AlertDescription>
          </Alert>

          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-200">
            <div className="flex items-center space-x-2 mb-2">
              <Crown className="w-5 h-5 text-purple-600" />
              <h3 className="font-semibold text-purple-900">Pro Plan Benefits</h3>
            </div>
            <ul className="text-sm text-purple-800 space-y-1">
              <li>• 100 tokens per day (10x more)</li>
              <li>• Advanced AI analysis features</li>
              <li>• Priority support</li>
              <li>• Data export capabilities</li>
              <li>• Only ₹399/month</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <Button 
              onClick={handleUpgrade}
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            >
              <Crown className="w-4 h-4 mr-2" />
              Upgrade to Pro
            </Button>
            <Button variant="outline" onClick={onClose}>
              Maybe Later
            </Button>
          </div>

          <div className="text-center">
            <Link 
              href="/subscription" 
              className="text-sm text-cyan-600 hover:text-cyan-700 underline"
              onClick={onClose}
            >
              View all subscription plans
            </Link>
          </div>
        </div>

        {showUpgrade && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-800">
              Redirecting to subscription page...
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Zap, Crown, Building2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface TokenStatus {
  dailyLimit: number;
  usedToday: number;
  remaining: number;
  totalUsed: number;
  lastResetDate: string;
}

interface Subscription {
  plan: string;
  status: string;
}

export function TokenStatus() {
  const [tokenStatus, setTokenStatus] = useState<TokenStatus | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchTokenStatus = async () => {
    try {
      const response = await fetch('/api/tokens/status', {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTokenStatus(data.tokenStatus);
        setSubscription(data.subscription);
      } else {
        toast.error(data.error || "Failed to fetch token status");
      }
    } catch (error) {
      console.error("Error fetching token status:", error);
      toast.error("Failed to fetch token status");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokenStatus();
  }, []);

  const getPlanIcon = (plan: string) => {
    switch (plan) {
      case 'basic':
        return <Zap className="w-5 h-5" />;
      case 'pro':
        return <Crown className="w-5 h-5" />;
      case 'enterprise':
        return <Building2 className="w-5 h-5" />;
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case 'basic':
        return "bg-blue-100 text-blue-800";
      case 'pro':
        return "bg-purple-100 text-purple-800";
      case 'enterprise':
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-blue-100 text-blue-800";
    }
  };

  const getUsageColor = (percentage: number) => {
    if (percentage >= 90) return "bg-red-500";
    if (percentage >= 70) return "bg-yellow-500";
    return "bg-green-500";
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <RefreshCw className="w-5 h-5 animate-spin" />
            <span>Loading Token Status...</span>
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!tokenStatus || !subscription) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Token Status</CardTitle>
          <CardDescription>Unable to load token information</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const usagePercentage = tokenStatus.dailyLimit > 0 
    ? (tokenStatus.usedToday / tokenStatus.dailyLimit) * 100 
    : 0;

  const isUnlimited = tokenStatus.dailyLimit === -1;

  return (
    <div className="space-y-6">
      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Plan</span>
            <Badge className={`${getPlanColor(subscription.plan)} flex items-center space-x-1`}>
              {getPlanIcon(subscription.plan)}
              <span className="capitalize">{subscription.plan}</span>
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-gray-600">
            Status: <span className="font-medium text-green-600 capitalize">{subscription.status}</span>
          </div>
        </CardContent>
      </Card>

      {/* Token Usage */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Daily Token Usage</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchTokenStatus}
              className="flex items-center space-x-1"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </Button>
          </CardTitle>
          <CardDescription>
            AI processing and image recognition consume 1 token each
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isUnlimited ? (
            <div className="text-center py-8">
              <div className="text-4xl font-bold text-emerald-600 mb-2">∞</div>
              <div className="text-lg font-medium text-gray-700">Unlimited Tokens</div>
              <div className="text-sm text-gray-500">Enterprise plan includes unlimited usage</div>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Used Today</span>
                <span className="text-sm text-gray-600">
                  {tokenStatus.usedToday} / {tokenStatus.dailyLimit}
                </span>
              </div>
              
              <Progress 
                value={usagePercentage} 
                className="h-3"
              />
              
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {tokenStatus.remaining} tokens remaining
                </span>
                <span className={`font-medium ${
                  usagePercentage >= 90 ? 'text-red-600' : 
                  usagePercentage >= 70 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {usagePercentage.toFixed(1)}% used
                </span>
              </div>
            </>
          )}
          
          <div className="pt-4 border-t">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Total tokens used</span>
              <span className="font-medium">{tokenStatus.totalUsed}</span>
            </div>
            <div className="flex justify-between items-center text-sm text-gray-600 mt-1">
              <span>Last reset</span>
              <span className="font-medium">
                {new Date(tokenStatus.lastResetDate).toLocaleDateString()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Upgrade Prompt */}
      {!isUnlimited && usagePercentage >= 80 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">Token Limit Warning</CardTitle>
            <CardDescription className="text-yellow-700">
              You're approaching your daily token limit. Consider upgrading to continue using AI features.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={() => {
                // Scroll to subscription plans or open upgrade modal
                const plansSection = document.getElementById('subscription-plans');
                if (plansSection) {
                  plansSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Upgrade to Pro Plan
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

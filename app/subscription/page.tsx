"use client";

import { useState, useEffect } from "react";
import { SubscriptionPlans } from "@/components/subscription-plans";
import { TokenStatus } from "@/components/token-status";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, Zap, Crown, Building2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Subscription {
  plan: string;
  status: string;
}

export default function SubscriptionPage() {
  const [currentPlan, setCurrentPlan] = useState<string>('basic');
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptionInfo = async () => {
    try {
      const response = await fetch('/api/tokens/status', {
        credentials: 'include'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCurrentPlan(data.subscription.plan);
        setSubscription(data.subscription);
      } else {
        toast.error(data.error || "Failed to fetch subscription info");
      }
    } catch (error) {
      console.error("Error fetching subscription info:", error);
      toast.error("Failed to fetch subscription info");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptionInfo();
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading subscription information...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-cyan-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center space-x-2 text-cyan-300 hover:text-cyan-200 transition-colors mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Home Page</span>
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Subscription & Billing</h1>
              <p className="text-cyan-200">Manage your subscription and view usage statistics</p>
            </div>
            
            {subscription && (
              <div className="text-right">
                <div className="text-sm text-cyan-300 mb-1">Current Plan</div>
                <Badge className={`${getPlanColor(subscription.plan)} flex items-center space-x-1 w-fit`}>
                  {getPlanIcon(subscription.plan)}
                  <span className="capitalize">{subscription.plan}</span>
                </Badge>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-md border border-white/20">
            <TabsTrigger value="overview" className="data-[state=active]:bg-white/20">
              Overview
            </TabsTrigger>
            <TabsTrigger value="plans" className="data-[state=active]:bg-white/20">
              Plans & Pricing
            </TabsTrigger>
            <TabsTrigger value="billing" className="data-[state=active]:bg-white/20">
              Billing History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Token Status */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Token Usage</h2>
                <TokenStatus />
              </div>

              {/* Current Plan Details */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Current Plan Details</h2>
                <Card className="bg-white/5 backdrop-blur-md border border-white/20">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-white">
                      {getPlanIcon(currentPlan)}
                      <span className="capitalize">{currentPlan} Plan</span>
                    </CardTitle>
                    <CardDescription className="text-cyan-200">
                      {currentPlan === 'basic' && 'Perfect for getting started with marine biodiversity analysis'}
                      {currentPlan === 'pro' && 'Ideal for professional researchers and marine biologists'}
                      {currentPlan === 'enterprise' && 'For organizations requiring enterprise-level features'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-200">Status</span>
                      <Badge className="bg-green-100 text-green-800">
                        {subscription?.status || 'Active'}
                      </Badge>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-200">Daily Tokens</span>
                      <span className="text-white font-medium">
                        {currentPlan === 'enterprise' ? 'Unlimited' : 
                         currentPlan === 'pro' ? '100' : '10'}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-cyan-200">Price</span>
                      <span className="text-white font-medium">
                        {currentPlan === 'basic' ? 'Free' :
                         currentPlan === 'pro' ? '₹399/month' : 'Custom'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Choose Your Plan</h2>
              <p className="text-cyan-200 mb-8">
                Select the plan that best fits your research needs. You can upgrade or downgrade at any time.
              </p>
              <div id="subscription-plans">
                <SubscriptionPlans 
                  currentPlan={currentPlan} 
                  onPlanSelect={(planId) => {
                    setCurrentPlan(planId);
                    fetchSubscriptionInfo();
                  }}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="billing" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-white mb-4">Billing History</h2>
              <Card className="bg-white/5 backdrop-blur-md border border-white/20">
                <CardHeader>
                  <CardTitle className="text-white">Payment History</CardTitle>
                  <CardDescription className="text-cyan-200">
                    View your past payments and invoices
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentPlan === 'basic' ? (
                    <div className="text-center py-8">
                      <CreditCard className="w-12 h-12 text-cyan-400 mx-auto mb-4" />
                      <p className="text-cyan-200">No payment history for free plan</p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-cyan-200">Payment history will be displayed here</p>
                      <p className="text-sm text-cyan-300 mt-2">
                        This feature will be available after your first payment
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

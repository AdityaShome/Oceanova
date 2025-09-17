"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CreditCard, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { toast } from "sonner";

interface PaymentFormProps {
  plan: {
    id: string;
    name: string;
    price: number;
    currency: string;
  };
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function PaymentForm({ plan, onSuccess, onCancel }: PaymentFormProps) {
  const [formData, setFormData] = useState({
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    cardholderName: "",
    email: "",
    address: "",
    city: "",
    zipCode: "",
    country: "India",
    saveCard: false,
    termsAccepted: false
  });

  const [isProcessing, setIsProcessing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const handleInputChange = (field: string, value: string) => {
    if (field === 'cardNumber') {
      value = formatCardNumber(value);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length < 16) {
      newErrors.cardNumber = "Please enter a valid 16-digit card number";
    }

    if (!formData.expiryMonth || !formData.expiryYear) {
      newErrors.expiry = "Please select expiry month and year";
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      newErrors.cvv = "Please enter a valid CVV";
    }

    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = "Please enter cardholder name";
    }

    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Please enter billing address";
    }

    if (!formData.city.trim()) {
      newErrors.city = "Please enter city";
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "Please enter ZIP code";
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = "Please accept the terms and conditions";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the errors below");
      return;
    }

    setIsProcessing(true);

    try {
      // Call mock payment API
      const response = await fetch('/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId: plan.id,
          paymentData: {
            cardNumber: formData.cardNumber,
            expiryMonth: formData.expiryMonth,
            expiryYear: formData.expiryYear,
            cvv: formData.cvv,
            cardholderName: formData.cardholderName,
            email: formData.email,
            address: formData.address,
            city: formData.city,
            zipCode: formData.zipCode,
            country: formData.country
          }
        }),
        credentials: 'include'
      });

      const data = await response.json();

      if (data.success) {
        toast.success("Payment successful! Your subscription has been upgraded.");
        onSuccess?.();
      } else {
        toast.error(data.error || "Payment failed. Please try again.");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <div className="w-full p-8">
      <div className="bg-gradient-to-br from-slate-900/95 via-blue-900/95 to-purple-900/95 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl overflow-hidden">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 p-8 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2">Complete Your Payment</h2>
              <p className="text-purple-100 text-lg">Secure payment for your {plan.name} subscription</p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold">₹{plan.price}</div>
              <div className="text-purple-200">per month</div>
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-10">
            {/* Card Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Card Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <Label htmlFor="cardNumber" className="text-white font-semibold text-lg mb-3 block">Card Number</Label>
                  <div className="relative">
                    <Input
                      id="cardNumber"
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      value={formData.cardNumber}
                      onChange={(e) => handleInputChange('cardNumber', e.target.value)}
                      className={`h-14 text-lg bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-2 text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-purple-500/30 ${
                        errors.cardNumber ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-purple-400'
                      }`}
                      maxLength={19}
                    />
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="flex space-x-2">
                        <div className="w-8 h-5 bg-gradient-to-r from-blue-500 to-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                        <div className="w-8 h-5 bg-gradient-to-r from-red-500 to-red-600 rounded text-white text-xs flex items-center justify-center font-bold">M</div>
                      </div>
                    </div>
                  </div>
                  {errors.cardNumber && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.cardNumber}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="cardholderName" className="text-white font-semibold text-lg mb-3 block">Cardholder Name</Label>
                  <Input
                    id="cardholderName"
                    type="text"
                    placeholder="John Doe"
                    value={formData.cardholderName}
                    onChange={(e) => handleInputChange('cardholderName', e.target.value)}
                    className={`h-12 text-lg bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-2 text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-purple-500/30 ${
                      errors.cardholderName ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-purple-400'
                    }`}
                  />
                  {errors.cardholderName && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.cardholderName}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-white font-semibold text-lg mb-3 block">Expiry Month</Label>
                    <Select value={formData.expiryMonth} onValueChange={(value) => handleInputChange('expiryMonth', value)}>
                      <SelectTrigger className="h-12 text-lg bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-2 border-white/20 text-white rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400">
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {Array.from({ length: 12 }, (_, i) => (
                          <SelectItem key={i + 1} value={(i + 1).toString().padStart(2, '0')} className="text-white hover:bg-slate-700">
                            {(i + 1).toString().padStart(2, '0')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-white font-semibold text-lg mb-3 block">Expiry Year</Label>
                    <Select value={formData.expiryYear} onValueChange={(value) => handleInputChange('expiryYear', value)}>
                      <SelectTrigger className="h-12 text-lg bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-2 border-white/20 text-white rounded-xl focus:ring-4 focus:ring-purple-500/30 focus:border-purple-400">
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {years.map(year => (
                          <SelectItem key={year} value={year.toString()} className="text-white hover:bg-slate-700">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="cvv" className="text-white font-semibold text-lg mb-3 block">CVV</Label>
                    <Input
                      id="cvv"
                      type="text"
                      placeholder="123"
                      value={formData.cvv}
                      onChange={(e) => handleInputChange('cvv', e.target.value.replace(/\D/g, ''))}
                      className={`h-12 text-lg bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-2 text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-purple-500/30 ${
                        errors.cvv ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-purple-400'
                      }`}
                      maxLength={4}
                    />
                  </div>
                </div>

                {errors.expiry && (
                  <p className="text-red-400 text-sm flex items-center lg:col-span-2">
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {errors.expiry}
                  </p>
                )}
              </div>
            </div>

            {/* Billing Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Lock className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Billing Information</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="email" className="text-white font-semibold text-lg mb-3 block">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={`h-12 text-lg bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-2 text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-purple-500/30 ${
                      errors.email ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-purple-400'
                    }`}
                  />
                  {errors.email && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="address" className="text-white font-semibold text-lg mb-3 block">Billing Address</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="123 Main Street"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className={`h-12 text-lg bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-2 text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-purple-500/30 ${
                      errors.address ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-purple-400'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.address}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="city" className="text-white font-semibold text-lg mb-3 block">City</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder="Mumbai"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className={`h-12 text-lg bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-2 text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-purple-500/30 ${
                      errors.city ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-purple-400'
                    }`}
                  />
                  {errors.city && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.city}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="zipCode" className="text-white font-semibold text-lg mb-3 block">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    type="text"
                    placeholder="400001"
                    value={formData.zipCode}
                    onChange={(e) => handleInputChange('zipCode', e.target.value)}
                    className={`h-12 text-lg bg-gradient-to-r from-slate-800/50 to-slate-700/50 border-2 text-white placeholder:text-gray-400 rounded-xl transition-all duration-300 focus:ring-4 focus:ring-purple-500/30 ${
                      errors.zipCode ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-purple-400'
                    }`}
                  />
                  {errors.zipCode && (
                    <p className="text-red-400 text-sm mt-2 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.zipCode}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Terms and Conditions */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Terms & Security</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="terms"
                      checked={formData.termsAccepted}
                      onCheckedChange={(checked) => handleInputChange('termsAccepted', checked.toString())}
                      className="mt-1"
                    />
                    <Label htmlFor="terms" className="text-white text-base leading-relaxed">
                      I agree to the <span className="text-purple-400 underline cursor-pointer">Terms and Conditions</span> and <span className="text-purple-400 underline cursor-pointer">Privacy Policy</span>
                    </Label>
                  </div>
                  {errors.termsAccepted && (
                    <p className="text-red-400 text-sm flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      {errors.termsAccepted}
                    </p>
                  )}

                  <div className="flex items-start space-x-3">
                    <Checkbox
                      id="saveCard"
                      checked={formData.saveCard}
                      onCheckedChange={(checked) => handleInputChange('saveCard', checked.toString())}
                      className="mt-1"
                    />
                    <Label htmlFor="saveCard" className="text-white text-base leading-relaxed">
                      Save card for future payments (optional)
                    </Label>
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border-2 border-emerald-400/30 rounded-2xl p-6 backdrop-blur-sm">
                  <div className="flex items-center space-x-3 text-emerald-400 mb-3">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <Lock className="w-4 h-4" />
                    </div>
                    <span className="text-lg font-semibold">Secure Payment</span>
                  </div>
                  <p className="text-emerald-200 text-sm leading-relaxed">
                    Your payment information is encrypted and secure. We do not store your card details and use industry-standard security protocols.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-6 pt-8">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                className="flex-1 border-2 border-white/30 text-white hover:bg-white/10 h-16 text-xl font-semibold rounded-2xl transition-all duration-300 hover:scale-105"
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 hover:from-purple-700 hover:via-pink-700 hover:to-blue-700 text-white h-16 text-xl font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl shadow-purple-500/25"
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6" />
                    <span>Pay ₹{plan.price}</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

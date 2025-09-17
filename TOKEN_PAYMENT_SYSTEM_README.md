# Token-Based Payment System

This document describes the implementation of the token-based payment system for the AI Biodiversity Platform.

## Overview

The platform uses a token-based system to manage AI processing usage:
- **Basic Plan**: 10 tokens per day (free)
- **Pro Plan**: 100 tokens per day (₹399/month)
- **Enterprise Plan**: Unlimited tokens (custom pricing)

Each AI operation (species recognition, eDNA analysis) consumes 1 token.

## Architecture

### Core Components

1. **User Model** (`lib/userModel.ts`)
   - Extended with subscription and token fields
   - Tracks daily usage and payment history

2. **Token Service** (`lib/token-service.ts`)
   - Manages token consumption and daily limits
   - Handles subscription upgrades
   - Resets daily tokens automatically

3. **Payment Service** (`lib/payment-service.ts`)
   - Integrates with Razorpay for payments
   - Handles payment verification and refunds

4. **Subscription Plans** (`lib/subscription-plans.ts`)
   - Defines available plans and features
   - Configures token limits per plan

### API Endpoints

#### Token Management
- `GET /api/tokens/status` - Get current token status
- `POST /api/tokens/consume` - Consume a token for AI processing

#### Payment Processing
- `POST /api/payment/create-order` - Create Razorpay payment order
- `POST /api/payment/verify` - Verify payment and upgrade subscription

### UI Components

1. **Subscription Plans** (`components/subscription-plans.tsx`)
   - Displays available plans with pricing
   - Handles payment flow integration

2. **Token Status** (`components/token-status.tsx`)
   - Shows current usage and remaining tokens
   - Displays subscription information

3. **Navigation Updates** (`components/navigation.tsx`)
   - Shows token count in user profile
   - Links to subscription management

## Setup Instructions

### 1. Environment Variables

Add these to your `.env.local` file:

```env
# Razorpay Configuration
RAZORPAY_KEY_ID=your-razorpay-key-id
RAZORPAY_KEY_SECRET=your-razorpay-key-secret
NEXT_PUBLIC_RAZORPAY_KEY_ID=your-razorpay-key-id

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here
```

### 2. Razorpay Setup

1. Create a Razorpay account at https://razorpay.com
2. Get your API keys from the dashboard
3. Add the keys to your environment variables
4. The Razorpay script is automatically loaded in the layout

### 3. Database Migration

The user model has been extended with new fields. Existing users will get default values:
- `subscription.plan`: 'basic'
- `subscription.status`: 'active'
- `tokens.dailyLimit`: 10
- `tokens.usedToday`: 0
- `tokens.lastResetDate`: current date
- `tokens.totalUsed`: 0

## Usage Flow

### 1. User Registration
- New users automatically get Basic plan (10 tokens/day)
- No payment required for basic features

### 2. AI Processing
- Each AI operation checks token availability
- If tokens available, consumes 1 token and processes
- If no tokens, returns 429 error with upgrade prompt

### 3. Subscription Upgrade
- User clicks "Upgrade to Pro" button
- Creates Razorpay payment order
- User completes payment
- Payment verification upgrades subscription
- Token limit increases to 100/day

### 4. Daily Reset
- Tokens reset automatically at midnight
- System checks if it's a new day on each request
- Updates `usedToday` to 0 and `lastResetDate`

## Integration Points

### AI Processing Routes
The following routes now include token checking:
- `/api/ai/species-identification`
- `/api/ai/gene-sequence-analysis`

### Frontend Components
- Species recognition system shows token limit errors
- Navigation displays current token count
- Subscription page allows plan management

## Error Handling

### Token Limit Reached
- Returns HTTP 429 status
- Includes `tokenLimitReached: true` in response
- Frontend shows upgrade prompt

### Payment Failures
- Razorpay handles payment failures
- Failed payments don't upgrade subscription
- User can retry payment

## Security Considerations

1. **JWT Verification**: All token operations verify user authentication
2. **Payment Verification**: Razorpay signature verification prevents fraud
3. **Rate Limiting**: Token limits prevent abuse
4. **Data Privacy**: Payment data is handled by Razorpay (PCI compliant)

## Monitoring and Analytics

### Key Metrics to Track
- Daily token usage per user
- Conversion rate from Basic to Pro
- Payment success/failure rates
- Most popular AI features

### Database Collections
- `users`: Extended with subscription and token data
- `aiAnalyses`: Tracks all AI processing requests
- Payment history stored in user document

## Future Enhancements

1. **Usage Analytics Dashboard**
2. **Bulk Token Purchases**
3. **Team/Organization Plans**
4. **API Rate Limiting**
5. **Usage Notifications**
6. **Refund Management**

## Troubleshooting

### Common Issues

1. **Tokens not resetting**: Check timezone settings
2. **Payment not processing**: Verify Razorpay keys
3. **Token count not updating**: Check JWT token validity
4. **Subscription not upgrading**: Verify payment verification

### Debug Endpoints
- Check token status: `GET /api/tokens/status`
- View user profile: `GET /api/profile`

## Support

For issues with the payment system:
1. Check Razorpay dashboard for payment status
2. Verify environment variables are set correctly
3. Check server logs for error messages
4. Test with Razorpay test mode first

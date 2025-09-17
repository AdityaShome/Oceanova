import { getUserCollection } from "@/dbCollections";
import { ObjectId } from "mongodb";
import { getDailyTokenLimit } from "./subscription-plans";

export interface TokenUsageResult {
  success: boolean;
  tokensRemaining: number;
  message?: string;
  error?: string;
}

export class TokenService {
  /**
   * Check if user has tokens available for today
   */
  static async checkTokenAvailability(userId: string): Promise<TokenUsageResult> {
    try {
      const users = await getUserCollection();
      const user = await users.findOne({ _id: new ObjectId(userId) });
      
      if (!user) {
        return { success: false, tokensRemaining: 0, error: "User not found" };
      }

      // Reset daily tokens if it's a new day
      await this.resetDailyTokensIfNeeded(userId);

      const updatedUser = await users.findOne({ _id: new ObjectId(userId) });
      const tokensRemaining = (updatedUser?.tokens?.dailyLimit || 10) - (updatedUser?.tokens?.usedToday || 0);

      return {
        success: tokensRemaining > 0,
        tokensRemaining: Math.max(0, tokensRemaining),
        message: tokensRemaining > 0 ? "Tokens available" : "Daily token limit reached"
      };
    } catch (error) {
      console.error("Error checking token availability:", error);
      return { success: false, tokensRemaining: 0, error: "Internal server error" };
    }
  }

  /**
   * Consume a token for AI processing
   */
  static async consumeToken(userId: string, operation: string = "ai_processing"): Promise<TokenUsageResult> {
    try {
      const users = await getUserCollection();
      
      // First check if tokens are available
      const availability = await this.checkTokenAvailability(userId);
      if (!availability.success) {
        return availability;
      }

      // Update token usage
      const result = await users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $inc: {
            "tokens.usedToday": 1,
            "tokens.totalUsed": 1
          }
        }
      );

      if (result.modifiedCount === 0) {
        return { success: false, tokensRemaining: 0, error: "Failed to update token usage" };
      }

      // Get updated user data
      const updatedUser = await users.findOne({ _id: new ObjectId(userId) });
      const tokensRemaining = (updatedUser?.tokens?.dailyLimit || 10) - (updatedUser?.tokens?.usedToday || 0);

      return {
        success: true,
        tokensRemaining: Math.max(0, tokensRemaining),
        message: `Token consumed for ${operation}`
      };
    } catch (error) {
      console.error("Error consuming token:", error);
      return { success: false, tokensRemaining: 0, error: "Internal server error" };
    }
  }

  /**
   * Reset daily tokens if it's a new day
   */
  static async resetDailyTokensIfNeeded(userId: string): Promise<void> {
    try {
      const users = await getUserCollection();
      const user = await users.findOne({ _id: new ObjectId(userId) });
      
      if (!user) {
        return;
      }

      const today = new Date();
      const lastReset = new Date(user.tokens?.lastResetDate || user.createdAt);
      
      // Check if it's a new day (different date)
      if (today.toDateString() !== lastReset.toDateString()) {
        const dailyLimit = getDailyTokenLimit(user.subscription?.plan || 'basic');
        
        await users.updateOne(
          { _id: new ObjectId(userId) },
          {
            $set: {
              "tokens.usedToday": 0,
              "tokens.lastResetDate": today,
              "tokens.dailyLimit": dailyLimit
            }
          }
        );
      }
    } catch (error) {
      console.error("Error resetting daily tokens:", error);
    }
  }

  /**
   * Get user's current token status
   */
  static async getTokenStatus(userId: string): Promise<{
    dailyLimit: number;
    usedToday: number;
    remaining: number;
    totalUsed: number;
    lastResetDate: Date;
  } | null> {
    try {
      const users = await getUserCollection();
      const user = await users.findOne({ _id: new ObjectId(userId) });
      
      if (!user) {
        return null;
      }

      // Reset daily tokens if needed
      await this.resetDailyTokensIfNeeded(userId);
      
      const updatedUser = await users.findOne({ _id: new ObjectId(userId) });
      const dailyLimit = updatedUser?.tokens?.dailyLimit || 10;
      const usedToday = updatedUser?.tokens?.usedToday || 0;

      return {
        dailyLimit,
        usedToday,
        remaining: Math.max(0, dailyLimit - usedToday),
        totalUsed: updatedUser?.tokens?.totalUsed || 0,
        lastResetDate: updatedUser?.tokens?.lastResetDate || new Date()
      };
    } catch (error) {
      console.error("Error getting token status:", error);
      return null;
    }
  }

  /**
   * Upgrade user's subscription plan
   */
  static async upgradeSubscription(userId: string, planId: string, paymentId?: string): Promise<boolean> {
    try {
      const users = await getUserCollection();
      const dailyLimit = getDailyTokenLimit(planId);
      
      const result = await users.updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            "subscription.plan": planId,
            "subscription.status": "active",
            "subscription.startDate": new Date(),
            "subscription.paymentId": paymentId,
            "tokens.dailyLimit": dailyLimit,
            "tokens.usedToday": 0, // Reset usage on upgrade
            "tokens.lastResetDate": new Date()
          }
        }
      );

      return result.modifiedCount > 0;
    } catch (error) {
      console.error("Error upgrading subscription:", error);
      return false;
    }
  }
}

import prisma from '../lib/prisma';
import { PolicyCategory, AdjustmentType, PricingPolicy } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

export interface PricingBreakdownItem {
  type: string;
  amount: number;
  description?: string;
  isPerNight?: boolean;
}

export interface PricingCalculationResult {
  baseTotal: number;
  finalTotal: number;
  breakdown: PricingBreakdownItem[];
  appliedPolicies: number[];
  errors?: string[];
}

class PricingService {
  
  /**
   * Calculates the dynamic price of a booking based on active pricing policies
   */
  async calculateBookingPrice(
    pensionId: number,
    roomId: number | null,
    packageId: number | null,
    checkIn: Date,
    checkOut: Date,
    basePricePerNight: number
  ): Promise<PricingCalculationResult> {
    
    // Calculate nights
    const nights = Math.max(1, Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const baseTotal = basePricePerNight * nights;
    
    const result: PricingCalculationResult = {
      baseTotal,
      finalTotal: baseTotal,
      breakdown: [
        { type: 'Base Price', amount: baseTotal, description: `${nights} night(s) at ${basePricePerNight} ETB` }
      ],
      appliedPolicies: [],
      errors: []
    };

    try {
      // 1. Fetch active policies
      const policies = await prisma.pricingPolicy.findMany({
        where: {
          pension_id: pensionId,
          is_active: true,
          OR: [
            { room_id: null, package_id: null },
            roomId ? { room_id: roomId } : { room_id: -1 },
            packageId ? { package_id: packageId } : { package_id: -1 }
          ]
        },
        orderBy: { priority: 'desc' }
      });

      if (policies.length === 0) {
        return result; // No policies apply
      }

      // Filter out policies that do not meet min/max night requirements for this stay
      // (Pricing policies dictate whether a discount/fee applies, they don't block bookings)
      const applicablePolicies = policies.filter(p => {
        if (p.min_nights && nights < p.min_nights) return false;
        if (p.max_nights && nights > p.max_nights) return false;
        return true;
      });
      
      // Calculate nightly variations (Seasonal, Weekend)
      let currentTotal = 0;
      let nightlyBreakdownMap: Record<string, number> = {};
      
      for (let i = 0; i < nights; i++) {
        const currentDate = new Date(checkIn);
        currentDate.setDate(currentDate.getDate() + i);
        let currentNightPrice = basePricePerNight;
        
        // Find policies that apply to this specific date
        const datePolicies = applicablePolicies.filter(p => {
          if (p.category !== PolicyCategory.SEASONAL && p.category !== PolicyCategory.WEEKEND) return false;
          
          // Check date bounds
          if (p.start_date && currentDate < p.start_date) return false;
          if (p.end_date && currentDate > p.end_date) return false;
          
          // Check custom rules
          const rules = p.rules as any || {};
          if (p.category === PolicyCategory.WEEKEND) {
             const dayOfWeek = currentDate.getDay(); // 0 = Sun, 1 = Mon... 5 = Fri, 6 = Sat
             // Default weekend is Fri/Sat if not specified
             const weekendDays = rules.days || [5, 6]; 
             if (!weekendDays.includes(dayOfWeek)) return false;
          }
          return true;
        });
        
        // Apply nightly modifiers
        for (const p of datePolicies) {
          if (!p.adjustment_type || !p.adjustment_value) continue;
          
          const val = Number(p.adjustment_value);
          let adjustmentAmount = 0;
          
          if (p.adjustment_type === AdjustmentType.OVERRIDE) {
            adjustmentAmount = val - currentNightPrice;
            currentNightPrice = val;
          } else if (p.adjustment_type === AdjustmentType.FIXED_AMOUNT) {
            adjustmentAmount = val;
            currentNightPrice += val;
          } else if (p.adjustment_type === AdjustmentType.PERCENTAGE) {
            adjustmentAmount = currentNightPrice * (val / 100);
            currentNightPrice += adjustmentAmount;
          }
          
          if (!result.appliedPolicies.includes(p.policy_id)) {
            result.appliedPolicies.push(p.policy_id);
          }
          
          const name = p.name || 'Nightly Adjustment';
          nightlyBreakdownMap[name] = (nightlyBreakdownMap[name] || 0) + adjustmentAmount;
        }
        
        currentTotal += currentNightPrice;
      }
      
      // Add nightly variations to breakdown
      for (const [name, amount] of Object.entries(nightlyBreakdownMap)) {
        if (amount !== 0) {
          result.breakdown.push({
            type: name,
            amount: amount,
            isPerNight: true
          });
        }
      }
      
      // Apply total-stay modifiers (Currently none left, but keeping structure for future additions)
      const stayPolicies = applicablePolicies.filter(p => false);
      
      for (const p of stayPolicies) {
        let applies = false;
        

        
        if (applies && p.adjustment_type && p.adjustment_value) {
          const val = Number(p.adjustment_value);
          let adjustmentAmount = 0;
          
          let multiplier = 1;

          if (p.adjustment_type === AdjustmentType.FIXED_AMOUNT) {
            adjustmentAmount = val * multiplier;
          } else if (p.adjustment_type === AdjustmentType.PERCENTAGE) {
            adjustmentAmount = currentTotal * (val / 100) * multiplier;
          }
          
          if (adjustmentAmount !== 0) {
            currentTotal += adjustmentAmount;
            result.breakdown.push({
              type: p.name,
              amount: adjustmentAmount,
              description: multiplier > 1 ? `Applied for ${multiplier} extra guest(s)` : undefined
            });
            if (!result.appliedPolicies.includes(p.policy_id)) {
              result.appliedPolicies.push(p.policy_id);
            }
          }
        }
      }
      
      // Final sanity check (price cannot be negative)
      if (currentTotal < 0) currentTotal = 0;
      
      // Update result final total (base is removed from this total, it's already in the breakdown)
      // Actually breakdown should just be a list of modifications from Base Total
      result.finalTotal = currentTotal;
      
    } catch (error) {
      console.error('Pricing engine error:', error);
      result.errors?.push('Failed to evaluate pricing policies');
    }
    
    return result;
  }
}

export default new PricingService();

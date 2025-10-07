// Security Service - Rate limiting and security measures
'use client';

export interface SecurityEvent {
  identifier: string;
  timestamp: number;
  type: 'failed_login' | 'failed_pin' | 'failed_transaction';
}

export class SecurityService {
  private static failedAttempts = new Map<string, SecurityEvent[]>();
  private static lockoutUntil = new Map<string, number>();
  
  // Configuration
  private static readonly MAX_ATTEMPTS = 5;
  private static readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private static readonly ATTEMPT_WINDOW = 5 * 60 * 1000; // 5 minutes
  private static readonly PROGRESSIVE_DELAYS = [0, 1000, 2000, 5000, 10000]; // ms delays

  /**
   * Check if an action is rate limited
   * @param identifier - User identifier (address, session ID, etc.)
   * @param type - Type of security event
   * @returns Object with allowed status and wait time if blocked
   */
  static async checkRateLimit(
    identifier: string,
    type: SecurityEvent['type'] = 'failed_login'
  ): Promise<{ allowed: boolean; waitTime?: number; message?: string }> {
    const now = Date.now();
    const lockout = this.lockoutUntil.get(identifier);
    
    // Check if currently locked out
    if (lockout && now < lockout) {
      const waitTime = Math.ceil((lockout - now) / 1000);
      return {
        allowed: false,
        waitTime,
        message: `Too many failed attempts. Please wait ${waitTime} seconds.`
      };
    }
    
    // Clear lockout if expired
    if (lockout && now >= lockout) {
      this.lockoutUntil.delete(identifier);
      this.failedAttempts.delete(identifier);
    }
    
    // Check recent attempts
    const attempts = this.getRecentAttempts(identifier);
    
    if (attempts.length >= this.MAX_ATTEMPTS) {
      // Trigger lockout
      this.lockoutUntil.set(identifier, now + this.LOCKOUT_DURATION);
      return {
        allowed: false,
        waitTime: Math.ceil(this.LOCKOUT_DURATION / 1000),
        message: `Account temporarily locked due to too many failed attempts. Try again in 15 minutes.`
      };
    }
    
    // Apply progressive delay
    if (attempts.length > 0) {
      const delay = this.PROGRESSIVE_DELAYS[Math.min(attempts.length, this.PROGRESSIVE_DELAYS.length - 1)];
      if (delay > 0) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return { allowed: true };
  }

  /**
   * Record a failed attempt
   * @param identifier - User identifier
   * @param type - Type of security event
   */
  static recordFailedAttempt(
    identifier: string,
    type: SecurityEvent['type'] = 'failed_login'
  ): void {
    const now = Date.now();
    const attempts = this.failedAttempts.get(identifier) || [];
    
    attempts.push({
      identifier,
      timestamp: now,
      type
    });
    
    this.failedAttempts.set(identifier, attempts);
    
    console.warn(`Security: Failed attempt recorded for ${identifier}. Total: ${attempts.length}`);
  }

  /**
   * Clear all failed attempts for an identifier (called on successful auth)
   * @param identifier - User identifier
   */
  static clearFailedAttempts(identifier: string): void {
    this.failedAttempts.delete(identifier);
    this.lockoutUntil.delete(identifier);
    console.log(`Security: Cleared failed attempts for ${identifier}`);
  }

  /**
   * Get recent attempts within the time window
   * @param identifier - User identifier
   * @returns Array of recent security events
   */
  private static getRecentAttempts(identifier: string): SecurityEvent[] {
    const now = Date.now();
    const attempts = this.failedAttempts.get(identifier) || [];
    
    // Filter to only recent attempts within the window
    const recentAttempts = attempts.filter(
      attempt => now - attempt.timestamp < this.ATTEMPT_WINDOW
    );
    
    // Update stored attempts to only keep recent ones
    if (recentAttempts.length !== attempts.length) {
      this.failedAttempts.set(identifier, recentAttempts);
    }
    
    return recentAttempts;
  }

  /**
   * Check if an identifier is currently locked out
   * @param identifier - User identifier
   * @returns Object with locked status and remaining time
   */
  static isLockedOut(identifier: string): { locked: boolean; remainingTime?: number } {
    const lockout = this.lockoutUntil.get(identifier);
    const now = Date.now();
    
    if (lockout && now < lockout) {
      return {
        locked: true,
        remainingTime: Math.ceil((lockout - now) / 1000)
      };
    }
    
    return { locked: false };
  }

  /**
   * Get the number of remaining attempts before lockout
   * @param identifier - User identifier
   * @returns Number of remaining attempts
   */
  static getRemainingAttempts(identifier: string): number {
    const attempts = this.getRecentAttempts(identifier);
    return Math.max(0, this.MAX_ATTEMPTS - attempts.length);
  }

  /**
   * Reset security state for an identifier (admin function)
   * @param identifier - User identifier
   */
  static resetSecurity(identifier: string): void {
    this.failedAttempts.delete(identifier);
    this.lockoutUntil.delete(identifier);
    console.log(`Security: Reset security state for ${identifier}`);
  }

  /**
   * Clear all security data (use on logout)
   */
  static clearAll(): void {
    this.failedAttempts.clear();
    this.lockoutUntil.clear();
    console.log('Security: Cleared all security data');
  }

  /**
   * Get security statistics for monitoring
   * @returns Object with security stats
   */
  static getSecurityStats(): {
    totalLockedAccounts: number;
    totalAttempts: number;
    averageAttemptsPerAccount: number;
  } {
    return {
      totalLockedAccounts: this.lockoutUntil.size,
      totalAttempts: Array.from(this.failedAttempts.values())
        .reduce((sum, attempts) => sum + attempts.length, 0),
      averageAttemptsPerAccount: this.failedAttempts.size > 0
        ? Array.from(this.failedAttempts.values())
            .reduce((sum, attempts) => sum + attempts.length, 0) / this.failedAttempts.size
        : 0
    };
  }
}


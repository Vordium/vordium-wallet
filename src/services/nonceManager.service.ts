// Nonce Manager Service - Handles transaction nonce management for Ethereum
'use client';

import { ethers } from 'ethers';

export interface PendingTransaction {
  nonce: number;
  hash: string;
  timestamp: number;
  address: string;
}

export class NonceManager {
  private static pendingNonces = new Map<string, number>();
  private static pendingTransactions = new Map<string, PendingTransaction[]>();
  
  /**
   * Get the next available nonce for an address
   * @param address - Wallet address
   * @param provider - JSON RPC provider
   * @returns Next available nonce
   */
  static async getNextNonce(
    address: string,
    provider: ethers.JsonRpcProvider
  ): Promise<number> {
    try {
      // Get on-chain nonce (includes pending transactions)
      const onChainNonce = await provider.getTransactionCount(address, 'pending');
      
      // Get our tracked pending nonce
      const pendingNonce = this.pendingNonces.get(address) || 0;
      
      // Use the higher of the two
      const nextNonce = Math.max(onChainNonce, pendingNonce);
      
      // Increment and store
      this.pendingNonces.set(address, nextNonce + 1);
      
      console.log(`NonceManager: Next nonce for ${address}: ${nextNonce} (on-chain: ${onChainNonce}, pending: ${pendingNonce})`);
      
      return nextNonce;
    } catch (error) {
      console.error('NonceManager: Failed to get nonce:', error);
      throw new Error('Failed to fetch transaction nonce');
    }
  }

  /**
   * Track a pending transaction
   * @param address - Wallet address
   * @param nonce - Transaction nonce
   * @param hash - Transaction hash
   */
  static trackTransaction(address: string, nonce: number, hash: string): void {
    const pending = this.pendingTransactions.get(address) || [];
    
    pending.push({
      nonce,
      hash,
      timestamp: Date.now(),
      address
    });
    
    this.pendingTransactions.set(address, pending);
    console.log(`NonceManager: Tracking transaction ${hash} with nonce ${nonce} for ${address}`);
  }

  /**
   * Confirm a transaction (remove from pending)
   * @param address - Wallet address
   * @param nonce - Confirmed transaction nonce
   */
  static async confirmTransaction(address: string, nonce: number): Promise<void> {
    const pending = this.pendingTransactions.get(address) || [];
    
    // Remove confirmed transaction
    const updated = pending.filter(tx => tx.nonce !== nonce);
    
    if (updated.length < pending.length) {
      this.pendingTransactions.set(address, updated);
      console.log(`NonceManager: Confirmed transaction with nonce ${nonce} for ${address}`);
      
      // If no more pending transactions, reset the nonce tracker
      if (updated.length === 0) {
        this.pendingNonces.delete(address);
      }
    }
  }

  /**
   * Reset nonce for an address (use when nonce gets out of sync)
   * @param address - Wallet address
   * @param provider - JSON RPC provider (optional)
   */
  static async resetNonce(
    address: string,
    provider?: ethers.JsonRpcProvider
  ): Promise<void> {
    this.pendingNonces.delete(address);
    this.pendingTransactions.delete(address);
    
    console.log(`NonceManager: Reset nonce for ${address}`);
    
    // If provider given, fetch current nonce
    if (provider) {
      const currentNonce = await provider.getTransactionCount(address, 'pending');
      this.pendingNonces.set(address, currentNonce);
      console.log(`NonceManager: Set nonce to ${currentNonce} for ${address}`);
    }
  }

  /**
   * Get pending transactions for an address
   * @param address - Wallet address
   * @returns Array of pending transactions
   */
  static getPendingTransactions(address: string): PendingTransaction[] {
    return this.pendingTransactions.get(address) || [];
  }

  /**
   * Check if there are any pending transactions
   * @param address - Wallet address
   * @returns True if there are pending transactions
   */
  static hasPendingTransactions(address: string): boolean {
    const pending = this.pendingTransactions.get(address) || [];
    return pending.length > 0;
  }

  /**
   * Clean up old pending transactions (>30 minutes)
   * @param address - Wallet address
   */
  static cleanupStaleTransactions(address: string): void {
    const pending = this.pendingTransactions.get(address) || [];
    const now = Date.now();
    const staleThreshold = 30 * 60 * 1000; // 30 minutes
    
    const fresh = pending.filter(tx => now - tx.timestamp < staleThreshold);
    
    if (fresh.length < pending.length) {
      this.pendingTransactions.set(address, fresh);
      console.log(`NonceManager: Cleaned up ${pending.length - fresh.length} stale transactions for ${address}`);
      
      // Reset nonce if no fresh transactions
      if (fresh.length === 0) {
        this.pendingNonces.delete(address);
      }
    }
  }

  /**
   * Clear all nonce data (use on logout)
   */
  static clearAll(): void {
    this.pendingNonces.clear();
    this.pendingTransactions.clear();
    console.log('NonceManager: Cleared all nonce data');
  }

  /**
   * Get nonce statistics for monitoring
   * @returns Object with nonce stats
   */
  static getStats(): {
    totalAddresses: number;
    totalPendingTransactions: number;
    addressesWithPending: number;
  } {
    let totalPending = 0;
    let addressesWithPending = 0;
    
    for (const [address, txs] of this.pendingTransactions.entries()) {
      totalPending += txs.length;
      if (txs.length > 0) {
        addressesWithPending++;
      }
    }
    
    return {
      totalAddresses: this.pendingNonces.size,
      totalPendingTransactions: totalPending,
      addressesWithPending
    };
  }

  /**
   * Handle "nonce too low" error by resetting and retrying
   * @param address - Wallet address
   * @param provider - JSON RPC provider
   * @returns New nonce to use
   */
  static async handleNonceTooLow(
    address: string,
    provider: ethers.JsonRpcProvider
  ): Promise<number> {
    console.warn(`NonceManager: Handling "nonce too low" error for ${address}`);
    
    // Reset nonce tracking
    await this.resetNonce(address, provider);
    
    // Get fresh nonce
    return this.getNextNonce(address, provider);
  }
}


// Transaction Monitor Service - Real-time transaction status tracking
'use client';

import { ethers } from 'ethers';
import type { Chain } from './unifiedTransaction.service';
import { NonceManager } from './nonceManager.service';

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed',
  DROPPED = 'dropped'
}

export interface MonitoredTransaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  chain: Chain;
  status: TransactionStatus;
  confirmations: number;
  timestamp: number;
  fee?: string;
  blockNumber?: number;
  error?: string;
}

export type TransactionCallback = (tx: MonitoredTransaction) => void;

export class TransactionMonitor {
  private static monitoredTransactions = new Map<string, MonitoredTransaction>();
  private static callbacks = new Map<string, TransactionCallback[]>();
  private static intervals = new Map<string, NodeJS.Timeout>();
  
  // Configuration
  private static readonly CHECK_INTERVAL = 5000; // 5 seconds
  private static readonly CONFIRMATION_TARGET = 3; // Required confirmations
  private static readonly MAX_MONITORING_TIME = 30 * 60 * 1000; // 30 minutes

  /**
   * Start monitoring a transaction
   * @param transaction - Transaction to monitor
   * @param callback - Callback function for status updates
   * @param chain - Blockchain chain
   */
  static async monitorTransaction(
    transaction: Partial<MonitoredTransaction>,
    callback?: TransactionCallback,
    chain?: Chain
  ): Promise<void> {
    if (!transaction.hash) {
      throw new Error('Transaction hash is required');
    }

    const txHash = transaction.hash;
    const txChain = chain || transaction.chain || 'Ethereum';
    
    // Initialize monitored transaction
    const monitoredTx: MonitoredTransaction = {
      hash: txHash,
      from: transaction.from || '',
      to: transaction.to || '',
      amount: transaction.amount || '0',
      chain: txChain,
      status: TransactionStatus.PENDING,
      confirmations: 0,
      timestamp: Date.now()
    };
    
    this.monitoredTransactions.set(txHash, monitoredTx);
    
    // Register callback
    if (callback) {
      const callbacks = this.callbacks.get(txHash) || [];
      callbacks.push(callback);
      this.callbacks.set(txHash, callbacks);
    }
    
    console.log(`TransactionMonitor: Started monitoring ${txHash} on ${txChain}`);
    
    // Start polling
    this.startPolling(txHash, txChain);
  }

  /**
   * Start polling for transaction status
   */
  private static startPolling(hash: string, chain: Chain): void {
    // Clear existing interval if any
    const existingInterval = this.intervals.get(hash);
    if (existingInterval) {
      clearInterval(existingInterval);
    }
    
    // Start new polling interval
    const interval = setInterval(async () => {
      try {
        await this.checkTransaction(hash, chain);
      } catch (error) {
        console.error(`TransactionMonitor: Error checking transaction ${hash}:`, error);
      }
    }, this.CHECK_INTERVAL);
    
    this.intervals.set(hash, interval);
    
    // Set timeout to stop monitoring after max time
    setTimeout(() => {
      this.stopMonitoring(hash);
    }, this.MAX_MONITORING_TIME);
  }

  /**
   * Check transaction status
   */
  private static async checkTransaction(hash: string, chain: Chain): Promise<void> {
    const tx = this.monitoredTransactions.get(hash);
    if (!tx) return;
    
    try {
      switch (chain) {
        case 'Ethereum':
        case 'BSC':
        case 'Polygon':
        case 'Arbitrum':
          await this.checkEVMTransaction(hash, chain, tx);
          break;
        
        case 'Solana':
          // TODO: Implement Solana checking
          break;
        
        case 'Tron':
          // TODO: Implement TRON checking
          break;
        
        case 'Bitcoin':
          // TODO: Implement Bitcoin checking
          break;
      }
    } catch (error) {
      console.error(`TransactionMonitor: Failed to check transaction:`, error);
      tx.status = TransactionStatus.FAILED;
      tx.error = (error as Error).message;
      this.updateTransaction(hash, tx);
    }
  }

  /**
   * Check EVM transaction status
   */
  private static async checkEVMTransaction(
    hash: string,
    chain: Chain,
    tx: MonitoredTransaction
  ): Promise<void> {
    const provider = this.getEVMProvider(chain);
    
    // Get transaction receipt
    const receipt = await provider.getTransactionReceipt(hash);
    
    if (!receipt) {
      // Still pending
      const elapsedTime = Date.now() - tx.timestamp;
      if (elapsedTime > this.MAX_MONITORING_TIME) {
        tx.status = TransactionStatus.DROPPED;
        this.updateTransaction(hash, tx);
        this.stopMonitoring(hash);
      }
      return;
    }
    
    // Transaction is mined
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber + 1;
    
    tx.confirmations = confirmations;
    tx.blockNumber = receipt.blockNumber;
    tx.fee = ethers.formatEther(receipt.fee || 0);
    
    // Check if confirmed or failed
    if (receipt.status === 0) {
      tx.status = TransactionStatus.FAILED;
      tx.error = 'Transaction reverted';
      this.updateTransaction(hash, tx);
      this.stopMonitoring(hash);
      
      // Confirm nonce with NonceManager
      if (tx.from) {
        // Extract nonce from transaction
        const fullTx = await provider.getTransaction(hash);
        if (fullTx) {
          await NonceManager.confirmTransaction(tx.from, fullTx.nonce);
        }
      }
    } else if (confirmations >= this.CONFIRMATION_TARGET) {
      tx.status = TransactionStatus.CONFIRMED;
      this.updateTransaction(hash, tx);
      this.stopMonitoring(hash);
      
      // Confirm nonce with NonceManager
      if (tx.from) {
        const fullTx = await provider.getTransaction(hash);
        if (fullTx) {
          await NonceManager.confirmTransaction(tx.from, fullTx.nonce);
        }
      }
    } else {
      // Still pending confirmations
      this.updateTransaction(hash, tx);
    }
  }

  /**
   * Update transaction and notify callbacks
   */
  private static updateTransaction(hash: string, tx: MonitoredTransaction): void {
    this.monitoredTransactions.set(hash, tx);
    
    // Notify callbacks
    const callbacks = this.callbacks.get(hash) || [];
    callbacks.forEach(callback => {
      try {
        callback(tx);
      } catch (error) {
        console.error('TransactionMonitor: Callback error:', error);
      }
    });
    
    // Dispatch custom event for dashboard updates
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('transactionUpdate', {
        detail: tx
      }));
    }
  }

  /**
   * Stop monitoring a transaction
   */
  static stopMonitoring(hash: string): void {
    const interval = this.intervals.get(hash);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(hash);
    }
    
    this.callbacks.delete(hash);
    
    console.log(`TransactionMonitor: Stopped monitoring ${hash}`);
  }

  /**
   * Get transaction status
   */
  static getTransaction(hash: string): MonitoredTransaction | undefined {
    return this.monitoredTransactions.get(hash);
  }

  /**
   * Get all monitored transactions
   */
  static getAllTransactions(): MonitoredTransaction[] {
    return Array.from(this.monitoredTransactions.values());
  }

  /**
   * Get pending transactions
   */
  static getPendingTransactions(): MonitoredTransaction[] {
    return Array.from(this.monitoredTransactions.values())
      .filter(tx => tx.status === TransactionStatus.PENDING);
  }

  /**
   * Clear all monitoring data
   */
  static clearAll(): void {
    // Stop all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    
    this.monitoredTransactions.clear();
    this.callbacks.clear();
    this.intervals.clear();
    
    console.log('TransactionMonitor: Cleared all monitoring data');
  }

  /**
   * Get explorer URL for a transaction
   */
  static getExplorerUrl(hash: string, chain: Chain): string {
    const explorers: Record<Chain, string> = {
      Ethereum: `https://etherscan.io/tx/${hash}`,
      BSC: `https://bscscan.com/tx/${hash}`,
      Polygon: `https://polygonscan.com/tx/${hash}`,
      Arbitrum: `https://arbiscan.io/tx/${hash}`,
      Tron: `https://tronscan.org/#/transaction/${hash}`,
      Solana: `https://explorer.solana.com/tx/${hash}`,
      Bitcoin: `https://blockchair.com/bitcoin/transaction/${hash}`
    };
    
    return explorers[chain] || '';
  }

  /**
   * Helper: Get EVM provider
   */
  private static getEVMProvider(chain: Chain): ethers.JsonRpcProvider {
    const rpcUrls: Record<string, string> = {
      Ethereum: process.env.NEXT_PUBLIC_ETHEREUM_RPC || '',
      BSC: process.env.NEXT_PUBLIC_BSC_RPC || '',
      Polygon: process.env.NEXT_PUBLIC_POLYGON_RPC || '',
      Arbitrum: process.env.NEXT_PUBLIC_ARBITRUM_RPC || ''
    };
    
    const rpcUrl = rpcUrls[chain];
    if (!rpcUrl) {
      throw new Error(`RPC URL not configured for ${chain}`);
    }
    
    return new ethers.JsonRpcProvider(rpcUrl);
  }
}


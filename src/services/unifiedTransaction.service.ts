// Unified Transaction Service - Multi-chain transaction handling
'use client';

import { ethers } from 'ethers';
import TronWeb from 'tronweb';

export type Chain = 'Ethereum' | 'BSC' | 'Polygon' | 'Arbitrum' | 'Tron' | 'Solana' | 'Bitcoin';

export interface TransactionRequest {
  chain: Chain;
  from: string;
  to: string;
  amount: string;
  token?: string; // Token contract address (optional for native transfers)
  gasLimit?: string;
  priority?: 'low' | 'medium' | 'high';
  data?: string; // For contract interactions
}

export interface TransactionResult {
  hash: string;
  from: string;
  to: string;
  amount: string;
  fee: string;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: number;
  chain: Chain;
}

export interface FeeEstimate {
  low: string;
  medium: string;
  high: string;
  estimated: string;
  currency: string;
}

export class UnifiedTransactionService {
  /**
   * Build a transaction for any supported chain
   */
  static async buildTransaction(request: TransactionRequest): Promise<any> {
    console.log(`Building ${request.chain} transaction:`, request);
    
    switch (request.chain) {
      case 'Ethereum':
      case 'BSC':
      case 'Polygon':
      case 'Arbitrum':
        return this.buildEVMTransaction(request);
      
      case 'Solana':
        return this.buildSolanaTransaction(request);
      
      case 'Tron':
        return this.buildTronTransaction(request);
      
      case 'Bitcoin':
        return this.buildBitcoinTransaction(request);
      
      default:
        throw new Error(`Unsupported chain: ${request.chain}`);
    }
  }

  /**
   * Estimate fees for a transaction
   */
  static async estimateFees(request: TransactionRequest): Promise<FeeEstimate> {
    console.log(`Estimating fees for ${request.chain}`);
    
    switch (request.chain) {
      case 'Ethereum':
      case 'BSC':
      case 'Polygon':
      case 'Arbitrum':
        return this.estimateEVMFees(request);
      
      case 'Solana':
        return this.estimateSolanaFees(request);
      
      case 'Tron':
        return this.estimateTronFees(request);
      
      case 'Bitcoin':
        return this.estimateBitcoinFees(request);
      
      default:
        throw new Error(`Unsupported chain: ${request.chain}`);
    }
  }

  /**
   * Sign and broadcast a transaction
   */
  static async signAndBroadcast(
    transaction: any,
    privateKey: string,
    chain: Chain
  ): Promise<TransactionResult> {
    console.log(`Signing and broadcasting ${chain} transaction`);
    
    switch (chain) {
      case 'Ethereum':
      case 'BSC':
      case 'Polygon':
      case 'Arbitrum':
        return this.signAndBroadcastEVM(transaction, privateKey, chain);
      
      case 'Solana':
        return this.signAndBroadcastSolana(transaction, privateKey);
      
      case 'Tron':
        return this.signAndBroadcastTron(transaction, privateKey);
      
      case 'Bitcoin':
        return this.signAndBroadcastBitcoin(transaction, privateKey);
      
      default:
        throw new Error(`Unsupported chain: ${chain}`);
    }
  }

  // ==================== EVM TRANSACTIONS ====================

  private static async buildEVMTransaction(request: TransactionRequest): Promise<any> {
    const provider = this.getEVMProvider(request.chain);
    const wallet = new ethers.Wallet(request.from, provider);
    
    let tx: any = {
      from: request.from,
      to: request.to,
      value: ethers.parseEther(request.amount)
    };

    // If sending tokens (ERC-20)
    if (request.token) {
      const erc20Interface = new ethers.Interface([
        'function transfer(address to, uint256 amount) returns (bool)'
      ]);
      
      tx = {
        from: request.from,
        to: request.token,
        data: erc20Interface.encodeFunctionData('transfer', [
          request.to,
          ethers.parseEther(request.amount)
        ]),
        value: 0
      };
    }

    // Get nonce
    tx.nonce = await provider.getTransactionCount(request.from, 'pending');
    
    // Estimate gas
    try {
      tx.gasLimit = await provider.estimateGas(tx);
    } catch (error) {
      console.warn('Gas estimation failed, using default:', error);
      tx.gasLimit = BigInt(21000); // Default for simple transfer
    }

    // Get fee data
    const feeData = await provider.getFeeData();
    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
      // EIP-1559 transaction
      tx.maxFeePerGas = feeData.maxFeePerGas;
      tx.maxPriorityFeePerGas = feeData.maxPriorityFeePerGas;
      
      // Adjust based on priority
      if (request.priority === 'high') {
        tx.maxFeePerGas = (tx.maxFeePerGas * BigInt(150)) / BigInt(100); // 1.5x
        tx.maxPriorityFeePerGas = (tx.maxPriorityFeePerGas * BigInt(150)) / BigInt(100);
      } else if (request.priority === 'low') {
        tx.maxFeePerGas = (tx.maxFeePerGas * BigInt(80)) / BigInt(100); // 0.8x
        tx.maxPriorityFeePerGas = (tx.maxPriorityFeePerGas * BigInt(80)) / BigInt(100);
      }
    } else {
      // Legacy transaction
      tx.gasPrice = feeData.gasPrice;
      
      if (request.priority === 'high') {
        tx.gasPrice = (tx.gasPrice! * BigInt(150)) / BigInt(100);
      } else if (request.priority === 'low') {
        tx.gasPrice = (tx.gasPrice! * BigInt(80)) / BigInt(100);
      }
    }

    return tx;
  }

  private static async estimateEVMFees(request: TransactionRequest): Promise<FeeEstimate> {
    const provider = this.getEVMProvider(request.chain);
    const feeData = await provider.getFeeData();
    
    const gasLimit = BigInt(request.gasLimit || 21000);
    
    if (feeData.maxFeePerGas) {
      const low = (feeData.maxFeePerGas * BigInt(80)) / BigInt(100) * gasLimit;
      const medium = feeData.maxFeePerGas * gasLimit;
      const high = (feeData.maxFeePerGas * BigInt(150)) / BigInt(100) * gasLimit;
      
      return {
        low: ethers.formatEther(low),
        medium: ethers.formatEther(medium),
        high: ethers.formatEther(high),
        estimated: ethers.formatEther(medium),
        currency: this.getNativeCurrency(request.chain)
      };
    } else if (feeData.gasPrice) {
      const low = (feeData.gasPrice * BigInt(80)) / BigInt(100) * gasLimit;
      const medium = feeData.gasPrice * gasLimit;
      const high = (feeData.gasPrice * BigInt(150)) / BigInt(100) * gasLimit;
      
      return {
        low: ethers.formatEther(low),
        medium: ethers.formatEther(medium),
        high: ethers.formatEther(high),
        estimated: ethers.formatEther(medium),
        currency: this.getNativeCurrency(request.chain)
      };
    }
    
    throw new Error('Could not fetch fee data');
  }

  private static async signAndBroadcastEVM(
    transaction: any,
    privateKey: string,
    chain: Chain
  ): Promise<TransactionResult> {
    const provider = this.getEVMProvider(chain);
    const wallet = new ethers.Wallet(privateKey, provider);
    
    const signedTx = await wallet.signTransaction(transaction);
    const tx = await provider.broadcastTransaction(signedTx);
    
    return {
      hash: tx.hash,
      from: transaction.from,
      to: transaction.to,
      amount: ethers.formatEther(transaction.value || 0),
      fee: '0', // Will be calculated after confirmation
      status: 'pending',
      timestamp: Date.now(),
      chain
    };
  }

  // ==================== SOLANA TRANSACTIONS ====================

  private static async buildSolanaTransaction(request: TransactionRequest): Promise<any> {
    // TODO: Implement Solana transaction building
    throw new Error('Solana transactions not yet implemented');
  }

  private static async estimateSolanaFees(request: TransactionRequest): Promise<FeeEstimate> {
    // Solana has fixed fees ~0.000005 SOL
    return {
      low: '0.000005',
      medium: '0.000005',
      high: '0.00001',
      estimated: '0.000005',
      currency: 'SOL'
    };
  }

  private static async signAndBroadcastSolana(
    transaction: any,
    privateKey: string
  ): Promise<TransactionResult> {
    throw new Error('Solana transactions not yet implemented');
  }

  // ==================== TRON TRANSACTIONS ====================

  private static async buildTronTransaction(request: TransactionRequest): Promise<any> {
    // TODO: Implement TRON transaction building
    throw new Error('TRON transactions not yet implemented');
  }

  private static async estimateTronFees(request: TransactionRequest): Promise<FeeEstimate> {
    // TRON energy/bandwidth calculation needed
    return {
      low: '0',
      medium: '0',
      high: '0',
      estimated: '0',
      currency: 'TRX'
    };
  }

  private static async signAndBroadcastTron(
    transaction: any,
    privateKey: string
  ): Promise<TransactionResult> {
    throw new Error('TRON transactions not yet implemented');
  }

  // ==================== BITCOIN TRANSACTIONS ====================

  private static async buildBitcoinTransaction(request: TransactionRequest): Promise<any> {
    // TODO: Implement Bitcoin transaction building
    throw new Error('Bitcoin transactions not yet implemented');
  }

  private static async estimateBitcoinFees(request: TransactionRequest): Promise<FeeEstimate> {
    // Bitcoin fee estimation needed
    return {
      low: '0.00001',
      medium: '0.00002',
      high: '0.00005',
      estimated: '0.00002',
      currency: 'BTC'
    };
  }

  private static async signAndBroadcastBitcoin(
    transaction: any,
    privateKey: string
  ): Promise<TransactionResult> {
    throw new Error('Bitcoin transactions not yet implemented');
  }

  // ==================== HELPER METHODS ====================

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

  private static getNativeCurrency(chain: Chain): string {
    const currencies: Record<Chain, string> = {
      Ethereum: 'ETH',
      BSC: 'BNB',
      Polygon: 'MATIC',
      Arbitrum: 'ETH',
      Tron: 'TRX',
      Solana: 'SOL',
      Bitcoin: 'BTC'
    };
    
    return currencies[chain];
  }
}


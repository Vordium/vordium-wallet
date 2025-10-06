// src/services/tron.service.ts
 'use client';
import TronWeb from 'tronweb';

export interface TronNetwork {
  name: string;
  fullHost: string;
  explorerUrl: string;
}

export const TRON_NETWORKS: Record<string, TronNetwork> = {
  mainnet: {
    name: 'TRON Mainnet',
    fullHost: process.env.NEXT_PUBLIC_TRON_API || 'https://api.trongrid.io',
    explorerUrl: 'https://tronscan.org'
  }
};

export class TronService {
  private tronWeb: any;
  private network: TronNetwork;

  constructor(network: TronNetwork = TRON_NETWORKS.mainnet) {
    this.network = network;
    if (typeof window === 'undefined') {
      throw new Error('TronService must be used in the browser only');
    }
    this.tronWeb = new TronWeb({
      fullHost: network.fullHost,
      headers: { 'TRON-PRO-API-KEY': process.env.NEXT_PUBLIC_TRONGRID_API_KEY }
    });
  }

  async getBalance(address: string): Promise<string> {
    try {
      const balance = await this.tronWeb.trx.getBalance(address);
      return this.tronWeb.fromSun(balance);
    } catch (error) {
      return '0';
    }
  }

  async getTRC20TokenBalances(address: string): Promise<any[]> {
    try {
      // This would typically use TronGrid API to get TRC-20 token balances
      // For now, return empty array - this should be implemented with proper API calls
      return [];
    } catch (error) {
      console.error('Failed to get TRC-20 token balances:', error);
      return [];
    }
  }

  async sendTransaction(params: any): Promise<string> {
    // Implementation from previous artifact
    return '';
  }
}

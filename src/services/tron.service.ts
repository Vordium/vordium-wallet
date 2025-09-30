// src/services/tron.service.ts
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

  async sendTransaction(params: any): Promise<string> {
    // Implementation from previous artifact
    return '';
  }
}

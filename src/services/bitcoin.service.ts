/**
 * Bitcoin Service
 * Handles Bitcoin blockchain data and transactions
 */

import { API_CONFIG } from '@/config/api.config';

export interface BitcoinBalance {
  address: string;
  balance: number;
  balance_formatted: string;
  total_received: number;
  total_sent: number;
  tx_count: number;
  price?: number;
  value_usd?: number;
}

export interface BitcoinTransaction {
  txid: string;
  hash: string;
  version: number;
  size: number;
  vsize: number;
  weight: number;
  locktime: number;
  vin: any[];
  vout: any[];
  hex: string;
  blockhash: string;
  confirmations: number;
  time: number;
  blocktime: number;
}

export interface BitcoinUTXO {
  txid: string;
  vout: number;
  value: number;
  scriptPubKey: {
    asm: string;
    hex: string;
    reqSigs: number;
    type: string;
    addresses: string[];
  };
}

export class BitcoinService {
  private static instance: BitcoinService;
  private baseUrl: string;
  private apiKey: string;

  private constructor() {
    this.baseUrl = 'https://blockstream.info/api'; // Using Blockstream API as it's free and reliable
    this.apiKey = API_CONFIG.MORALIS.API_KEY; // We can use Moralis for Bitcoin if needed
  }

  static getInstance(): BitcoinService {
    if (!BitcoinService.instance) {
      BitcoinService.instance = new BitcoinService();
    }
    return BitcoinService.instance;
  }

  private async makeRequest(endpoint: string, params: Record<string, any> = {}): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null) {
        url.searchParams.append(key, params[key].toString());
      }
    });

    const response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Bitcoin API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get Bitcoin balance for an address
   */
  async getBalance(address: string): Promise<BitcoinBalance | null> {
    try {
      const data = await this.makeRequest(`/address/${address}`);

      return {
        address,
        balance: data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum,
        balance_formatted: ((data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum) / 100000000).toFixed(8),
        total_received: data.chain_stats.funded_txo_sum,
        total_sent: data.chain_stats.spent_txo_sum,
        tx_count: data.chain_stats.tx_count,
      };
    } catch (error) {
      console.error('Error fetching Bitcoin balance:', error);
      return null;
    }
  }

  /**
   * Get UTXOs for an address
   */
  async getUTXOs(address: string): Promise<BitcoinUTXO[]> {
    try {
      const data = await this.makeRequest(`/address/${address}/utxo`);

      return data.map((utxo: any) => ({
        txid: utxo.txid,
        vout: utxo.vout,
        value: utxo.value,
        scriptPubKey: utxo.scriptPubKey,
      }));
    } catch (error) {
      console.error('Error fetching UTXOs:', error);
      return [];
    }
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(address: string, limit: number = 50): Promise<BitcoinTransaction[]> {
    try {
      const data = await this.makeRequest(`/address/${address}/txs`, {
        limit,
      });

      return data.map((tx: any) => ({
        txid: tx.txid,
        hash: tx.hash,
        version: tx.version,
        size: tx.size,
        vsize: tx.vsize,
        weight: tx.weight,
        locktime: tx.locktime,
        vin: tx.vin,
        vout: tx.vout,
        hex: tx.hex,
        blockhash: tx.status.block_hash,
        confirmations: tx.status.confirmations,
        time: tx.status.block_time,
        blocktime: tx.status.block_time,
      }));
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      return [];
    }
  }

  /**
   * Get transaction details
   */
  async getTransaction(txid: string): Promise<BitcoinTransaction | null> {
    try {
      const data = await this.makeRequest(`/tx/${txid}`);

      return {
        txid: data.txid,
        hash: data.hash,
        version: data.version,
        size: data.size,
        vsize: data.vsize,
        weight: data.weight,
        locktime: data.locktime,
        vin: data.vin,
        vout: data.vout,
        hex: data.hex,
        blockhash: data.status.block_hash,
        confirmations: data.status.confirmations,
        time: data.status.block_time,
        blocktime: data.status.block_time,
      };
    } catch (error) {
      console.error('Error fetching transaction:', error);
      return null;
    }
  }

  /**
   * Get Bitcoin price
   */
  async getBitcoinPrice(): Promise<number | null> {
    try {
      // Using CoinGecko API for Bitcoin price
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const data = await response.json();
      return data.bitcoin?.usd || null;
    } catch (error) {
      console.error('Error fetching Bitcoin price:', error);
      return null;
    }
  }

  /**
   * Validate Bitcoin address
   */
  validateAddress(address: string): boolean {
    // Basic Bitcoin address validation
    const bitcoinRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
    return bitcoinRegex.test(address);
  }

  /**
   * Generate Bitcoin address from private key (for testing purposes)
   */
  async generateAddressFromPrivateKey(privateKey: string): Promise<string | null> {
    try {
      // This would require a Bitcoin library like bitcoinjs-lib
      // For now, we'll return null as this should be handled by a proper Bitcoin library
      console.warn('Bitcoin address generation requires bitcoinjs-lib library');
      return null;
    } catch (error) {
      console.error('Error generating Bitcoin address:', error);
      return null;
    }
  }
}

export const bitcoinService = BitcoinService.getInstance();

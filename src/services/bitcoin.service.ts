// Bitcoin Service - Live Bitcoin blockchain integration
import { API_CONFIG } from '@/config/api.config';

export interface BitcoinTransaction {
  hash: string;
  block_height: number;
  block_index: number;
  time: number;
  balance: number;
  fee: number;
  inputs: Array<{
    prev_hash: string;
    output_index: number;
    output_value: number;
    addresses: string[];
  }>;
  outputs: Array<{
    value: number;
    addresses: string[];
    script_type: string;
  }>;
}

export interface BitcoinAddressInfo {
  address: string;
  total_received: number;
  total_sent: number;
  balance: number;
  unconfirmed_balance: number;
  final_balance: number;
  n_tx: number;
  unconfirmed_n_tx: number;
  final_n_tx: number;
  txrefs: BitcoinTransaction[];
}

export interface BitcoinPrice {
  symbol: string;
  price: number;
  timestamp: number;
}

export class BitcoinService {
  private static cache = new Map<string, { data: any; timestamp: number }>();
  private static readonly CACHE_DURATION = 30000; // 30 seconds

  // Get Bitcoin balance for an address
  static async getBalance(address: string): Promise<string> {
    try {
      const cacheKey = `balance-${address}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached.balance;

      if (API_CONFIG.BLOCKCYPHER.ENABLED) {
        const balance = await this.getBlockCypherBalance(address);
        if (balance !== null) {
          this.setCachedData(cacheKey, { balance });
          return balance;
        }
      }

      if (API_CONFIG.BLOCKSTREAM.ENABLED) {
        const balance = await this.getBlockstreamBalance(address);
        if (balance !== null) {
          this.setCachedData(cacheKey, { balance });
          return balance;
        }
      }

      console.warn('No Bitcoin API configured, returning 0 balance');
      return '0';
    } catch (error) {
      console.error('Error getting Bitcoin balance:', error);
      return '0';
    }
  }

  // Get Bitcoin transactions for an address
  static async getTransactions(address: string, limit: number = 50): Promise<BitcoinTransaction[]> {
    try {
      const cacheKey = `transactions-${address}-${limit}`;
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached.transactions;

      if (API_CONFIG.BLOCKCYPHER.ENABLED) {
        const transactions = await this.getBlockCypherTransactions(address, limit);
        if (transactions) {
          this.setCachedData(cacheKey, { transactions });
          return transactions;
        }
      }

      if (API_CONFIG.BLOCKSTREAM.ENABLED) {
        const transactions = await this.getBlockstreamTransactions(address, limit);
        if (transactions) {
          this.setCachedData(cacheKey, { transactions });
          return transactions;
        }
      }

      console.warn('No Bitcoin API configured, returning empty transactions');
      return [];
    } catch (error) {
      console.error('Error getting Bitcoin transactions:', error);
      return [];
    }
  }

  // Get Bitcoin price
  static async getPrice(): Promise<BitcoinPrice | null> {
    try {
      const cacheKey = 'bitcoin-price';
      const cached = this.getCachedData(cacheKey);
      if (cached) return cached.price;

      if (API_CONFIG.COINGECKO.ENABLED) {
        const price = await this.getCoinGeckoPrice();
        if (price) {
          this.setCachedData(cacheKey, { price });
          return price;
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting Bitcoin price:', error);
      return null;
    }
  }

  // Validate Bitcoin address
  static validateAddress(address: string): boolean {
    // Basic Bitcoin address validation
    const patterns = [
      /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/, // Legacy addresses
      /^bc1[a-z0-9]{39,59}$/, // Bech32 addresses
    ];

    return patterns.some(pattern => pattern.test(address));
  }

  // Get balance from BlockCypher
  private static async getBlockCypherBalance(address: string): Promise<string | null> {
    try {
      const url = `${API_CONFIG.BLOCKCYPHER.API_URL}/addrs/${address}/balance`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          ...(API_CONFIG.BLOCKCYPHER.API_KEY && { 'Authorization': `Bearer ${API_CONFIG.BLOCKCYPHER.API_KEY}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`BlockCypher API error: ${response.status}`);
      }

      const data = await response.json();
      const balance = data.balance || 0;
      return (balance / 100000000).toFixed(8); // Convert satoshis to BTC
    } catch (error) {
      console.error('BlockCypher balance error:', error);
      return null;
    }
  }

  // Get balance from Blockstream
  private static async getBlockstreamBalance(address: string): Promise<string | null> {
    try {
      const url = `${API_CONFIG.BLOCKSTREAM.API_URL}/address/${address}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Blockstream API error: ${response.status}`);
      }

      const data = await response.json();
      const balance = data.chain_stats.funded_txo_sum - data.chain_stats.spent_txo_sum;
      return (balance / 100000000).toFixed(8); // Convert satoshis to BTC
    } catch (error) {
      console.error('Blockstream balance error:', error);
      return null;
    }
  }

  // Get transactions from BlockCypher
  private static async getBlockCypherTransactions(address: string, limit: number): Promise<BitcoinTransaction[] | null> {
    try {
      const url = `${API_CONFIG.BLOCKCYPHER.API_URL}/addrs/${address}/full?limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          ...(API_CONFIG.BLOCKCYPHER.API_KEY && { 'Authorization': `Bearer ${API_CONFIG.BLOCKCYPHER.API_KEY}` }),
        },
      });

      if (!response.ok) {
        throw new Error(`BlockCypher API error: ${response.status}`);
      }

      const data = await response.json();
      return data.txs || [];
    } catch (error) {
      console.error('BlockCypher transactions error:', error);
      return null;
    }
  }

  // Get transactions from Blockstream
  private static async getBlockstreamTransactions(address: string, limit: number): Promise<BitcoinTransaction[] | null> {
    try {
      const url = `${API_CONFIG.BLOCKSTREAM.API_URL}/address/${address}/txs?limit=${limit}`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Blockstream API error: ${response.status}`);
      }

      const data = await response.json();
      return data.map((tx: any) => ({
        hash: tx.txid,
        block_height: tx.status.block_height,
        block_index: tx.status.block_time,
        time: tx.status.block_time,
        balance: tx.vout.reduce((sum: number, output: any) => sum + output.value, 0),
        fee: tx.fee,
        inputs: tx.vin.map((input: any) => ({
          prev_hash: input.txid,
          output_index: input.vout,
          output_value: 0, // Blockstream doesn't provide this easily
          addresses: input.prevout?.scriptpubkey_address ? [input.prevout.scriptpubkey_address] : [],
        })),
        outputs: tx.vout.map((output: any) => ({
          value: output.value,
          addresses: output.scriptpubkey_address ? [output.scriptpubkey_address] : [],
          script_type: output.scriptpubkey_type,
        })),
      }));
    } catch (error) {
      console.error('Blockstream transactions error:', error);
      return null;
    }
  }

  // Get price from CoinGecko
  private static async getCoinGeckoPrice(): Promise<BitcoinPrice | null> {
    try {
      const url = `${API_CONFIG.COINGECKO.API_URL}/simple/price?ids=bitcoin&vs_currencies=usd`;
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          ...(API_CONFIG.COINGECKO.API_KEY && { 'x-cg-demo-api-key': API_CONFIG.COINGECKO.API_KEY }),
        },
      });

      if (!response.ok) {
        throw new Error(`CoinGecko API error: ${response.status}`);
      }

      const data = await response.json();
      if (data.bitcoin && data.bitcoin.usd) {
        return {
          symbol: 'BTC',
          price: data.bitcoin.usd,
          timestamp: Date.now(),
        };
      }

      return null;
    } catch (error) {
      console.error('CoinGecko price error:', error);
      return null;
    }
  }

  // Cache management
  private static getCachedData(key: string): any {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }
    return null;
  }

  private static setCachedData(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }
}
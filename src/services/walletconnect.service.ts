'use client';

import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { WalletConnectModal } from '@walletconnect/modal';

export interface WalletConnectConfig {
  projectId: string;
  chains: number[];
  optionalChains: number[];
  rpcMap: Record<number, string>;
}

export interface DAppSession {
  topic: string;
  peer: {
    metadata: {
      name: string;
      description: string;
      url: string;
      icons: string[];
    };
  };
  namespaces: Record<string, any>;
  expiry: number;
}

export class WalletConnectService {
  private static instance: WalletConnectService;
  private provider: EthereumProvider | null = null;
  private modal: WalletConnectModal | null = null;
  private sessions: DAppSession[] = [];

  private constructor() {}

  static getInstance(): WalletConnectService {
    if (!WalletConnectService.instance) {
      WalletConnectService.instance = new WalletConnectService();
    }
    return WalletConnectService.instance;
  }

  async initialize(config: WalletConnectConfig): Promise<void> {
    try {
      // Initialize Ethereum Provider
      this.provider = await EthereumProvider.init({
        projectId: config.projectId,
        chains: config.chains,
        optionalChains: config.optionalChains,
        rpcMap: config.rpcMap,
        showQrModal: false, // We'll handle QR code ourselves
      });

      // Initialize Modal
      this.modal = new WalletConnectModal({
        projectId: config.projectId,
        enableExplorer: true,
        themeMode: 'dark',
        themeVariables: {
          '--wcm-z-index': '1000',
        },
      });

      // Set up event listeners
      this.setupEventListeners();

      // Load existing sessions
      this.loadSessions();
    } catch (error) {
      console.error('Failed to initialize WalletConnect:', error);
      throw error;
    }
  }

  private setupEventListeners(): void {
    if (!this.provider) return;

    this.provider.on('connect', (session) => {
      console.log('WalletConnect connected:', session);
      this.addSession(session as DAppSession);
    });

    this.provider.on('disconnect', (session) => {
      console.log('WalletConnect disconnected:', session);
      this.removeSession(session.topic);
    });

    this.provider.on('session_update', (session) => {
      console.log('WalletConnect session updated:', session);
      this.updateSession(session as DAppSession);
    });

    this.provider.on('display_uri', (uri) => {
      console.log('WalletConnect URI:', uri);
      // You can display the QR code here
      this.showQRCode(uri);
    });
  }

  private loadSessions(): void {
    if (!this.provider) return;

    try {
      const sessions = this.provider.session?.values || [];
      this.sessions = Array.from(sessions).map((session: any) => ({
        topic: session.topic,
        peer: session.peer,
        namespaces: session.namespaces,
        expiry: session.expiry,
      }));
    } catch (error) {
      console.error('Failed to load sessions:', error);
    }
  }

  private addSession(session: DAppSession): void {
    this.sessions.push(session);
    this.saveSessions();
  }

  private removeSession(topic: string): void {
    this.sessions = this.sessions.filter(session => session.topic !== topic);
    this.saveSessions();
  }

  private updateSession(updatedSession: DAppSession): void {
    this.sessions = this.sessions.map(session =>
      session.topic === updatedSession.topic ? updatedSession : session
    );
    this.saveSessions();
  }

  private saveSessions(): void {
    localStorage.setItem('walletconnect-sessions', JSON.stringify(this.sessions));
  }

  private showQRCode(uri: string): void {
    // Create a simple QR code modal
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    modal.innerHTML = `
      <div class="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <div class="text-center">
          <h3 class="text-lg font-semibold text-white mb-4">Connect to DApp</h3>
          <div class="bg-white p-4 rounded-xl mb-4">
            <div id="qrcode" class="flex justify-center"></div>
          </div>
          <p class="text-gray-400 text-sm mb-4">Scan QR code with your wallet</p>
          <button id="close-qr" class="w-full py-2 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition">
            Close
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Generate QR code (you might want to use a QR code library)
    const qrContainer = modal.querySelector('#qrcode');
    if (qrContainer) {
      qrContainer.innerHTML = `
        <div class="text-gray-600 text-xs break-all p-2">
          ${uri}
        </div>
      `;
    }
    
    // Close modal
    modal.querySelector('#close-qr')?.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }

  async connect(): Promise<void> {
    if (!this.provider) {
      throw new Error('WalletConnect not initialized');
    }

    try {
      await this.provider.connect();
    } catch (error) {
      console.error('Failed to connect:', error);
      throw error;
    }
  }

  async disconnect(sessionTopic?: string): Promise<void> {
    if (!this.provider) {
      throw new Error('WalletConnect not initialized');
    }

    try {
      if (sessionTopic) {
        await this.provider.disconnect({ topic: sessionTopic });
      } else {
        await this.provider.disconnect();
      }
    } catch (error) {
      console.error('Failed to disconnect:', error);
      throw error;
    }
  }

  getSessions(): DAppSession[] {
    return this.sessions;
  }

  getProvider(): EthereumProvider | null {
    return this.provider;
  }

  isConnected(): boolean {
    return this.provider?.connected || false;
  }

  async request(method: string, params: any[]): Promise<any> {
    if (!this.provider) {
      throw new Error('WalletConnect not initialized');
    }

    try {
      return await this.provider.request({ method, params });
    } catch (error) {
      console.error('WalletConnect request failed:', error);
      throw error;
    }
  }

  async getAccounts(): Promise<string[]> {
    if (!this.provider) {
      throw new Error('WalletConnect not initialized');
    }

    try {
      return await this.provider.request({ method: 'eth_accounts' });
    } catch (error) {
      console.error('Failed to get accounts:', error);
      return [];
    }
  }

  async getChainId(): Promise<number> {
    if (!this.provider) {
      throw new Error('WalletConnect not initialized');
    }

    try {
      const chainId = await this.provider.request({ method: 'eth_chainId' });
      return parseInt(chainId, 16);
    } catch (error) {
      console.error('Failed to get chain ID:', error);
      return 1; // Default to Ethereum mainnet
    }
  }

  async switchChain(chainId: number): Promise<void> {
    if (!this.provider) {
      throw new Error('WalletConnect not initialized');
    }

    try {
      await this.provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } catch (error) {
      console.error('Failed to switch chain:', error);
      throw error;
    }
  }
}

// Default configuration
export const DEFAULT_WALLETCONNECT_CONFIG: WalletConnectConfig = {
  projectId: 'your-project-id', // Replace with your WalletConnect Project ID
  chains: [1], // Ethereum mainnet
  optionalChains: [137, 56, 42161, 10], // Polygon, BSC, Arbitrum, Optimism
  rpcMap: {
    1: 'https://eth-mainnet.g.alchemy.com/v2/demo',
    137: 'https://polygon-rpc.com',
    56: 'https://bsc-dataseed.binance.org',
    42161: 'https://arb1.arbitrum.io/rpc',
    10: 'https://mainnet.optimism.io',
  },
};
// src/services/evm.service.ts
import { ethers } from 'ethers';

const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
  'function transfer(address to, uint256 amount) returns (bool)'
];

export interface EVMNetwork {
  chainId: number;
  name: string;
  rpcUrl: string;
  symbol: string;
  explorerUrl: string;
}

export const EVM_NETWORKS: Record<string, EVMNetwork> = {
  ethereum: {
    chainId: 1,
    name: 'Ethereum Mainnet',
    rpcUrl: process.env.NEXT_PUBLIC_ETHEREUM_RPC || '',
    symbol: 'ETH',
    explorerUrl: 'https://etherscan.io'
  },
  polygon: {
    chainId: 137,
    name: 'Polygon',
    rpcUrl: process.env.NEXT_PUBLIC_POLYGON_RPC || '',
    symbol: 'MATIC',
    explorerUrl: 'https://polygonscan.com'
  }
};

export class EVMService {
  private provider: ethers.JsonRpcProvider;
  private network: EVMNetwork;

  constructor(network: EVMNetwork = EVM_NETWORKS.ethereum) {
    this.network = network;
    this.provider = new ethers.JsonRpcProvider(network.rpcUrl);
  }

  async getBalance(address: string): Promise<string> {
    const balance = await this.provider.getBalance(address);
    return ethers.formatEther(balance);
  }

  async getTokenBalance(tokenAddress: string, walletAddress: string): Promise<string> {
    try {
      const contract = new ethers.Contract(tokenAddress, ERC20_ABI, this.provider);
      const balance = await contract.balanceOf(walletAddress);
      const decimals = await contract.decimals();
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      return '0';
    }
  }

  async sendTransaction(params: any): Promise<string> {
    // Implementation from previous artifact
    return '';
  }
}

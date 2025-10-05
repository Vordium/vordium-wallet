import { ethers } from 'ethers';

export function getTrustWalletLogo(chain: string, address: string): string {
  const chainMap: Record<string, string> = {
    'Ethereum': 'ethereum',
    'Tron': 'tron',
    'Polygon': 'polygon',
    'BSC': 'smartchain',
  };

  const chainName = chainMap[chain] || chain.toLowerCase();

  // For EVM chains, use checksum address
  if (chain === 'Ethereum' || chain === 'Polygon' || chain === 'BSC') {
    try {
      const checksumAddress = ethers.getAddress(address);
      return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainName}/assets/${checksumAddress}/logo.png`;
    } catch {
      return '';
    }
  }

  return `https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/${chainName}/assets/${address}/logo.png`;
}

export const NATIVE_LOGOS: Record<string, string> = {
  'ETH': 'https://via.placeholder.com/64/6B7280/FFFFFF?text=ETH',
  'TRX': 'https://via.placeholder.com/64/6B7280/FFFFFF?text=TRX',
  'SOL': 'https://via.placeholder.com/64/6B7280/FFFFFF?text=SOL',
  'BTC': 'https://via.placeholder.com/64/6B7280/FFFFFF?text=BTC',
  'BNB': 'https://via.placeholder.com/64/6B7280/FFFFFF?text=BNB',
  'MATIC': 'https://via.placeholder.com/64/6B7280/FFFFFF?text=MATIC',
};


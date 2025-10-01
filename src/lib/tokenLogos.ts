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
  'ETH': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/ethereum/info/logo.png',
  'TRX': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/tron/info/logo.png',
  'BNB': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/smartchain/info/logo.png',
  'MATIC': 'https://raw.githubusercontent.com/trustwallet/assets/master/blockchains/polygon/info/logo.png',
};


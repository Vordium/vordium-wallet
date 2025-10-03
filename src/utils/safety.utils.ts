import { ethers } from 'ethers';
import TronWeb from 'tronweb';

export function isValidAddress(address: string, chain: 'EVM' | 'TRON' | 'SOLANA' | 'BITCOIN'): boolean {
  if (chain === 'EVM') return ethers.isAddress(address);
  if (chain === 'TRON') {
    try {
      return TronWeb.isAddress(address);
    } catch {
      return false;
    }
  }
  if (chain === 'SOLANA') {
    // Basic Solana address validation (base58, 32-44 characters)
    const solanaRegex = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;
    return solanaRegex.test(address);
  }
  if (chain === 'BITCOIN') {
    // Basic Bitcoin address validation
    const bitcoinRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/;
    return bitcoinRegex.test(address);
  }
  return false;
}

export function clampAmount(value: string, decimals: number): string {
  if (!value) return '0';
  const [i, f = ''] = value.split('.');
  return f.length > decimals ? `${i}.${f.slice(0, decimals)}` : value;
}

export function isPositiveNumber(value: string): boolean {
  if (!value) return false;
  const n = Number(value);
  return Number.isFinite(n) && n > 0;
}



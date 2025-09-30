import { ethers } from 'ethers';
import TronWeb from 'tronweb';

export function isValidAddress(address: string, chain: 'EVM' | 'TRON'): boolean {
  if (chain === 'EVM') return ethers.isAddress(address);
  try {
    return TronWeb.isAddress(address);
  } catch {
    return false;
  }
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



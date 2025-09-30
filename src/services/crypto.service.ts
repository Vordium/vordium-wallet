// src/services/crypto.service.ts
import * as bip39 from 'bip39';
import { HDKey } from '@scure/bip32';
import { ethers } from 'ethers';
import TronWeb from 'tronweb';
import * as argon2 from 'argon2-browser';

// Derivation paths
const EVM_PATH = "m/44'/60'/0'/0"; // EIP-44 standard
const TRON_PATH = "m/44'/195'/0'/0"; // TRON standard

export type ChainType = 'EVM' | 'TRON';

export interface DerivedAccount {
  address: string;
  privateKey: string;
  publicKey: string;
  derivationPath: string;
  index: number;
  chainType: ChainType;
}

export interface EncryptedVault {
  ciphertext: string;
  iv: string;
  salt: string;
  iterations: number;
}

export class CryptoService {
  static generateMnemonic(wordCount: 12 | 24 = 12): string {
    const strength = wordCount === 12 ? 128 : 256;
    return bip39.generateMnemonic(strength);
  }

  static validateMnemonic(mnemonic: string): boolean {
    return bip39.validateMnemonic(mnemonic);
  }

  static async mnemonicToSeed(mnemonic: string, passphrase?: string): Promise<Uint8Array> {
    const seed = await bip39.mnemonicToSeed(mnemonic, passphrase);
    return new Uint8Array(seed);
  }

  static async deriveAccount(
    seed: Uint8Array,
    chainType: ChainType,
    index: number
  ): Promise<DerivedAccount> {
    const masterKey = HDKey.fromMasterSeed(seed);
    const path = chainType === 'EVM' ? EVM_PATH : TRON_PATH;
    const fullPath = `${path}/${index}`;
    
    const child = masterKey.derive(fullPath);
    
    if (!child.privateKey) {
      throw new Error('Failed to derive private key');
    }

    if (chainType === 'EVM') {
      return this.deriveEVMAccount(child.privateKey, fullPath, index);
    } else {
      return this.deriveTronAccount(child.privateKey, fullPath, index);
    }
  }

  private static deriveEVMAccount(
    privateKey: Uint8Array,
    derivationPath: string,
    index: number
  ): DerivedAccount {
    const privateKeyHex = '0x' + this.bytesToHex(privateKey);
    const wallet = new ethers.Wallet(privateKeyHex);
    
    const signingKey = new ethers.SigningKey(privateKeyHex);
    const publicKey = signingKey.publicKey;
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey,
      derivationPath,
      index,
      chainType: 'EVM'
    };
  }

  private static deriveTronAccount(
    privateKey: Uint8Array,
    derivationPath: string,
    index: number
  ): DerivedAccount {
    const privateKeyHex = this.bytesToHex(privateKey);
    const address = TronWeb.address.fromPrivateKey(privateKeyHex);
    
    return {
      address,
      privateKey: '0x' + privateKeyHex,
      publicKey: '',
      derivationPath,
      index,
      chainType: 'TRON'
    };
  }

  static importPrivateKey(privateKey: string, chainType: ChainType): DerivedAccount {
    const cleanKey = privateKey.startsWith('0x') ? privateKey.slice(2) : privateKey;
    const keyBytes = this.hexToBytes(cleanKey);

    if (chainType === 'EVM') {
      return this.deriveEVMAccount(keyBytes, 'imported', 0);
    } else {
      return this.deriveTronAccount(keyBytes, 'imported', 0);
    }
  }

  static async encrypt(data: string, password: string): Promise<EncryptedVault> {
    const salt = crypto.getRandomValues(new Uint8Array(32));
    
    const result = await argon2.hash({
      pass: password,
      salt: salt,
      type: argon2.ArgonType.Argon2id,
      time: 3,
      mem: 65536,
      hashLen: 32,
      parallelism: 1
    });

    const key = result.hash;
    const iv = crypto.getRandomValues(new Uint8Array(12));
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-GCM' },
      false,
      ['encrypt']
    );

    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    
    const ciphertext = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      dataBuffer
    );

    return {
      ciphertext: this.uint8ToBase64(new Uint8Array(ciphertext)),
      iv: this.uint8ToBase64(iv),
      salt: this.uint8ToBase64(salt),
      iterations: 3
    };
  }

  static async decrypt(vault: EncryptedVault, password: string): Promise<string> {
    const salt = this.base64ToUint8(vault.salt);
    const iv = this.base64ToUint8(vault.iv);
    const ciphertext = this.base64ToUint8(vault.ciphertext);

    const result = await argon2.hash({
      pass: password,
      salt: salt,
      type: argon2.ArgonType.Argon2id,
      time: vault.iterations,
      mem: 65536,
      hashLen: 32,
      parallelism: 1
    });

    const key = result.hash;

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      key,
      { name: 'AES-GCM' },
      false,
      ['decrypt']
    );

    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      cryptoKey,
      ciphertext.buffer
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  private static uint8ToBase64(bytes: Uint8Array): string {
    let binary = '';
    const chunkSize = 0x8000;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, Array.from(chunk));
    }
    return btoa(binary);
  }

  private static base64ToUint8(base64: string): Uint8Array {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes;
  }

  private static hexToBytes(hex: string): Uint8Array {
    const len = hex.length;
    const out = new Uint8Array(len / 2);
    for (let i = 0; i < len; i += 2) {
      out[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return out;
  }

  private static bytesToHex(bytes: Uint8Array): string {
    return Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  static isValidEVMAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  static isValidTronAddress(address: string): boolean {
    return TronWeb.isAddress(address);
  }

  static isValidAddress(address: string, chainType: ChainType): boolean {
    if (chainType === 'EVM') {
      return this.isValidEVMAddress(address);
    } else {
      return this.isValidTronAddress(address);
    }
  }
}

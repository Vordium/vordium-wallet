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

  static async mnemonicToSeed(mnemonic: string, passphrase?: string): Promise<Buffer> {
    return bip39.mnemonicToSeed(mnemonic, passphrase);
  }

  static async deriveAccount(
    seed: Buffer,
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
    privateKey: Buffer,
    derivationPath: string,
    index: number
  ): DerivedAccount {
    const wallet = new ethers.Wallet(privateKey);
    
    return {
      address: wallet.address,
      privateKey: wallet.privateKey,
      publicKey: wallet.publicKey,
      derivationPath,
      index,
      chainType: 'EVM'
    };
  }

  private static deriveTronAccount(
    privateKey: Buffer,
    derivationPath: string,
    index: number
  ): DerivedAccount {
    const privateKeyHex = privateKey.toString('hex');
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
    const keyBuffer = Buffer.from(cleanKey, 'hex');

    if (chainType === 'EVM') {
      return this.deriveEVMAccount(keyBuffer, 'imported', 0);
    } else {
      return this.deriveTronAccount(keyBuffer, 'imported', 0);
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
      ciphertext: this.bufferToBase64(new Uint8Array(ciphertext)),
      iv: this.bufferToBase64(iv),
      salt: this.bufferToBase64(salt),
      iterations: 3
    };
  }

  static async decrypt(vault: EncryptedVault, password: string): Promise<string> {
    const salt = this.base64ToBuffer(vault.salt);
    const iv = this.base64ToBuffer(vault.iv);
    const ciphertext = this.base64ToBuffer(vault.ciphertext);

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
      ciphertext
    );

    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  }

  private static bufferToBase64(buffer: Uint8Array): string {
    return Buffer.from(buffer).toString('base64');
  }

  private static base64ToBuffer(base64: string): Uint8Array {
    return new Uint8Array(Buffer.from(base64, 'base64'));
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

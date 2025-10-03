/**
 * Biometric Authentication Service
 * Handles fingerprint, face ID, and other biometric authentication methods
 */

export interface BiometricCapabilities {
  isSupported: boolean;
  hasFingerprint: boolean;
  hasFaceId: boolean;
  hasIris: boolean;
  hasVoice: boolean;
}

export interface BiometricResult {
  success: boolean;
  error?: string;
  method?: 'fingerprint' | 'face' | 'iris' | 'voice';
}

export class BiometricService {
  private static instance: BiometricService;
  private capabilities: BiometricCapabilities | null = null;

  private constructor() {}

  static getInstance(): BiometricService {
    if (!BiometricService.instance) {
      BiometricService.instance = new BiometricService();
    }
    return BiometricService.instance;
  }

  /**
   * Check if biometric authentication is supported on this device
   */
  async checkCapabilities(): Promise<BiometricCapabilities> {
    if (this.capabilities) {
      return this.capabilities;
    }

    const capabilities: BiometricCapabilities = {
      isSupported: false,
      hasFingerprint: false,
      hasFaceId: false,
      hasIris: false,
      hasVoice: false,
    };

    try {
      // Check if WebAuthn is supported
      if (window.PublicKeyCredential && 
          typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === 'function') {
        
        const isAvailable = await window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        capabilities.isSupported = isAvailable;

        if (isAvailable) {
          // Check for specific biometric types
          const authenticators = await navigator.credentials.create({
            publicKey: {
              challenge: new Uint8Array(32),
              rp: { name: 'Vordium Wallet' },
              user: {
                id: new Uint8Array(32),
                name: 'user',
                displayName: 'User',
              },
              pubKeyCredParams: [{ type: 'public-key', alg: -7 }],
              authenticatorSelection: {
                authenticatorAttachment: 'platform',
                userVerification: 'required',
              },
              timeout: 60000,
            },
          });

          // For now, we'll assume fingerprint and face ID are available if WebAuthn is supported
          // In a real implementation, you'd check the authenticator's capabilities
          capabilities.hasFingerprint = true;
          capabilities.hasFaceId = true;
        }
      }

      // Check for iOS Touch ID / Face ID
      if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad')) {
        capabilities.isSupported = true;
        capabilities.hasFingerprint = true;
        capabilities.hasFaceId = true;
      }

      // Check for Android fingerprint
      if (navigator.userAgent.includes('Android')) {
        capabilities.isSupported = true;
        capabilities.hasFingerprint = true;
      }

    } catch (error) {
      console.warn('Biometric capabilities check failed:', error);
    }

    this.capabilities = capabilities;
    return capabilities;
  }

  /**
   * Register biometric authentication
   */
  async registerBiometric(userId: string, displayName: string): Promise<BiometricResult> {
    try {
      const capabilities = await this.checkCapabilities();
      
      if (!capabilities.isSupported) {
        return {
          success: false,
          error: 'Biometric authentication is not supported on this device'
        };
      }

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { 
            name: 'Vordium Wallet',
            id: window.location.hostname
          },
          user: {
            id: new TextEncoder().encode(userId),
            name: userId,
            displayName: displayName,
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 }, // ES256
            { type: 'public-key', alg: -257 }, // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required',
          },
          timeout: 60000,
        },
      });

      if (credential) {
        // Store the credential ID for future authentication
        const credentialId = (credential as any).rawId;
        localStorage.setItem('vordium_biometric_credential', btoa(String.fromCharCode(...new Uint8Array(credentialId))));
        
        return {
          success: true,
          method: capabilities.hasFaceId ? 'face' : 'fingerprint'
        };
      }

      return {
        success: false,
        error: 'Failed to register biometric authentication'
      };

    } catch (error) {
      console.error('Biometric registration failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  /**
   * Authenticate using biometric
   */
  async authenticateBiometric(): Promise<BiometricResult> {
    try {
      const capabilities = await this.checkCapabilities();
      
      if (!capabilities.isSupported) {
        return {
          success: false,
          error: 'Biometric authentication is not supported on this device'
        };
      }

      const storedCredentialId = localStorage.getItem('vordium_biometric_credential');
      if (!storedCredentialId) {
        return {
          success: false,
          error: 'No biometric credential found. Please register first.'
        };
      }

      const credentialId = Uint8Array.from(atob(storedCredentialId), c => c.charCodeAt(0));

      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(32),
          allowCredentials: [{
            type: 'public-key',
            id: credentialId,
          }],
          userVerification: 'required',
          timeout: 60000,
        },
      });

      if (credential) {
        return {
          success: true,
          method: capabilities.hasFaceId ? 'face' : 'fingerprint'
        };
      }

      return {
        success: false,
        error: 'Biometric authentication failed'
      };

    } catch (error) {
      console.error('Biometric authentication failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      };
    }
  }

  /**
   * Check if biometric is enrolled
   */
  async isBiometricEnrolled(): Promise<boolean> {
    const storedCredentialId = localStorage.getItem('vordium_biometric_credential');
    return !!storedCredentialId;
  }

  /**
   * Remove biometric authentication
   */
  async removeBiometric(): Promise<boolean> {
    try {
      localStorage.removeItem('vordium_biometric_credential');
      return true;
    } catch (error) {
      console.error('Failed to remove biometric:', error);
      return false;
    }
  }

  /**
   * Get available biometric methods
   */
  async getAvailableMethods(): Promise<string[]> {
    const capabilities = await this.checkCapabilities();
    const methods: string[] = [];

    if (capabilities.hasFingerprint) methods.push('fingerprint');
    if (capabilities.hasFaceId) methods.push('face');
    if (capabilities.hasIris) methods.push('iris');
    if (capabilities.hasVoice) methods.push('voice');

    return methods;
  }
}

export const biometricService = BiometricService.getInstance();

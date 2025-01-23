import { 
  SignalClient,
  PreKeyBundle,
  ProtocolAddress,
  PrivateKey,
  PublicKey,
} from '@signalapp/libsignal-client';

import SignalStore from './signalStore';
import { Buffer } from 'buffer';
window.Buffer = Buffer; // Add this global polyfill

class SignalWrapper {
  constructor(userId) {
    this.userId = userId;
    this.store = new SignalStore(userId);
  }

  async initialize() {
    if (!await this.store.hasIdentity()) {
      await this.generateKeys();
    }
  }

  async generateKeys() {
    const identityKeyPair = await PrivateKey.generate();
    const registrationId = Math.floor(Math.random() * 16383);
    
    // Generate prekeys
    const preKeys = await Promise.all(
      Array.from({ length: 5 }, (_, i) => 
        PrivateKey.generate().then(key => ({
          keyId: i,
          keyPair: key
        }))
      )
    );

    // Generate signed prekey
    const signedPreKey = await PrivateKey.generate();
    const signature = identityKeyPair.sign(signedPreKey.getPublicKey().serialize());

    // Store keys locally
    await this.store.storeIdentity(identityKeyPair);
    await this.store.storeRegistrationId(registrationId);
    await this.store.storeSignedPreKey(signedPreKey, signature);
    await Promise.all(preKeys.map(key => this.store.storePreKey(key)));

    // Return public keys for server storage
    return {
      identityPublicKey: identityKeyPair.getPublicKey().serialize().toString('base64'),
      registrationId,
      signedPreKey: {
        keyId: 0,
        publicKey: signedPreKey.getPublicKey().serialize().toString('base64'),
        signature: signature.toString('base64')
      },
      preKeys: preKeys.map((key, i) => ({
        keyId: i,
        publicKey: key.keyPair.getPublicKey().serialize().toString('base64')
      }))
    };
  }

  async encryptMessage(recipientId, message) {
    try {
        const response = await fetch(`/api/keys/${recipientId}`);
        const recipientBundle = await response.json();
        
        const address = ProtocolAddress.new(recipientId, 0);
        const session = new SignalClient.SessionBuilder(
            this.store,
            address,
            await this.store.getIdentity()
        );

        const preKeyBundle = PreKeyBundle.new(
            recipientBundle.registrationId,
            PublicKey.deserialize(Buffer.from(recipientBundle.identityPublicKey, 'base64')),
            recipientBundle.signedPreKey.keyId,
            PublicKey.deserialize(Buffer.from(recipientBundle.signedPreKey.publicKey, 'base64')),
            Buffer.from(recipientBundle.signedPreKey.signature, 'base64'),
            recipientBundle.preKey.keyId,
            PublicKey.deserialize(Buffer.from(recipientBundle.preKey.publicKey, 'base64'))
        );

        await session.processPreKeyBundle(preKeyBundle);

        const cipher = new SignalClient.SessionCipher(this.store, address);
        const encrypted = await cipher.encrypt(Buffer.from(message));
        
        return {
            cipherText: encrypted.serialize().toString('base64'),
            messageType: encrypted.type() === 3 ? 'prekey' : 'ciphertext'
        };
    } catch (error) {
        console.error('Encryption failed:', error);
        throw error;
    }
  }

  async decryptMessage(encryptedData) {
    try {
        const address = ProtocolAddress.new(encryptedData.senderId, 0);
        const cipher = new SignalClient.SessionCipher(this.store, address);
        
        const message = SignalClient.PreKeySignalMessage.deserialize(
            Buffer.from(encryptedData.cipherText, 'base64')
        );

        const decrypted = await cipher.decryptPreKeySignalMessage(message);
        return decrypted.toString('utf-8');
    } catch (error) {
        console.error('Decryption failed:', error);
        throw error;
    }
  }
}

export default SignalWrapper;
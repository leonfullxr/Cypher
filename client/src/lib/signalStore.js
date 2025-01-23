import localforage from 'localforage';

import { Buffer } from 'buffer';
window.Buffer = Buffer; // Add this global polyfill

class SignalStore {
    constructor(userId) {
        this.userId = userId;
        this.store = localforage.createInstance({
            name: `signal-store-${userId}`
        });
    }

    async storeIdentity(keyPair) {
        await this.store.setItem('identityKey', keyPair);
    }

    async getIdentity() {
        return this.store.getItem('identityKey');
    }

    async hasIdentity() {
        return this.store.getItem('identityKey') !== null;
    }

    async storeRegistrationId(id) {
        await this.store.setItem('registrationId', id);
    }

    async storeSignedPreKey(key, signature) {
        await this.store.setItem('signedPreKey', { key, signature });
    }

    async storePreKey(preKey) {
        await this.store.setItem(`preKey${preKey.keyId}`, preKey);
    }

    async removePreKey(keyId) {
        await this.store.removeItem(`preKey${keyId}`);
    }

    // TODO: apply mongoDB or other necessary database, mariano
}

export default SignalStore;
import { 
    PrivateKey
} from '@signalapp/libsignal-client';

import { Buffer } from 'buffer';
window.Buffer = Buffer; // Add this global polyfill

export const generateSignalKeys = async () => {
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
};
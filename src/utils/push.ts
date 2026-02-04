// resources/js/utils/push.ts
import axios from 'axios';

const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export const subscribeToPush = async () => {
    if (!('serviceWorker' in navigator)) {
        throw new Error('Service Worker not supported in this browser.');
    }

    if (!('PushManager' in window)) {
        throw new Error('Push notifications not supported in this browser.');
    }

    // 1. Register Service Worker
    const registration = await navigator.serviceWorker.register('/sw.js');
    await navigator.serviceWorker.ready;

    // 2. Get VAPID Key from meta tag
    const vapidMeta = document.querySelector('meta[name="vapid-public-key"]');
    if (!vapidMeta) {
        throw new Error('VAPID Public Key not found in HTML head.');
    }
    const vapidPublicKey = vapidMeta.getAttribute('content');

    // 3. Subscribe to PushManager
    const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey!)
    });

    // 4. Send subscription to Backend
    // We send the raw JSON which contains endpoint, keys (p256dh, auth)
    await axios.post('/api/subscriptions', subscription);
    
    return true;
};
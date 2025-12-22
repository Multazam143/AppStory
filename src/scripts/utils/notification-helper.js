// src/scripts/utils/notification-helper.js
import StoryApi from '../data/story-api';

const NotificationHelper = {
  _publicKey: 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk',

  async init({ subscribeButton, unsubscribeButton }) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      console.log('Service Worker or Push not supported');
      return;
    }

    await this._registerServiceWorker();
    await this._initialListener(subscribeButton, unsubscribeButton);
  },

  async _registerServiceWorker() {
    try {
      await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered');
    } catch (error) {
      console.error('Failed to register Service Worker', error);
    }
  },

  async _initialListener(subscribeButton, unsubscribeButton) {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    const isSubscribed = subscription !== null;

    this._updateButtonStyle(isSubscribed, subscribeButton, unsubscribeButton);

    subscribeButton.addEventListener('click', async (event) => {
      event.preventDefault();
      await this._subscribePush(subscribeButton, unsubscribeButton);
    });

    unsubscribeButton.addEventListener('click', async (event) => {
      event.preventDefault();
      await this._unsubscribePush(subscribeButton, unsubscribeButton);
    });
  },

  async _subscribePush(subscribeButton, unsubscribeButton) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Izin notifikasi ditolak.');
        return;
      }

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this._urlBase64ToUint8Array(this._publicKey),
      });

      const payload = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: this._arrayBufferToBase64(subscription.getKey('p256dh')),
          auth: this._arrayBufferToBase64(subscription.getKey('auth')),
        },
      };

      const response = await StoryApi.subscribeToNotification(payload);

      if (!response.error) {
        this._updateButtonStyle(true, subscribeButton, unsubscribeButton);
        alert('Berhasil berlangganan notifikasi!');
      } else {
        throw new Error(response.message);
      }

    } catch (error) {
      console.error('Gagal subscribe:', error);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) await subscription.unsubscribe();
      
      alert('Gagal mengaktifkan notifikasi: ' + error.message);
    }
  },

  async _unsubscribePush(subscribeButton, unsubscribeButton) {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) return;

      const response = await StoryApi.unsubscribeFromNotification(subscription.endpoint);

      if (!response.error) {
        await subscription.unsubscribe();
        this._updateButtonStyle(false, subscribeButton, unsubscribeButton);
        alert('Notifikasi dimatikan.');
      } else {
         throw new Error(response.message);
      }
      
    } catch (error) {
      console.error('Gagal unsubscribe:', error);
      alert('Gagal mematikan notifikasi: ' + error.message);
    }
  },

  _updateButtonStyle(isSubscribed, subscribeBtn, unsubscribeBtn) {
    if (isSubscribed) {
      subscribeBtn.style.display = 'none';
      unsubscribeBtn.style.display = 'inline-block';
    } else {
      subscribeBtn.style.display = 'inline-block';
      unsubscribeBtn.style.display = 'none';
    }
  },

  _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  },

  _arrayBufferToBase64(buffer) {
    return btoa(String.fromCharCode.apply(null, new Uint8Array(buffer)));
  }
};

export default NotificationHelper;
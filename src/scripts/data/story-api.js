import ENDPOINTS from './api';
import TokenManager from '../utils/token-manager';

class StoryApi {
  static _getAuthHeader() {
    const token = TokenManager.getToken();
    if (!token) {
      throw new Error('Token tidak ditemukan. Silakan login ulang.');
    }
    return `Bearer ${token}`;
  }

  static async login(credentials) {
    try {
      const response = await fetch(ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const responseJson = await response.json();
      return responseJson;
      
    } catch (error) {
      return { error: true, message: 'Login gagal karena masalah jaringan.' };
    }
  }

  static async register(userInfo) {
    try {
      const response = await fetch(ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userInfo),
      });

      const responseJson = await response.json();
      return responseJson;
      
    } catch (error) {
      return { error: true, message: 'Registrasi gagal karena masalah jaringan.' };
    }
  }

  static async getStories() {
    try {
      const response = await fetch(ENDPOINTS.STORIES, {
        headers: {
          'Authorization': this._getAuthHeader(),
        },
      });

      const responseJson = await response.json();
      return responseJson;
      
    } catch (error) {
      console.error('Error fetching stories:', error);
      return { error: true, message: error.message };
    }
  }

  static async addNewStory(formData) {
    try {
      const response = await fetch(ENDPOINTS.STORIES, {
        method: 'POST',
        headers: {
          'Authorization': this._getAuthHeader(),
        },
        body: formData,
      });

      const responseJson = await response.json();
      return responseJson;
      
    } catch (error) {
      console.error('Error adding new story:', error);
      return { error: true, message: error.message };
    }
  }

  static async subscribeToNotification(subscription) {
    try {
      const response = await fetch(ENDPOINTS.SUBSCRIBE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this._getAuthHeader(),
        },
        body: JSON.stringify(subscription),
      });

      return await response.json();
    } catch (error) {
      console.error('Error subscribing to notification:', error);
      return { error: true, message: error.message };
    }
  }

  static async unsubscribeFromNotification(endpoint) {
    try {
      const response = await fetch(ENDPOINTS.SUBSCRIBE, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this._getAuthHeader(),
        },
        body: JSON.stringify({ endpoint }),
      });

      return await response.json();
    } catch (error) {
      console.error('Error unsubscribing from notification:', error);
      return { error: true, message: error.message };
    }
  }
}

export default StoryApi;
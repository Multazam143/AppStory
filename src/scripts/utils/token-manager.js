const TokenManager = {
  TOKEN_KEY: 'story_app_token',

  /**
   * Menyimpan token ke sessionStorage
   * @param {string} token
   */
  saveToken(token) {
    sessionStorage.setItem(this.TOKEN_KEY, token);
  },

  /**
   * Mengambil token dari sessionStorage
   * @returns {string | null}
   */
  getToken() {
    return sessionStorage.getItem(this.TOKEN_KEY);
  },

  clearToken() {
    sessionStorage.removeItem(this.TOKEN_KEY);
  },

  /**
   * Cek apakah token ada
   * @returns {boolean}
   */
  isTokenAvailable() {
    return this.getToken() !== null;
  },
};

export default TokenManager;
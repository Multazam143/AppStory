import StoryApi from '../../data/story-api';
import TokenManager from '../../utils/token-manager';

const LoginPage = {
  async render() {
    return `
      <div class="form-container">
        <h1>Login Pengguna</h1>
        <p>Silakan gunakan akun yang sudah Anda daftarkan.</p>

        <div id="message-container"></div>

        <form id="login-form">
          <div class="form-group">
            <label for="login-email">Email:</label>
            <input type="email" id="login-email" name="email" required autocomplete="email">
          </div>
          <div class="form-group">
            <label for="login-password">Password:</label>
            <input type="password" id="login-password" name="password" required autocomplete="current-password">
          </div>
          <button type="submit" id="submit-button">Login</button>
        </form>
        <p style="margin-top: 1rem; text-align: center;">
          Belum punya akun? <a href="#/register">Daftar di sini</a>
        </p>
      </div>
    `;
  },

  async afterRender() {
    if (TokenManager.isTokenAvailable()) {
      window.location.hash = '#/';
      return;
    }

    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = document.getElementById('submit-button');
      const messageContainer = document.getElementById('message-container');
      submitButton.disabled = true;
      this._showMessage('Sedang login...', 'info');

      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;

      try {
        const response = await StoryApi.login({ email, password });

        if (response.error) {
          throw new Error(response.message);
        }

        TokenManager.saveToken(response.loginResult.token);
        this._showMessage('Login sukses! Mengarahkan ke Beranda...', 'success');
        
        setTimeout(() => {
          window.location.hash = '#/';
        }, 1500);

      } catch (error) {
        this._showMessage(`Error: ${error.message}`, 'error');
        submitButton.disabled = false;
      }
    });
  },

  _showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    container.innerHTML = `<p class="message ${type}">${message}</p>`;
    container.style.display = 'block';
  },
};

export default LoginPage;
import StoryApi from '../../data/story-api';
import TokenManager from '../../utils/token-manager';

const RegisterPage = {
  async render() {
    return `
      <div class="form-container">
        <h1>Registrasi Akun Baru</h1>
        
        <div id="message-container"></div>

        <form id="register-form">
          <div class="form-group">
            <label for="register-name">Nama:</label>
            <input type="text" id="register-name" name="name" required minlength="3">
          </div>
          <div class="form-group">
            <label for="register-email">Email:</label>
            <input type="email" id="register-email" name="email" required autocomplete="email">
          </div>
          <div class="form-group">
            <label for="register-password">Password (min 8 karakter):</label>
            <input type="password" id="register-password" name="password" required minlength="8" autocomplete="new-password">
          </div>
          <button type="submit" id="submit-button">Daftar</button>
        </form>
        <p style="margin-top: 1rem; text-align: center;">
          Sudah punya akun? <a href="#/login">Login di sini</a>
        </p>
      </div>
    `;
  },

  async afterRender() {
    if (TokenManager.isTokenAvailable()) {
      window.location.hash = '#/';
      return;
    }

    const registerForm = document.getElementById('register-form');
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      const submitButton = document.getElementById('submit-button');
      const messageContainer = document.getElementById('message-container');
      submitButton.disabled = true;
      this._showMessage('Sedang mendaftarkan...', 'info');

      const name = document.getElementById('register-name').value;
      const email = document.getElementById('register-email').value;
      const password = document.getElementById('register-password').value;

      try {
        const response = await StoryApi.register({ name, email, password });

        if (response.error) {
          throw new Error(response.message);
        }

        this._showMessage('Registrasi sukses! Silakan login.', 'success');
        
        setTimeout(() => {
          window.location.hash = '#/login';
        }, 2000);

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

export default RegisterPage;
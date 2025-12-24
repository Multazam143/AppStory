import routes from '../routes/routes';
import { getActiveRoute } from '../routes/url-parser';
import TokenManager from '../utils/token-manager';

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #navList = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;
    this.#navList = this.#navigationDrawer.querySelector('ul');

    this._setupDrawer();
    this._setupLogoutListener();
  }

  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (
        !this.#navigationDrawer.contains(event.target) &&
        !this.#drawerButton.contains(event.target)
      ) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  _updateNavigation() {
    const url = getActiveRoute();
    const isLoggedIn = TokenManager.isTokenAvailable();
    this.#navList.innerHTML = '';

    if (isLoggedIn) {
      this.#navList.innerHTML = `
        <li><a href="#/" ${url === '/' ? 'aria-current="page"' : ''}>Beranda</a></li>
        <li><a href="#/add" ${url === '/add' ? 'aria-current="page"' : ''}>Tambah Story</a></li>
        <li><a href="#/about" ${url === '/about' ? 'aria-current="page"' : ''}>About</a></li>
        <li><a href="#/offline">Offline Story</a></li>
        <li><button id="logout-button" type="button">Logout</button></li>
      `;
    } else {
      this.#navList.innerHTML = `
        <li><a href="#/login" ${url === '/login' ? 'aria-current="page"' : ''}>Login</a></li>
        <li><a href="#/register" ${url === '/register' ? 'aria-current="page"' : ''}>Register</a></li>
        <li><a href="#/about" ${url === '/about' ? 'aria-current="page"' : ''}>About</a></li>
      `;
    }
  }

  _setupLogoutListener() {
    this.#navigationDrawer.addEventListener('click', (event) => {
      if (event.target.id === 'logout-button') {
        TokenManager.clearToken();
        this.#navigationDrawer.classList.remove('open');
        window.location.hash = '#/login';
        this._updateNavigation();
      }
    });
  }

  async renderPage() {
    this._updateNavigation();

    const url = getActiveRoute();
    const page = routes[url];

    const updateDOM = async () => {
      try {
        if (this.#content.map) this.#content.map.remove();
        this.#content.innerHTML = await page.render();
        await page.afterRender();
      } catch {
        this.#content.innerHTML = '<h1>Halaman tidak ditemukan</h1>';
      }
    };

    document.startViewTransition
      ? document.startViewTransition(updateDOM)
      : await updateDOM();
  }
}

export default App;

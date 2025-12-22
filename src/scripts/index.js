import '../styles/styles.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

import App from './pages/app';
import TokenManager from './utils/token-manager';
import { getActiveRoute } from './routes/url-parser';

const publicRoutes = ['/login', '/register', '/about'];

const renderAppWithAuthCheck = async (app) => {
  const isLoggedIn = TokenManager.isTokenAvailable();
  const path = getActiveRoute();

  const isPublicRoute = publicRoutes.includes(path);

  if (isLoggedIn && isPublicRoute) {
    if (path !== '/about') {
      window.location.hash = '#/';
      return;
    }
  }

  if (!isLoggedIn && !isPublicRoute) {
    window.location.hash = '#/login';
    return;
  }

  await app.renderPage();
};

document.addEventListener('DOMContentLoaded', async () => {
  const app = new App({
    content: document.querySelector('#main-content'),
    drawerButton: document.querySelector('#drawer-button'),
    navigationDrawer: document.querySelector('#navigation-drawer'),
  });

  await renderAppWithAuthCheck(app);

  window.addEventListener('hashchange', async () => {
    await renderAppWithAuthCheck(app);
  });
});
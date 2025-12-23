import HomePage from '../pages/home/home-page';
import OfflineStoryPage from '../pages/offline/offline-story-page';
import AboutPage from '../pages/about/about-page';
import LoginPage from '../pages/auth/login-page';
import RegisterPage from '../pages/auth/register-page';
import AddStoryPage from '../pages/add/add-story-page'; 
import DetailStoryPage from '../pages/detail/detail-story-page';

const routes = {
  '/': HomePage,
  '/about': AboutPage,
  '/login': LoginPage,
  '/register': RegisterPage,
  '/add': AddStoryPage,
  '/story/:id': DetailStoryPage,
  '/offline': OfflineStoryPage,
};

export default routes;
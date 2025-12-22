import L from 'leaflet';
import StoryApi from '../../data/story-api';
import { showFormattedDate } from '../../utils';
import NotificationHelper from '../../utils/notification-helper';

const HomePage = {
  _map: null,
  _markers: [],

  async render() {
    return `
      <main id="main-content">
        <h1>Daftar Cerita dan Peta Lokasi</h1>
        
        <div class="notification-container" style="margin: 1rem 0;">
            <button id="subscribePush" class="btn" style="display: none; background-color: #007bff; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer;">
                🔔 Aktifkan Notifikasi
            </button>
            <button id="unsubscribePush" class="btn" style="display: none; background-color: #dc3545; color: white; padding: 10px; border: none; border-radius: 5px; cursor: pointer;">
                🔕 Matikan Notifikasi
            </button>
        </div>

        <div class="story-list-container">
          <section id="story-list-area" aria-labelledby="story-list-heading">
            <h2 id="story-list-heading">Daftar Cerita</h2>
            <div id="story-list">Loading...</div>
          </section>

          <section id="map-area" aria-labelledby="map-heading">
            <h2 id="map-heading">Peta Lokasi Cerita</h2>
            <div id="map-container" role="region" aria-label="Peta lokasi cerita"></div>
          </section>
        </div>
      </main>
    `;
  },

  async afterRender() {
    await NotificationHelper.init({
      subscribeButton: document.getElementById('subscribePush'),
      unsubscribeButton: document.getElementById('unsubscribePush'),
    });

    const storyListContainer = document.getElementById('story-list');
    const response = await StoryApi.getStories();

    if (response.error) {
      storyListContainer.innerHTML = `<p class="message error">Error: ${response.message}</p>`;
      if (response.message.includes('Token') || response.message.includes('authentication')) {
        TokenManager.clearToken();
        window.location.hash = '#/login';
      }
      return;
    }

    const stories = response.listStory;

    if (!stories || stories.length === 0) {
      storyListContainer.innerHTML = '<p>Belum ada cerita untuk ditampilkan.</p>';
      this._initMap([]);
      return;
    }

    this._renderStoryList(stories, storyListContainer);
    this._initMap(stories);
  },

  _renderStoryList(stories, container) {
    container.innerHTML = '';
    stories.forEach((story) => {
      const storyItem = document.createElement('article');
      storyItem.classList.add('story-item');
      storyItem.setAttribute('data-id', story.id);
      storyItem.setAttribute('tabindex', '0');
      storyItem.setAttribute('role', 'button');
      storyItem.setAttribute('aria-label', `Lihat detail untuk ${story.name}`);

      storyItem.innerHTML = `
        <img src="${story.photoUrl}" alt="Foto ${story.name}">
        <h3>${story.name}</h3>
        <p><strong>Dibuat:</strong> ${showFormattedDate(story.createdAt)}</p>
        <p>${story.description.substring(0, 100)}...</p>
      `;
      container.appendChild(storyItem);
    });
  },

  _initMap(stories) {
    const mapContainer = document.getElementById('map-container');
    if (!mapContainer || !L) return;

    if (this._map) {
      this._map.remove();
    }

    this._map = L.map('map-container', {
      center: [-0.789275, 113.921327],
      zoom: 5,
    });

    const osmLayer = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });

    const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
      maxZoom: 17,
      attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    });

    const baseLayers = {
      'OpenStreetMap': osmLayer,
      'OpenTopoMap': topoLayer,
    };

    osmLayer.addTo(this._map);
    L.control.layers(baseLayers).addTo(this._map);

    const markerGroup = L.featureGroup();
    this._markers = [];

    stories.forEach((story) => {
      if (story.lat && story.lon) {
        const marker = L.marker([story.lat, story.lon]).bindPopup(
          `<strong>${story.name}</strong><p>${story.description.substring(0, 50)}...</p>`
        );
        this._markers.push({ id: story.id, marker });
        markerGroup.addLayer(marker);
      }
    });

    markerGroup.addTo(this._map);
    if (markerGroup.getLayers().length > 0) {
      this._map.fitBounds(markerGroup.getBounds());
    }

    this._setupMapInteractions();
  },

  _setupMapInteractions() {
    const storyItems = document.querySelectorAll('.story-item');

    const handleInteraction = (storyId, item) => {
      const activeMarker = this._markers.find((m) => m.id === storyId)?.marker;
      if (activeMarker) {
        activeMarker.openPopup();
        this._map.setView(activeMarker.getLatLng(), 10);
        storyItems.forEach((i) => i.classList.remove('active-story'));
        item.classList.add('active-story');
      }
    };

    storyItems.forEach((item) => {
      const storyId = item.getAttribute('data-id');
      item.addEventListener('click', () => handleInteraction(storyId, item));
      item.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          handleInteraction(storyId, item);
        }
      });
    });

    if (this._map) {
      this._map.on('popupclose', () => {
        storyItems.forEach((i) => i.classList.remove('active-story'));
      });
    }
  },
};

export default HomePage;
import L from 'leaflet';
import StoryApi from '../../data/story-api';

const AddStoryPage = {
  _map: null,
  _marker: null,

  async render() {
    return `
      <div class="form-container">
        <h1>Tambah Cerita Baru</h1>
        
        <div id="message-container"></div>

        <form id="add-story-form" enctype="multipart/form-data">
          <div class="form-group">
            <label for="story-description">Deskripsi:</label>
            <textarea id="story-description" name="description" rows="5" required></textarea>
          </div>
          
          <div class="form-group">
            <label for="story-photo">Upload Foto (Max 1MB):</label>
            <input type="file" id="story-photo" name="photo" accept="image/*" required>
            <img id="image-preview" src="#" alt="Pratinjau Foto" style="display: none; max-width: 100%; margin-top: 10px;"/>
          </div>

          <h2>Pilih Lokasi dari Peta</h2>
          <p>Klik pada peta untuk memilih lokasi cerita Anda.</p>
          <div id="location-map" style="height: 400px; width: 100%;"></div>

          <div class="form-group-inline">
            <div class="form-group">
              <label for="story-lat">Latitude:</label>
              <input type="text" id="story-lat" name="lat" readonly required>
            </div>
            <div class="form-group">
              <label for="story-lon">Longitude:</label>
              <input type="text" id="story-lon" name="lon" readonly required>
            </div>
          </div>
          
          <button type="submit" id="submit-button">Kirim Cerita</button>
        </form>
      </div>
    `;
  },

  async afterRender() {
    this._initMap();

    const photoInput = document.getElementById('story-photo');
    const imagePreview = document.getElementById('image-preview');
    photoInput.addEventListener('change', () => {
      const file = photoInput.files[0];
      if (file) {
        imagePreview.src = URL.createObjectURL(file);
        imagePreview.style.display = 'block';
      }
    });

    const form = document.getElementById('add-story-form');
    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const submitButton = document.getElementById('submit-button');
      submitButton.disabled = true;

      const description = document.getElementById('story-description').value;
      const photo = photoInput.files[0];
      const lat = document.getElementById('story-lat').value;
      const lon = document.getElementById('story-lon').value;

      if (!description || !photo || !lat || !lon) {
        this._showMessage('Semua kolom (deskripsi, foto, dan lokasi) wajib diisi.', 'error');
        submitButton.disabled = false;
        return;
      }
      
      if (photo.size > 1000000) {
        this._showMessage('Ukuran file foto tidak boleh melebihi 1MB.', 'error');
        submitButton.disabled = false;
        return;
      }

      const formData = new FormData();
      formData.append('description', description);
      formData.append('photo', photo);
      formData.append('lat', parseFloat(lat));
      formData.append('lon', parseFloat(lon));

      try {
        this._showMessage('Mengirim data...', 'info');
        const response = await StoryApi.addNewStory(formData);
        
        if (response.error) {
          throw new Error(response.message);
        }

        this._showMessage('Cerita berhasil ditambahkan! Mengarahkan ke Beranda...', 'success');
        
        setTimeout(() => {
          window.location.hash = '#/';
        }, 2000);

      } catch (error) {
        this._showMessage(`Error: ${error.message}`, 'error');
        submitButton.disabled = false;
      }
    });
  },

  _initMap() {
    this._map = L.map('location-map', {
      center: [-0.789275, 113.921327],
      zoom: 5,
    });

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(this._map);

    this._map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      document.getElementById('story-lat').value = lat.toFixed(6);
      document.getElementById('story-lon').value = lng.toFixed(6);

      if (this._marker) {
        this._map.removeLayer(this._marker);
      }

      this._marker = L.marker([lat, lng]).addTo(this._map);
      this._map.panTo([lat, lng]);
    });
  },

  _showMessage(message, type = 'info') {
    const container = document.getElementById('message-container');
    container.innerHTML = `<p class="message ${type}">${message}</p>`;
    container.style.display = 'block';
  },
};

export default AddStoryPage;
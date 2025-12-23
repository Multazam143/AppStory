import { parseActivePathname } from '../../routes/url-parser';
import StoryApi from '../../data/story-api';
import StoryDB from '../../utils/indexeddb';

const DetailStoryPage = {
  async render() {
    return `
      <section class="detail-story container">
        <h2>Detail Story</h2>
        <div id="storyDetail">Loading...</div>
      </section>
    `;
  },

  async afterRender() {
    const url = parseActivePathname();
    const storyId = url.id;

    if (!storyId) {
      document.getElementById('storyDetail').innerHTML =
        '<p>ID story tidak ditemukan</p>';
      return;
    }

    try {
      const response = await StoryApi.getStoryDetail(storyId);

      if (response.error) {
        throw new Error(response.message);
      }

      this._renderStory(response.story);
      this._initSaveButton(response.story);
    } catch (error) {
      document.getElementById('storyDetail').innerHTML =
        '<p>Gagal memuat detail story</p>';
    }
  },

  _renderStory(story) {
    document.getElementById('storyDetail').innerHTML = `
      <article class="story-detail">
        <img src="${story.photoUrl}" alt="${story.name}" />
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <p><small>Dibuat: ${new Date(story.createdAt).toLocaleDateString()}</small></p>

        <button id="saveStoryBtn">💾 Simpan Offline</button>
      </article>
    `;
  },

  _initSaveButton(story) {
    const btn = document.getElementById('saveStoryBtn');

btn.addEventListener('click', async () => {
  try {
    await StoryDB.addStory({
      id: story.id,
      name: story.name,
      description: story.description,
      photoUrl: story.photoUrl,
      createdAt: story.createdAt,
    });

    alert('✅ Cerita berhasil disimpan ke IndexedDB');
  } catch (error) {
    alert('❌ Gagal menyimpan cerita');
    console.error(error);
  }
});

  },
};

export default DetailStoryPage;

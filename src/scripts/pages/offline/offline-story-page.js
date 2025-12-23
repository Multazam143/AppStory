import StoryDB from '../../utils/indexeddb';

const OfflineStoryPage = {
  async render() {
    return `
      <section class="offline-story container">
        <h2>Story Tersimpan</h2>
        <div id="offlineStoryList">Loading...</div>
      </section>
    `;
  },

  async afterRender() {
    const container = document.getElementById('offlineStoryList');
    const stories = await StoryDB.getAllStories();

    if (!stories.length) {
      container.innerHTML = '<p>Tidak ada story tersimpan</p>';
      return;
    }

    container.innerHTML = '';

    stories.forEach((story) => {
      const item = document.createElement('article');
      item.classList.add('story-item');

      item.innerHTML = `
        <img src="${story.photoUrl}" alt="${story.name}">
        <h3>${story.name}</h3>
        <p>${story.description}</p>
        <button data-id="${story.id}" class="delete-btn">Hapus</button>
      `;

      item.querySelector('.delete-btn').addEventListener('click', async () => {
        await StoryDB.deleteStory(story.id);
        item.remove();
      });

      container.appendChild(item);
    });
  },
};

export default OfflineStoryPage;

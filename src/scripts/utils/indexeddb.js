const DATABASE_NAME = 'story-app-db';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'stories';

let db = null;

const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE_NAME, DATABASE_VERSION);

    request.onupgradeneeded = (event) => {
      db = event.target.result;

      if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
        db.createObjectStore(OBJECT_STORE_NAME, {
          keyPath: 'id',
        });
      }
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };

    request.onerror = () => {
      reject('IndexedDB gagal dibuka');
    };
  });
};

const addStory = async (story) => {
  const database = await openDB();

  return new Promise((resolve, reject) => {
    const tx = database.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);

    store.put(story);

    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject('Gagal menyimpan data');
  });
};

const getAllStories = async () => {
  const database = await openDB();

  return new Promise((resolve) => {
    const tx = database.transaction(OBJECT_STORE_NAME, 'readonly');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
  });
};

const deleteStory = async (id) => {
  const database = await openDB();

  return new Promise((resolve) => {
    const tx = database.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);

    store.delete(id);

    tx.oncomplete = () => resolve(true);
  });
};

export default {
  addStory,
  getAllStories,
  deleteStory,
};

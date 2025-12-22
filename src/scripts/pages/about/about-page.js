const AboutPage = {
  async render() {
    return `
      <h1>Tentang Aplikasi Ini</h1>
      <p>Ini adalah aplikasi Story App yang dibuat sebagai bagian dari submission.</p>
      <p>Aplikasi ini menampilkan cerita-cerita yang dibagikan oleh pengguna, 
      lengkap dengan visualisasi lokasi di peta.</p>
    `;
  },

  async afterRender() {
  },
};

export default AboutPage;
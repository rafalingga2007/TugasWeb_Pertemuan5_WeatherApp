// 1. Tempel API key OpenWeatherMap milikmu di bawah ini.
const API_KEY = '7917543803cb342696163f64b909d86c';
const BASE_URL = 'https://api.openweathermap.org/data/2.5/weather';

// 2. Ambil elemen HTML yang diperlukan.
const form = document.querySelector('#searchForm');
const input = document.querySelector('#cityInput');
const loading = document.querySelector('#loading');
const errorMessage = document.querySelector('#error');
const result = document.querySelector('#weatherResult');
const historyList = document.querySelector('#history');
const emptyHistory = document.querySelector('#emptyHistory');
const clearHistoryButton = document.querySelector('#clearHistory');

// Mengambil riwayat dari LocalStorage dengan aman.
const getHistory = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('weatherHistory') || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
};

// Menampilkan riwayat pencarian. map() memenuhi syarat array method ES6+.
const showHistory = () => {
  const history = getHistory();
  historyList.replaceChildren();
  emptyHistory.hidden = history.length > 0;

  history.map(city => {
    const item = document.createElement('li');
    const button = document.createElement('button');

    button.type = 'button';
    button.textContent = city;
    button.addEventListener('click', () => getWeather(city));

    item.append(button);
    historyList.append(item);
  });
};

// Simpan kota terbaru, maksimal 5 kota unik.
const saveHistory = city => {
  const oldHistory = getHistory();
  const updatedHistory = [
    city,
    ...oldHistory.filter(item => item.toLowerCase() !== city.toLowerCase())
  ].slice(0, 5);

  localStorage.setItem('weatherHistory', JSON.stringify(updatedHistory));
  showHistory();
};

// Menampilkan data cuaca ke halaman.
const displayWeather = data => {
  document.querySelector('#dateLabel').textContent =
    new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

  document.querySelector('#cityName').textContent =
    `${data.name}, ${data.sys.country}`;
  document.querySelector('#temperature').textContent =
    `${Math.round(data.main.temp)}°C`;
  document.querySelector('#description').textContent =
    data.weather[0].description;
  document.querySelector('#humidity').textContent =
    `${data.main.humidity}%`;
  document.querySelector('#wind').textContent =
    `${data.wind.speed} m/s`;

  const icon = document.querySelector('#weatherIcon');
  icon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png`;
  icon.alt = `Cuaca ${data.weather[0].description}`;

  result.hidden = false;
};

// Mengambil data dari OpenWeatherMap API.
async function getWeather(city) {
  if (!API_KEY || API_KEY === 'TEMPEL_API_KEY_KAMU_DI_SINI') {
    errorMessage.textContent =
      'API key belum diisi. Buka app.js dan tempel API key OpenWeatherMap.';
    return;
  }

  loading.hidden = false;
  errorMessage.textContent = '';
  result.hidden = true;

  try {
    const url = `${BASE_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric&lang=id`;
    const response = await fetch(url);

    if (response.status === 404) {
      throw new Error(`Kota "${city}" tidak ditemukan. Periksa ejaan nama kota.`);
    }

    if (response.status === 401) {
      throw new Error('API key salah atau belum aktif. Periksa API key kamu.');
    }

    if (!response.ok) {
      throw new Error(`Server mengalami masalah (HTTP ${response.status}). Coba lagi.`);
    }

    const data = await response.json();
    displayWeather(data);
    saveHistory(data.name);

  } catch (error) {
    errorMessage.textContent = error instanceof TypeError
      ? 'Tidak bisa terhubung ke server. Periksa koneksi internet.'
      : error.message;
  } finally {
    loading.hidden = true;
  }
}

// Saat form dikirim, cegah halaman refresh.
form.addEventListener('submit', event => {
  event.preventDefault();
  const city = input.value.trim();

  if (city) {
    getWeather(city);
  }
});

// Hapus riwayat pencarian.
clearHistoryButton.addEventListener('click', () => {
  localStorage.removeItem('weatherHistory');
  showHistory();
});

showHistory();

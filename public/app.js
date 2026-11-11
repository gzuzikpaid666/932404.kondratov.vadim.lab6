if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then(reg => console.log('Service Worker зарегистрирован:', reg.scope))
      .catch(err => console.error('Ошибка регистрации SW:', err));
  });
}

const form = document.getElementById('form');
if (form) {
  const countInput = document.getElementById('count');
  const resultEl = document.getElementById('result');
  const errorEl = document.getElementById('error');
  const statusEl = document.getElementById('net-status');

  function updateStatus() {
    const online = navigator.onLine;
    statusEl.textContent = online ? 'Онлайн' : 'Офлайн (UUID генерируются локально)';
    statusEl.className = 'status ' + (online ? 'online' : 'offline');
  }
  window.addEventListener('online', updateStatus);
  window.addEventListener('offline', updateStatus);
  updateStatus();

  function render(uuids) {
    resultEl.innerHTML = '';
    uuids.forEach(id => {
      const li = document.createElement('li');
      li.textContent = id;
      li.title = 'Клик — скопировать';
      li.addEventListener('click', () => navigator.clipboard?.writeText(id));
      resultEl.appendChild(li);
    });
  }

  function generateLocally(count) {
    return Array.from({ length: count }, () => crypto.randomUUID());
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorEl.hidden = true;
    const count = countInput.value;

    try {
      const res = await fetch(`/api/uuid?count=${encodeURIComponent(count)}`);
      const data = await res.json();
      if (!res.ok) {
        errorEl.textContent = data.error || 'Ошибка запроса';
        errorEl.hidden = false;
        resultEl.innerHTML = '';
        return;
      }
      render(data.uuids);
    } catch (err) {
      const n = Number(count);
      if (Number.isInteger(n) && n >= 1 && n <= 10) {
        render(generateLocally(n));
      } else {
        errorEl.textContent = 'Количество должно быть целым числом от 1 до 10';
        errorEl.hidden = false;
      }
    }
  });
}

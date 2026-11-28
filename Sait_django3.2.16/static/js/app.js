const $ = id => document.getElementById(id);
let currentUser = null, avatarData = null;

function getCookie(name) {
  const match = document.cookie.match(new RegExp('(^|;\\s*)' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : '';
}

function toast(message) {
  const t = $('toast');
  if (!t) return;
  t.textContent = message;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

async function api(path, options = {}) {
  const response = await fetch(path, {
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
      ...(options.headers || {})
    },
    ...options
  });
  const data = await response.json().catch(() => ({ message: 'Ошибка ответа сервера' }));
  if (!response.ok) throw new Error(data.message || 'Ошибка запроса');
  return data;
}

function initialsAvatar(name) {
  const letter = (name || 'R').trim().charAt(0).toUpperCase() || 'R';
  return 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`<svg xmlns="http://w3.org" width="100" height="100"><circle cx="50" cy="50" r="50" fill="#ef7548"/><text x="50" y="66" font-size="52" text-anchor="middle" fill="white" font-family="Arial">${letter}</text></svg>`);
}

function applyPrefs() {
  const theme = localStorage.getItem('rwTheme') || 'sunset', blur = localStorage.getItem('rwBlur') || '12';
  document.body.dataset.theme = theme;
  document.documentElement.style.setProperty('--header-blur', blur + 'px');
  if ($('pageTheme')) $('pageTheme').value = theme;
  if ($('blurRange')) $('blurRange').value = blur;
  if ($('blurNumber')) $('blurNumber').textContent = blur;
}

$('settingsOpen').onclick = () => { $('settingsModal').classList.remove('hidden'); };
$('settingsClose').onclick = () => $('settingsModal').classList.add('hidden');
$('settingsModal').addEventListener('click', e => { if (e.target === $('settingsModal')) $('settingsModal').classList.add('hidden'); });
$('pageTheme').onchange = e => { localStorage.setItem('rwTheme', e.target.value); applyPrefs(); };
$('blurRange').oninput = e => {
  localStorage.setItem('rwBlur', e.target.value);
  $('blurNumber').textContent = e.target.value;
  document.documentElement.style.setProperty('--header-blur', e.target.value + 'px');
};

$('videosNav').onclick = () => {
  if (!currentUser) {
    toast('Чтобы открыть видео, сначала войди или зарегистрируйся.');
    location.href = '/users/login/';
    return;
  }
  $('videos').classList.remove('hidden');
  $('videos').scrollIntoView({ behavior: 'smooth' });
};

function showProfile(user) {
  currentUser = user;
  $('userInfo').textContent = '👤 ' + (user.name || 'Участник');
  $('loginTop').classList.add('hidden');
  $('registerTop').classList.add('hidden');
  $('logoutBtn').classList.remove('hidden');
  $('lockedAccount').classList.add('hidden');
  $('accountSettings').classList.remove('hidden');
  $('nickname').value = user.name || '';
  $('bio').value = user.bio || '';
  $('language').value = user.language || 'ru';
  $('avatarPreview').src = user.avatar || initialsAvatar(user.name);
  $('profileLabel').textContent = user.name || 'Мой профиль';
}

function showGuest() {
  $('userInfo').textContent = 'Гость';
  $('loginTop').classList.remove('hidden');
  $('registerTop').classList.remove('hidden');
  $('logoutBtn').classList.add('hidden');
  $('lockedAccount').classList.remove('hidden');
  $('accountSettings').classList.add('hidden');
  $('videos').classList.add('hidden');
}

async function loadUser() {
  try {
    const result = await api('/api/me');
    if (result.user) showProfile(result.user);
    else showGuest();
  } catch {
    showGuest();
  }
}

$('avatarInput').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 1024 * 1024) {
    toast('Аватар должен быть меньше 1 МБ');
    e.target.value = '';
    return;
  }
  const reader = new FileReader();
  reader.onload = () => {
    avatarData = reader.result;
    $('avatarPreview').src = avatarData;
  };
  reader.readAsDataURL(file);
});

$('saveProfile').onclick = async () => {
  const message = $('settingsMessage');
  message.textContent = 'Сохраняю…';
  try {
    const result = await api('/api/profile', {
      method: 'PUT',
      body: JSON.stringify({
        name: $('nickname').value.trim(),
        bio: $('bio').value.trim(),
        language: $('language').value,
        avatar: avatarData,
        headerBlur: Number(localStorage.getItem('rwBlur') || 12)
      })
    });
    avatarData = null;
    showProfile(result.user);
    message.textContent = 'Профиль сохранён!';
  } catch (e) {
    message.textContent = 'Не удалось сохранить: ' + e.message;
  }
};

$('logoutBtn').onclick = async () => {
  try {
    await api('/api/logout', { method: 'POST', body: '{}' });
  } catch {}
  currentUser = null;
  showGuest();
  toast('Ты вышел из аккаунта');
};

applyPrefs();
loadUser();

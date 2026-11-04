// ═══════════════════════════════════════════════════════════════
// DESKTOP.JS — логика рабочего стола (без дзвінка/чату)
// Дзвінок/чат/віруси → у call.js
// ═══════════════════════════════════════════════════════════════

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

function playSound(freq, duration = 0.08, type = 'square') {
    try {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        gain.gain.value = 0.04;
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
    } catch(e) {}
}

// ═══ ИНИЦИАЛИЗАЦИЯ ═══
function initDesktop() {
    const container = document.getElementById('progressContainer');
    let step = 0;
    const totalSteps = 15;
    const intervalTime = 5000 / totalSteps;

    const interval = setInterval(() => {
        step++;
        const block = document.createElement('div');
        block.className = 'progress-block';
        container.appendChild(block);
        playSound(500 + (step * 25), 0.02);

        if (step >= totalSteps) {
            clearInterval(interval);
            document.getElementById('desktopLoader').style.display = 'none';
            document.getElementById('desktop').style.display = 'flex';
            document.body.classList.remove('loading');
            playSound(900, 0.2);
            // 🔻 Викликаємо функції з call.js (якщо він вже завантажений)
            if (typeof checkCallTrigger === 'function') checkCallTrigger();
            if (typeof checkTopNotif === 'function') checkTopNotif();
        }
    }, intervalTime);
}

function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    let minutes = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    minutes = minutes < 10 ? '0' + minutes : minutes;
    document.getElementById('clockTray').innerText = hours + ':' + minutes + ' ' + ampm;
}

let zIndexCounter = 100;
function openWindow(id) {
    if (document.body.classList.contains('loading')) return;
    playSound(600, 0.05);
    const win = document.getElementById(id);
    win.style.display = 'flex';
    zIndexCounter++;
    win.style.zIndex = zIndexCounter;

    if (id === 'settingsWindow') {
        const firstTab = document.querySelector('.settings-tab.active');
        if (firstTab) switchSettingsTab('general', firstTab);
    }
}

function closeWindow(id) {
    playSound(400, 0.05);
    document.getElementById(id).style.display = 'none';
}

function saveNote(value) {
    try { localStorage.setItem('dundikNotepad', value); } catch(e) {}
}
function loadNote() {
    try {
        const saved = localStorage.getItem('dundikNotepad');
        if (saved) document.getElementById('notepadText').value = saved;
    } catch(e) {}
}

// ═══ DRAG ═══
let activeWin = null;
let offsetX = 0, offsetY = 0;
function dragMouseDown(e, winId) {
    e = e || window.event;
    e.preventDefault();
    activeWin = document.getElementById(winId);
    zIndexCounter++;
    activeWin.style.zIndex = zIndexCounter;
    offsetX = e.clientX - activeWin.offsetLeft;
    offsetY = e.clientY - activeWin.offsetTop;
    document.onmousemove = elementDrag;
    document.onmouseup = closeDragElement;
}
function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    if (activeWin) {
        activeWin.style.left = (e.clientX - offsetX) + "px";
        activeWin.style.top = (e.clientY - offsetY) + "px";
    }
}
function closeDragElement() {
    document.onmousemove = null;
    document.onmouseup = null;
    activeWin = null;
}

// ═══ START MENU ═══
function toggleStartMenu(e) {
    e.stopPropagation();
    const menu = document.getElementById('startMenu');
    const btn = document.getElementById('startBtn');
    if (menu.style.display === 'block') {
        menu.style.display = 'none';
        btn.classList.remove('active');
    } else {
        menu.style.display = 'block';
        btn.classList.add('active');
        playSound(600, 0.04);
    }
}
document.addEventListener('click', function(e) {
    const menu = document.getElementById('startMenu');
    const btn = document.getElementById('startBtn');
    if (menu.style.display === 'block' && !menu.contains(e.target) && !btn.contains(e.target)) {
        menu.style.display = 'none';
        btn.classList.remove('active');
    }
});

function showShutdown() {
    document.getElementById('startMenu').style.display = 'none';
    document.getElementById('startBtn').classList.remove('active');
    document.getElementById('shutdownModal').style.display = 'flex';
    playSound(500, 0.06);
}
function closeShutdown() {
    document.getElementById('shutdownModal').style.display = 'none';
    playSound(400, 0.05);
}
function shutdownComputer() {
    playSound(300, 0.3, 'sine');
    setTimeout(() => {
        document.getElementById('shutdownModal').style.display = 'none';
        let chatDone = false;
        try { chatDone = localStorage.getItem('chatDone') === 'true'; } catch(e) {}
        if (chatDone) {
            window.location.href = 'final.html';
        } else {
            document.getElementById('powerOffScreen').style.display = 'flex';
        }
    }, 500);
}

// ═══ SNAKE ═══
function openSnake() {
    if (document.body.classList.contains('loading')) return;
    playSound(600, 0.05);
    const w = 480, h = 620;
    const left = Math.max(0, (window.screen.width - w) / 2);
    const top = Math.max(0, (window.screen.height - h) / 2);
    window.open('snake.html', 'snakeGame',
        `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no`);
}

// ═══ MINESWEEPER ═══
function openMinesweeper() {
    if (document.body.classList.contains('loading')) return;
    playSound(600, 0.05);
    const w = 460, h = 600;
    const left = Math.max(0, (window.screen.width - w) / 2);
    const top = Math.max(0, (window.screen.height - h) / 2);
    window.open('minesweeper.html', 'minesweeperGame',
        `width=${w},height=${h},left=${left},top=${top},menubar=no,toolbar=no,location=no,status=no,resizable=yes,scrollbars=no`);
}

// ═══ МИССИЯ ═══
function checkMission() {
    try {
        if (localStorage.getItem('blacknetFilesUnlocked') === 'true') {
            document.getElementById('missionIcon').style.display = 'flex';
        }
    } catch(e) {}
}
function openMission() {
    if (document.body.classList.contains('loading')) return;
    playSound(600, 0.05);
    window.location.href = 'mission.html';
}

// ═══════════════════════════════════════════════════════════════
// 📁 МОИ ДОКУМЕНТЫ
// ═══════════════════════════════════════════════════════════════
function openPhotoFull() {
    playSound(700, 0.06);
    document.getElementById('photoModal').style.display = 'flex';
}

function closePhotoFull() {
    playSound(400, 0.04);
    document.getElementById('photoModal').style.display = 'none';
}

// ═══════════════════════════════════════════════════════════════
// ⚙️ НАСТРОЙКИ
// ═══════════════════════════════════════════════════════════════
function switchSettingsTab(tab, el) {
    playSound(500, 0.04);
    document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
    el.classList.add('active');

    const content = document.getElementById('settingsContent');
    const tabs = {
        general: `
            <p><b>🖥️ Общие настройки</b></p>
            <p style="color: #888; font-size: 11px; margin-bottom: 12px;">Система: Microsoft Windows 95</p>
            <p>━━━━━━━━━━━━━━━━━━━━━━━━</p>
            <br>
            <p><b>Пользователь:</b> Dundik</p>
            <p><b>Организация:</b> BlackNet Corp.</p>
            <p><b>Компьютер:</b> DUNDIK-PC</p>
            <p><b>Процессор:</b> Pentium 133 MHz</p>
            <p><b>ОЗУ:</b> 16,0 МБ</p>
            <br>
            <p><b>Дата регистрации:</b> 05.05.1995</p>
            <p><b>Идентификатор:</b> 00200-97531-OEM-0020205-0416</p>
            <br>
            <p style="color: #008000;">✓ Лицензия действительна</p>
        `,
        display: `
            <p><b>🖼️ Экран</b></p>
            <p style="color: #888; font-size: 11px; margin-bottom: 12px;">Настройки монитора и темы</p>
            <p>━━━━━━━━━━━━━━━━━━━━━━━━</p>
            <br>
            <p><b>Цветовая схема:</b> Windows Default</p>
            <div style="display: flex; gap: 5px; margin: 8px 0;">
                <div style="width: 30px; height: 20px; background: #008080; border: 1px solid #000;"></div>
                <div style="width: 30px; height: 20px; background: #c0c0c0; border: 1px solid #000;"></div>
                <div style="width: 30px; height: 20px; background: #000080; border: 1px solid #000;"></div>
                <div style="width: 30px; height: 20px; background: #ffffff; border: 1px solid #000;"></div>
            </div>
            <br>
            <p><b>Обои:</b> Teal (Solid)</p>
            <p><b>Разрешение:</b> 640x480</p>
            <p><b>Глубина цвета:</b> 16 бит (High Color)</p>
            <p><b>Заставка:</b> "Mystify Your Mind"</p>
            <br>
            <p style="color: #555; font-size: 11px; font-style: italic;">💡 Совет: заставка включается через 2 мин бездействия</p>
        `,
        network: `
            <p><b>🌐 Сеть</b></p>
            <p style="color: #888; font-size: 11px; margin-bottom: 12px;">Параметры сетевого соединения</p>
            <p>━━━━━━━━━━━━━━━━━━━━━━━━</p>
            <br>
            <p><b>IP-адрес:</b> 192.168.95.47</p>
            <p><b>Маска подсети:</b> 255.255.255.0</p>
            <p><b>Шлюз:</b> 192.168.95.1</p>
            <p><b>DNS-сервер:</b> 8.8.8.8</p>
            <br>
            <p><b>Скорость:</b> 28.8 kbps (Dial-Up)</p>
            <p><b>Статус:</b> <span style="color: #008000;">● Подключено</span></p>
            <br>
            <p>━━━━━━━━━━━━━━━━━━━━━━━━</p>
            <br>
            <p style="color: #cc0000;"><b>⚠️ Внимание:</b></p>
            <p style="color: #cc0000;">Обнаружена активность с неизвестного узла</p>
            <p style="color: #cc0000;">Источник: SINDICATE-NET</p>
            <p style="color: #cc0000;">Последняя попытка: 20:47</p>
        `,
        security: `
            <p><b>🔐 Безопасность</b></p>
            <p style="color: #888; font-size: 11px; margin-bottom: 12px;">Журнал событий безопасности</p>
            <p>━━━━━━━━━━━━━━━━━━━━━━━━</p>
            <br>
            <p style="color: #008000;">✓ 05:00 — Пользователь Dundik вошёл в систему</p>
            <p style="color: #008000;">✓ 05:15 — Обновление антивирусных баз</p>
            <p style="color: #008000;">✓ 14:30 — Сканирование завершено (0 угроз)</p>
            <br>
            <p style="color: #cc0000;">⚠️ 20:47 — НЕСАНКЦИОНИРОВАННЫЙ ДОСТУП</p>
            <p style="color: #cc0000;">&nbsp;&nbsp;&nbsp;Источник: SINDICATE-NET</p>
            <p style="color: #cc0000;">&nbsp;&nbsp;&nbsp;Уровень угрозы: ВЫСОКИЙ</p>
            <br>
            <p style="color: #ffaa00;">⚠️ 20:48 — Компьютер DGYJURA-PC отключён</p>
            <p style="color: #ffaa00;">&nbsp;&nbsp;&nbsp;Причина: неизвестна</p>
            <br>
            <p>━━━━━━━━━━━━━━━━━━━━━━━━</p>
            <br>
            <p style="color: #800000; font-weight: bold;">🔒 Рекомендация:</p>
            <p>Не подключаться к неизвестным узлам.</p>
            <p>Ожидать связи от агента DGYJura.</p>
            <p style="margin-top: 10px; font-size: 11px; color: #555; font-style: italic;">Последнее обновление: 20:48</p>
        `
    };

    content.innerHTML = tabs[tab] || '';
}

// ═══════════════════════════════════════════════════════════════
// 🎁 СБРОС ПРОГРЕССА
// ═══════════════════════════════════════════════════════════════
let clockClickCount = 0;
let clockClickTimer = null;

function handleClockClick() {
    clockClickCount++;
    playSound(700 + clockClickCount * 100, 0.04);

    if (clockClickTimer) clearTimeout(clockClickTimer);

    if (clockClickCount >= 3) {
        clockClickCount = 0;
        showResetConfirm();
    } else {
        clockClickTimer = setTimeout(() => {
            clockClickCount = 0;
        }, 900);
    }
}

function showResetConfirm() {
    playSound(500, 0.08);
    document.getElementById('resetModal').style.display = 'flex';
}

function closeReset() {
    playSound(400, 0.05);
    document.getElementById('resetModal').style.display = 'none';
}

function doReset() {
    playSound(200, 0.3, 'sawtooth');
    try { localStorage.clear(); } catch(e) {}
    setTimeout(() => {
        location.reload();
    }, 400);
}

// ═══════════════════════════════════════════════════════════════
// 🔔 УВЕДОМЛЕНИЯ (загальні — використовуються в call.js)
// ═══════════════════════════════════════════════════════════════
let topNotifCallback = null;

function showTopNotif(text, callback = null, pulse = true) {
    const el = document.getElementById('topNotif');
    el.textContent = text;
    el.classList.add('show');
    if (pulse) el.classList.add('pulse');
    topNotifCallback = callback;
    playSound(1000, 0.15, 'sine');
}

function hideTopNotif() {
    const el = document.getElementById('topNotif');
    el.classList.remove('show', 'pulse');
    topNotifCallback = null;
}

function handleTopNotifClick() {
    if (topNotifCallback) {
        const cb = topNotifCallback;
        hideTopNotif();
        cb();
    }
}

// ═══ СТАРТ ═══
setInterval(updateClock, 1000);
updateClock();
loadNote();
checkMission();
initDesktop();

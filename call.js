// ═══════════════════════════════════════════════════════════════
// CALL.JS — дзвінок, чат, віруси
// Використовує функції з desktop.js: playSound, showTopNotif,
// hideTopNotif, showShutdown
// ═══════════════════════════════════════════════════════════════

let callTimerInterval = null;
let currentTimerValue = 30;

let ringInterval = null;
let chatStartTime = null;
let chatTimerInterval = null;
let chatStep = 0;

// ═══════════════════════════════════════════════════════════════
// 📞 СИСТЕМА ЗВОНКА
// ═══════════════════════════════════════════════════════════════
function checkCallTrigger() {
    let bossRead = false;
    let callDone = false;
    try {
        bossRead = localStorage.getItem('bossMessageRead') === 'true';
        callDone = localStorage.getItem('callDone') === 'true';
    } catch(e) {}

    if (bossRead && !callDone) {
        startCallTimer();
    }
}

function startCallTimer() {
    const el = document.getElementById('callTimer');
    el.style.display = 'block';
    el.classList.remove('danger');
    currentTimerValue = 30;
    el.textContent = currentTimerValue;
    playSound(1200, 0.1);

    if (callTimerInterval) clearInterval(callTimerInterval);
    callTimerInterval = setInterval(() => {
        currentTimerValue--;
        el.textContent = currentTimerValue;
        playSound(800, 0.03);

        if (currentTimerValue <= 10) {
            el.classList.add('danger');
            playSound(400, 0.08);
        }

        if (currentTimerValue <= 0) {
            clearInterval(callTimerInterval);
            callTimerInterval = null;
            el.style.display = 'none';
            showCallModal();
        }
    }, 1000);
}

function showCallModal() {
    document.getElementById('callModal').style.display = 'flex';
    playRingSound();
}

function playRingSound() {
    if (ringInterval) return;
    const doRing = () => {
        playSound(800, 0.15);
        setTimeout(() => playSound(1000, 0.15), 200);
        setTimeout(() => playSound(800, 0.15), 400);
    };
    doRing();
    ringInterval = setInterval(doRing, 1200);
}

function stopRingSound() {
    if (ringInterval) {
        clearInterval(ringInterval);
        ringInterval = null;
    }
}

function declineCall() {
    stopRingSound();
    document.getElementById('callModal').style.display = 'none';
    playSound(200, 0.3, 'sawtooth');
    spawnBadViruses();
}

function acceptCall() {
    stopRingSound();
    document.getElementById('callModal').style.display = 'none';
    playSound(1200, 0.15, 'sine');
    openChat();
}

// ═══════════════════════════════════════════════════════════════
// ☠️ ВИРУСЫ ПРИ ОТКАЗЕ
// ═══════════════════════════════════════════════════════════════
function spawnBadViruses() {
    const viruses = ['🦠', '💀', '☣️', '🧬', '⚠️', '👾', '💣'];
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const v = document.createElement('div');
            v.className = 'bad-virus';
            v.textContent = viruses[Math.floor(Math.random() * viruses.length)];
            v.style.left = Math.random() * (window.innerWidth - 60) + 'px';
            v.style.top = Math.random() * (window.innerHeight - 60) + 'px';
            v.style.fontSize = (30 + Math.random() * 50) + 'px';
            document.body.appendChild(v);
            playSound(100 + Math.random() * 200, 0.1, 'sawtooth');
        }, i * 60);
    }
    setTimeout(() => {
        document.getElementById('gameOverScreen').style.display = 'flex';
        playSound(100, 0.5, 'sawtooth');
    }, 2000);
}

function restartFromCall() {
    document.querySelectorAll('.bad-virus').forEach(v => v.remove());
    document.getElementById('gameOverScreen').style.display = 'none';
    playSound(600, 0.05);
    startCallTimer();
}

// ═══════════════════════════════════════════════════════════════
// 💬 ЧАТ
// ═══════════════════════════════════════════════════════════════
function openChat() {
    document.getElementById('chatWindow').style.display = 'flex';
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('chatOptions').innerHTML = '';
    chatStep = 0;
    chatStartTime = Date.now();
    updateChatTimer();
    chatTimerInterval = setInterval(updateChatTimer, 1000);

    setTimeout(() => addChatMessage('system', '📞 Соединение установлено...'), 500);
    setTimeout(() => addChatMessage('unknown', 'Я знаю всё о тебе... Dundik.'), 1500);
    setTimeout(() => showChatOptions([
        { text: '😏 Я тоже всё о тебе знаю', next: 'resp1' },
        { text: '🤔 Кто ты такой?', next: 'resp2' },
        { text: '😤 Что тебе нужно?', next: 'resp3' }
    ]), 2200);
}

function updateChatTimer() {
    if (!chatStartTime) return;
    const elapsed = Math.floor((Date.now() - chatStartTime) / 1000);
    const m = Math.floor(elapsed / 60);
    const s = elapsed % 60;
    document.getElementById('chatHeaderText').textContent = 
        `📞 Неизвестный номер — ${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
}

function addChatMessage(type, text) {
    const container = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = 'chat-msg ' + type;
    if (type === 'unknown') {
        msg.innerHTML = '<div class="sender">???</div>' + text;
    } else if (type === 'dundik') {
        msg.innerHTML = '<div class="sender">Dundik</div>' + text;
    } else {
        msg.innerHTML = text;
    }
    container.appendChild(msg);
    container.scrollTop = container.scrollHeight;
    playSound(type === 'dundik' ? 900 : 600, 0.04);
}

function showChatOptions(options) {
    const container = document.getElementById('chatOptions');
    container.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'chat-option-btn';
        btn.textContent = opt.text;
        btn.onclick = () => {
            container.innerHTML = '';
            addChatMessage('dundik', opt.text.replace(/^[^\s]+\s/, ''));
            setTimeout(() => handleChatChoice(opt.next), 600);
        };
        container.appendChild(btn);
    });
}

function handleChatChoice(next) {
    if (next === 'resp1') {
        addChatMessage('unknown', 'Ха-ха! Дерзкий. Мне нравится. Но давай серьёзно.');
        setTimeout(() => addChatMessage('unknown', 'Ты играл в Змейку. 15 яблок. Впечатляет... для новичка.'), 1200);
        setTimeout(() => showChatOptions([
            { text: '💪 Это была разминка', next: 'r1a' },
            { text: '🤨 Слыш, ты вообще кто?', next: 'r1b' }
        ]), 2000);
    } else if (next === 'resp2') {
        addChatMessage('unknown', 'Тот, кто знает больше, чем следует. И следит за тобой с самого начала.');
        setTimeout(() => addChatMessage('unknown', 'Ты прошёл все проверки. Но настоящий тест начинается сейчас.'), 1200);
        setTimeout(() => showChatOptions([
            { text: '🔥 Я готов', next: 'r1a' },
            { text: '😴 Может, попозже?', next: 'r1b' }
        ]), 2200);
    } else if (next === 'resp3') {
        addChatMessage('unknown', 'Не так быстро, агент. Сначала проверка.');
        setTimeout(() => addChatMessage('unknown', 'Твоя реакция — 200мс. Слабо для агента BlackNet.'), 1200);
        setTimeout(() => showChatOptions([
            { text: '😎 Я просто дал тебе шанс', next: 'r1a' },
            { text: '🫡 Ок, что дальше?', next: 'r1b' }
        ]), 2200);
    } else if (next === 'r1a') {
        addChatMessage('unknown', 'Ладно, хватит болтовни. У меня к тебе предложение...');
        triggerDgNotifInChat();
    } else if (next === 'r1b') {
        addChatMessage('unknown', 'Не торопись. У меня к тебе предложение, которое изменит всё...');
        triggerDgNotifInChat();
    }
}

function triggerDgNotifInChat() {
    setTimeout(() => {
        addChatMessage('system', '⚠️ НОВОЕ СООБЩЕНИЕ ОТ DGYJura');
        setTimeout(() => addChatMessage('unknown', 'Но сначала — проверь сообщения. Там всё написано.'), 1200);
        setTimeout(() => addChatMessage('unknown', '*сброс*'), 2400);
        setTimeout(() => endChat(), 3600);
    }, 1200);
}

function endChat() {
    document.getElementById('chatWindow').style.display = 'none';
    if (chatTimerInterval) clearInterval(chatTimerInterval);
    try {
        localStorage.setItem('callDone', 'true');
        localStorage.setItem('chatDone', 'true');
    } catch(e) {}
    playSound(500, 0.15);

    setTimeout(() => {
        showTopNotif('📧 Проверьте сообщения', () => {
            openDgMessage();
        }, true);
    }, 500);
}

function openDgMessage() {
    playSound(800, 0.1);
    document.getElementById('dgMessageWindow').style.display = 'flex';
    try {
        localStorage.setItem('dgMessageRead', 'true');
    } catch(e) {}
}

function closeDgMessage() {
    playSound(400, 0.05);
    document.getElementById('dgMessageWindow').style.display = 'none';
    setTimeout(() => {
        showTopNotif('⏻ Выключите компьютер для продолжения', () => {
            showShutdown();
        }, true);
    }, 400);
}

function hangUp() {
    document.getElementById('chatWindow').style.display = 'none';
    if (chatTimerInterval) clearInterval(chatTimerInterval);
    playSound(200, 0.2);
    setTimeout(() => {
        showTopNotif('⚠️ Звонок прерван. Попробуй поговорить ещё раз', () => {
            startCallTimer();
        }, true);
    }, 500);
}

// ═══════════════════════════════════════════════════════════════
// 📧 ПРОВЕРКА ПРИ ЗАГРУЗКЕ (повідомлення DGYJura)
// ═══════════════════════════════════════════════════════════════
function checkTopNotif() {
    let chatDone = false;
    let dgRead = false;
    try {
        chatDone = localStorage.getItem('chatDone') === 'true';
        dgRead = localStorage.getItem('dgMessageRead') === 'true';
    } catch(e) {}

    if (chatDone && !dgRead) {
        setTimeout(() => {
            showTopNotif('📧 Проверьте сообщения', () => {
                openDgMessage();
            }, true);
        }, 500);
    } else if (chatDone && dgRead) {
        setTimeout(() => {
            showTopNotif('⏻ Выключите компьютер для продолжения', () => {
                showShutdown();
            }, true);
        }, 500);
    }
}

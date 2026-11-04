// ═══════════════════════════════════════════════════════════════
// CALL.JS — дзвінок, чат, віруси (РОЗШИРЕНИЙ діалог)
// Використовує: playSound, showTopNotif, hideTopNotif, showShutdown (з desktop.js)
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
// 💬 ЧАТ — РОЗШИРЕНИЙ ДІАЛОГ
// ═══════════════════════════════════════════════════════════════

// Індикатор "друкує..."
let typingTimeout = null;
function showTyping(callback, delay = 1500) {
    const container = document.getElementById('chatMessages');
    let existing = document.getElementById('typingIndicator');
    if (existing) existing.remove();

    const typing = document.createElement('div');
    typing.id = 'typingIndicator';
    typing.className = 'typing-indicator show';
    typing.innerHTML = '??? печатает<span class="dots"></span>';
    container.appendChild(typing);
    container.scrollTop = container.scrollHeight;

    if (typingTimeout) clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
        if (typing.parentNode) typing.remove();
        if (callback) callback();
    }, delay);
}

function openChat() {
    document.getElementById('chatWindow').style.display = 'flex';
    document.getElementById('chatMessages').innerHTML = '';
    document.getElementById('chatOptions').innerHTML = '';
    chatStep = 0;
    chatStartTime = Date.now();
    updateChatTimer();
    chatTimerInterval = setInterval(updateChatTimer, 1000);

    // ══════ СЦЕНА 1: ВСТУПЛЕНИЕ ══════
    setTimeout(() => addChatMessage('system', '📞 Соединение установлено...'), 600);
    setTimeout(() => {
        showTyping(() => addChatMessage('unknown', 'Я знаю всё о тебе... Dundik.'), 1800);
    }, 1500);
    setTimeout(() => {
        showTyping(() => addChatMessage('unknown', 'Твой IP. Твою систему. Твои пароли. Даже то, как ты играешь в Змейку.'), 2200);
    }, 4000);
    setTimeout(() => {
        showTyping(() => {
            showChatOptions([
                { text: '😏 Я тоже о тебе всё знаю', next: 'a1' },
                { text: '🤔 Кто ты, чёрт возьми?', next: 'a2' },
                { text: '😤 Чего ты хочешь?', next: 'a3' }
            ]);
        }, 1800);
    }, 7000);
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
            setTimeout(() => handleChatChoice(opt.next), 700);
        };
        container.appendChild(btn);
    });
}

function handleChatChoice(next) {
    // ══════ СЦЕНА 2: ВІДПОВІДЬ + ПЕРЕВІРКА ══════
    if (next === 'a1') {
        showTyping(() => addChatMessage('unknown', 'Ха-ха! Дерзкий. Мне нравится. Но давай по-серьёзному.'), 1500);
        setTimeout(() => showTyping(() => addChatMessage('unknown', 'Ты прошёл Змейку. 15 яблок. И даже вирусы не задели тебя, да?'), 2000), 3500);
        setTimeout(() => showTyping(() => showChatOptions([
            { text: '💪 Это была разминка', next: 'b1' },
            { text: '🤨 Ты следил за мной?', next: 'b2' }
        ]), 1800), 7000);
    } else if (next === 'a2') {
        showTyping(() => addChatMessage('unknown', 'Тот, кто знает больше, чем следует. Тот, о ком ты никогда не слышал.'), 1800);
        setTimeout(() => showTyping(() => addChatMessage('unknown', 'Но ты меня знаешь. Хотя бы по имени... «Синдикат».'), 1800), 4000);
        setTimeout(() => showTyping(() => showChatOptions([
            { text: '😨 Синдикат?! Вы же легенда', next: 'b1' },
            { text: '😒 Пфф. Слышал о вас', next: 'b2' }
        ]), 1800), 7500);
    } else if (next === 'a3') {
        showTyping(() => addChatMessage('unknown', 'Не так быстро, агент. Сначала — проверка.'), 1500);
        setTimeout(() => showTyping(() => addChatMessage('unknown', 'Твоя реакция — 200мс. Слабо для BlackNet. Но для новичка — сойдёт.'), 2000), 3500);
        setTimeout(() => showTyping(() => showChatOptions([
            { text: '😎 Я просто дал тебе фору', next: 'b1' },
            { text: '🫡 Ладно, что дальше?', next: 'b2' }
        ]), 1800), 7000);
    }

    // ══════ СЦЕНА 3: ГЛИБШЕ ══════
    else if (next === 'b1') {
        showTyping(() => addChatMessage('unknown', 'Мне нравится твой настрой. DGYJura не соврал — ты толковый.'), 1800);
        setTimeout(() => showTyping(() => addChatMessage('unknown', 'Но вот в чём дело... Он в беде. И ты это знаешь.'), 1800), 4200);
        setTimeout(() => showTyping(() => showChatOptions([
            { text: '😰 Что с ним?!', next: 'c1' },
            { text: '🤬 Если ты его тронул...', next: 'c2' }
        ]), 1800), 8000);
    } else if (next === 'b2') {
        showTyping(() => addChatMessage('unknown', 'Слышал. Значит понимаешь масштаб.'), 1500);
        setTimeout(() => showTyping(() => addChatMessage('unknown', 'Твой друг DGYJura — он нам мешал. И знаешь что? Мы его... задержали.'), 2200), 3500);
        setTimeout(() => showTyping(() => showChatOptions([
            { text: '😡 Где он?!', next: 'c1' },
            { text: '🥶 Вы ответите за это', next: 'c2' }
        ]), 1800), 8000);
    }

    // ══════ СЦЕНА 4: КУЛЬМІНАЦІЯ ══════
    else if (next === 'c1') {
        showTyping(() => addChatMessage('unknown', 'Живой. Пока что. Но каждый час в сети — час ближе к точке невозврата.'), 2200);
        setTimeout(() => showTyping(() => addChatMessage('unknown', 'Хочешь его спасти? Тогда слушай внимательно...'), 1800), 4500);
        setTimeout(() => showTyping(() => addChatMessage('unknown', 'Есть предложение. Но сначала — проверь сообщения. DGYJura успел тебе кое-что оставить.'), 2500), 8000);
        setTimeout(() => triggerDgNotifInChat(), 12000);
    } else if (next === 'c2') {
        showTyping(() => addChatMessage('unknown', 'Угрозы? Ха-ха. Смешно.'), 1500);
        setTimeout(() => showTyping(() => addChatMessage('unknown', 'Знаешь, что смешно ещё больше? Ты сейчас сидишь в системе, которую МЫ контролируем.'), 2200), 3200);
        setTimeout(() => showTyping(() => addChatMessage('unknown', 'Так что давай без этого. Слушай предложение. Оно выгодно и тебе, и DGYJura.'), 2200), 7500);
        setTimeout(() => showTyping(() => addChatMessage('unknown', 'Но сначала — проверь сообщения. Там всё написано.'), 1800), 11500);
        setTimeout(() => triggerDgNotifInChat(), 15000);
    }
}

function triggerDgNotifInChat() {
    showTyping(() => addChatMessage('system', '⚠️ НОВОЕ СООБЩЕНИЕ ОТ DGYJura'), 1200);
    setTimeout(() => showTyping(() => addChatMessage('unknown', 'Ну всё, мне пора. Не заставляй меня ждать.'), 1500), 3500);
    setTimeout(() => showTyping(() => addChatMessage('unknown', '*сброс соединения*'), 1200), 6500);
    setTimeout(() => endChat(), 9000);
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
// 📧 ПРОВЕРКА ПРИ ЗАГРУЗКЕ
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

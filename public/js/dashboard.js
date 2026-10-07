// public/js/dashboard.js
// ⚡ ELYXIUM BOT — Dashboard Frontend Logic
// ⚡ Powered by ATHEX x ALTHEA

 =
// GLOBAL STATE
 =

const AppState = {
    socket: null,
    currentUser: null,
    sessions: new Map(),
    isConnected: false,
};

 =
// DOM ELEMENTS
 =

const DOM = {
    // Input
    phoneInput: document.getElementById('phoneInput'),
    connectBtn: document.getElementById('connectBtn'),

    // Pairing
    pairingSection: document.getElementById('pairingSection'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    pairingCodeBox: document.getElementById('pairingCodeBox'),
    codeDisplay: document.getElementById('codeDisplay'),
    qrBox: document.getElementById('qrBox'),
    qrCanvas: document.getElementById('qrCanvas'),

    // Sessions
    sessionsGrid: document.getElementById('sessionsGrid'),

    // Console
    consoleOutput: document.getElementById('consoleOutput'),

    // Stats
    activeCount: document.getElementById('activeCount'),
    totalCount: document.getElementById('totalCount'),

    // Toast
    toastContainer: document.getElementById('toastContainer'),
};

 =
// INITIALIZATION
 =

function initDashboard() {
    console.log('%c🚀 ELYXIUM BOT Dashboard Ready', 'color: #a855f7; font-size: 1.2rem;');
    console.log('%c⚡ Powered by ATHEX x ALTHEA', 'color: #6366f1;');

    // Connect to Socket.IO
    connectSocket();

    // Bind events
    bindEvents();

    // Request initial data
    setTimeout(() => {
        if (AppState.socket?.connected) {
            AppState.socket.emit('get-sessions');
        }
    }, 500);
}

 =
// SOCKET.IO CONNECTION
 =

function connectSocket() {
    AppState.socket = io({
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
    });

    // Connection Events
    AppState.socket.on('connect', () => {
        AppState.isConnected = true;
        addLog('🟢 Connected to ELYXIUM server', 'success');
        updateConnectionIndicator(true);
    });

    AppState.socket.on('disconnect', () => {
        AppState.isConnected = false;
        addLog('🔴 Disconnected from server', 'error');
        updateConnectionIndicator(false);
    });

    AppState.socket.on('reconnect', (attempt) => {
        addLog(`🔄 Reconnected after ${attempt} attempt(s)`, 'success');
        AppState.socket.emit('get-sessions');
    });

    AppState.socket.on('connect_error', (error) => {
        addLog(`⚠️ Connection error: ${error.message}`, 'warning');
    });

    // Pairing Events
    AppState.socket.on('pairing-code', handlePairingCode);
    AppState.socket.on('pairing-error', handlePairingError);
    AppState.socket.on('qr', handleQRCode);

    // Session Events
    AppState.socket.on('connection-status', handleConnectionStatus);
    AppState.socket.on('sessions-list', handleSessionsList);
    AppState.socket.on('total-active', handleTotalActive);

    // Console Events
    AppState.socket.on('console', handleConsoleLog);
}

 =
// EVENT BINDINGS
 =

function bindEvents() {
    // Connect button
    DOM.connectBtn?.addEventListener('click', handleConnect);

    // Enter key on input
    DOM.phoneInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleConnect();
    });

    // Auto-format phone number
    DOM.phoneInput?.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '');
    });

    // Window unload
    window.addEventListener('beforeunload', () => {
        if (AppState.socket) {
            AppState.socket.disconnect();
        }
    });
}

 =
// CONNECTION HANDLER
 =

function handleConnect() {
    const number = DOM.phoneInput?.value.trim();

    // Validate
    if (!number || !/^\d{10,15}$/.test(number)) {
        showToast('Please enter a valid WhatsApp number', 'error');
        DOM.phoneInput?.focus();
        return;
    }

    AppState.currentUser = number;

    // Register user with socket
    AppState.socket.emit('set-user', AppState.currentUser);

    // Show loading
    DOM.connectBtn.disabled = true;
    DOM.pairingSection.style.display = 'block';
    DOM.loadingSpinner.style.display = 'block';
    DOM.pairingCodeBox.style.display = 'none';
    DOM.qrBox.style.display = 'none';

    // Request pairing
    AppState.socket.emit('pair-request', {
        userId: AppState.currentUser,
        number: AppState.currentUser,
    });

    addLog(`📱 Requesting pairing for +${number}...`, 'info');
    showToast('Requesting pairing code...', 'info');
}

 =
// PAIRING HANDLERS
 =

function handlePairingCode(code) {
    DOM.loadingSpinner.style.display = 'none';
    DOM.pairingCodeBox.style.display = 'block';
    DOM.qrBox.style.display = 'none';

    if (DOM.codeDisplay) {
        DOM.codeDisplay.textContent = code;
    }

    DOM.connectBtn.disabled = false;
    addLog(`🔑 Pairing code generated: ${code}`, 'success');
    showToast('Pairing code generated! Enter it in WhatsApp.', 'success');
}

function handlePairingError(error) {
    DOM.loadingSpinner.style.display = 'none';
    DOM.connectBtn.disabled = false;
    addLog(`❌ Pairing failed: ${error}`, 'error');
    showToast('Pairing failed: ' + error, 'error');
}

function handleQRCode(qrData) {
    DOM.loadingSpinner.style.display = 'none';
    DOM.pairingCodeBox.style.display = 'none';
    DOM.qrBox.style.display = 'block';

    // Render QR code
    if (typeof QRCode !== 'undefined' && DOM.qrCanvas) {
        try {
            QRCode.toCanvas(DOM.qrCanvas, qrData, {
                width: 250,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff',
                },
            });
            addLog('📱 QR Code ready — scan with WhatsApp', 'info');
        } catch (e) {
            addLog('⚠️ Failed to render QR code', 'warning');
        }
    }

    DOM.connectBtn.disabled = false;
    showToast('QR Code ready! Scan with WhatsApp.', 'success');
}

 =
// SESSION HANDLERS
 =

function handleConnectionStatus(data) {
    if (data.connected) {
        showToast(`WhatsApp connected! 🎉`, 'success');
        DOM.pairingSection.style.display = 'none';
        DOM.connectBtn.disabled = false;
        addLog(`✅ Session connected: +${data.user}`, 'success');
    } else {
        addLog(`❌ Session disconnected: +${data.user}`, 'warning');
    }

    updateSession(data);
    updateStats();
}

function handleSessionsList(list) {
    DOM.sessionsGrid.innerHTML = '';

    if (!list || list.length === 0) {
        showEmptyState();
        return;
    }

    list.forEach(session => {
        AppState.sessions.set(session.userId, session);
    });

    renderSessions();
    updateStats();
}

function handleTotalActive(count) {
    if (DOM.activeCount) {
        DOM.activeCount.textContent = count;
    }
}

function updateSession(data) {
    const existing = AppState.sessions.get(data.user) || {};
    AppState.sessions.set(data.user, { ...existing, ...data });
    renderSessions();
}

function renderSessions() {
    if (!DOM.sessionsGrid) return;

    DOM.sessionsGrid.innerHTML = '';

    if (AppState.sessions.size === 0) {
        showEmptyState();
        return;
    }

    AppState.sessions.forEach((session) => {
        const card = createSessionCard(session);
        DOM.sessionsGrid.appendChild(card);
    });
}

function createSessionCard(session) {
    const card = document.createElement('div');
    card.className = 'session-card';
    card.setAttribute('data-user', session.userId);

    const isOnline = session.connected;

    card.innerHTML = `
        <div class="session-header">
            <div class="session-status">
                <span class="status-dot ${isOnline ? 'online' : 'offline'}"></span>
                <strong>+${session.userId}</strong>
            </div>
            <span style="color: ${isOnline ? 'var(--green)' : 'var(--red)'}; font-size: 0.85rem;">
                ${isOnline ? '● Online' : '○ Offline'}
            </span>
        </div>
        <div class="session-body">
            <div>🤖 AI: ${session.aiEnabled ? '✅' : '❌'} &nbsp;|&nbsp; 🌍 Public: ${session.isPublic ? '✅' : '❌'} &nbsp;|&nbsp; ❤️ React: ${session.autoReact ? '✅' : '❌'}</div>
        </div>
        <div class="session-actions">
            <button class="btn btn-outline btn-sm" onclick="viewSessionQR('${session.userId}')">
                <i class="fas fa-qrcode"></i> QR
            </button>
            <button class="btn btn-danger btn-sm" onclick="logoutSession('${session.userId}')">
                <i class="fas fa-sign-out-alt"></i> Logout
            </button>
        </div>
    `;

    return card;
}

function showEmptyState() {
    if (!DOM.sessionsGrid) return;
    DOM.sessionsGrid.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
            <div class="icon">🤖</div>
            <h3>No Active Sessions</h3>
            <p>Enter a WhatsApp number above to get started.</p>
        </div>
    `;
}

function updateStats() {
    const total = AppState.sessions.size;
    const active = Array.from(AppState.sessions.values()).filter(s => s.connected).length;

    if (DOM.totalCount) DOM.totalCount.textContent = total;
    if (DOM.activeCount) DOM.activeCount.textContent = active;
}

 =
// SESSION ACTIONS
 =

function logoutSession(userId) {
    if (!confirm(`Logout session for +${userId}?`)) return;

    AppState.socket.emit('logout', userId);
    AppState.sessions.delete(userId);
    renderSessions();
    updateStats();
    addLog(`🚪 Logged out session: +${userId}`, 'info');
    showToast('Session logged out', 'success');
}

function viewSessionQR(userId) {
    AppState.currentUser = userId;
    AppState.socket.emit('set-user', userId);

    DOM.pairingSection.style.display = 'block';
    DOM.loadingSpinner.style.display = 'block';
    DOM.pairingCodeBox.style.display = 'none';
    DOM.qrBox.style.display = 'none';

    addLog(`📱 Requesting QR for +${userId}...`, 'info');
}

 =
// CONSOLE
 =

function handleConsoleLog(log) {
    addLog(`[${log.timestamp}] ${log.message}`, log.type);
}

function addLog(message, type = 'info') {
    if (!DOM.consoleOutput) return;

    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.textContent = `[${getTimestamp()}] ${message}`;

    DOM.consoleOutput.appendChild(entry);
    DOM.consoleOutput.scrollTop = DOM.consoleOutput.scrollHeight;

    // Limit log entries
    while (DOM.consoleOutput.children.length > 200) {
        DOM.consoleOutput.removeChild(DOM.consoleOutput.firstChild);
    }
}

function clearConsole() {
    if (!DOM.consoleOutput) return;
    DOM.consoleOutput.innerHTML = '';
    addLog('🗑️ Console cleared', 'info');
}

// Make clearConsole globally available
window.clearConsole = clearConsole;

 =
// TOAST NOTIFICATIONS
 =

function showToast(message, type = 'info') {
    if (!DOM.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    // Set color based on type
    const colors = {
        success: 'var(--green)',
        error: 'var(--red)',
        warning: 'var(--gold)',
        info: 'var(--accent)',
    };

    toast.style.borderColor = colors[type] || colors.info;
    toast.textContent = message;

    DOM.toastContainer.appendChild(toast);

    // Auto remove
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}

 =
// CONNECTION INDICATOR
 =

function updateConnectionIndicator(connected) {
    const dot = document.querySelector('.dot.green');
    if (dot) {
        if (connected) {
            dot.classList.add('green');
            dot.classList.remove('red');
        } else {
            dot.classList.add('red');
            dot.classList.remove('green');
        }
    }
}

 =
// UTILITIES
 =

function getTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });
}

function formatNumber(number) {
    return String(number).replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
}

 =
// KEYBOARD SHORTCUTS
 =

document.addEventListener('keydown', (e) => {
    // Ctrl+K or Ctrl+L = Clear console
    if ((e.ctrlKey || e.metaKey) && (e.key === 'k' || e.key === 'l')) {
        e.preventDefault();
        clearConsole();
    }

    // Ctrl+R = Refresh sessions
    if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        // Don't prevent default — allow page refresh
        // But also refresh sessions if staying
        setTimeout(() => {
            if (AppState.socket?.connected) {
                AppState.socket.emit('get-sessions');
            }
        }, 500);
    }

    // Escape = Close pairing section
    if (e.key === 'Escape') {
        DOM.pairingSection.style.display = 'none';
        DOM.connectBtn.disabled = false;
    }
});

 =
// INIT ON LOAD
 =

document.addEventListener('DOMContentLoaded', () => {
    initDashboard();
});

 =
// EXPORT FOR GLOBAL ACCESS
 =

window.logoutSession = logoutSession;
window.viewSessionQR = viewSessionQR;
window.clearConsole = clearConsole;
window.AppState = AppState;
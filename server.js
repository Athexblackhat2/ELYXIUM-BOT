require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const qrcode = require('qrcode');
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, Browsers, delay } = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');
const pino = require('pino');
const chalk = require('chalk');
const config = require('./config.json');

const dataDir = path.join(__dirname, 'data');
const usersFile = path.join(dataDir, 'users.json');
const authBaseDir = path.join(__dirname, 'auth_info');
const logoPath = path.join(__dirname, 'assets', 'logo.jpeg');
const logoPngPath = path.join(__dirname, 'assets', 'logo.png');
const getLogoPath = () => fs.existsSync(logoPngPath) ? logoPngPath : fs.existsSync(logoPath) ? logoPath : null;
const statusSettingsPath = path.join(dataDir, 'autostatus.json');

if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
if (!fs.existsSync(usersFile)) fs.writeFileSync(usersFile, JSON.stringify([], null, 2));
if (!fs.existsSync(statusSettingsPath)) fs.writeFileSync(statusSettingsPath, JSON.stringify({}));
if (!fs.existsSync(authBaseDir)) fs.mkdirSync(authBaseDir, { recursive: true });

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*', methods: ['GET', 'POST'] }, transports: ['websocket', 'polling'], pingTimeout: 60000, pingInterval: 25000 });
app.use(express.json()); app.use(express.urlencoded({ extended: true })); app.use(express.static(path.join(__dirname, 'public')));

const sessions = {}; const userSockets = {}; let totalActive = 0; let antiCallController = null; let commandMap = null;

function loadCommands() {
    if (commandMap) return commandMap;
    commandMap = new Map();
    const cmdsPath = path.join(__dirname, 'commands');
    if (!fs.existsSync(cmdsPath)) return commandMap;
    function scanDir(dir) {
        for (const item of fs.readdirSync(dir)) {
            const fp = path.join(dir, item);
            if (fs.statSync(fp).isDirectory()) scanDir(fp);
            else if (item.endsWith('.js')) { try { const c = require(fp); commandMap.set(c.name, c); } catch (e) {} }
        }
    }
    scanDir(cmdsPath);
    console.log(chalk.cyan(`${commandMap.size} commands loaded`));
    return commandMap;
}

const openCommands = ['register', 'menu', 'help', 'crash', 'ping', 'spam', 'anticall', 'about', 'autostatus'];

function getStatusSettings() { try { return JSON.parse(fs.readFileSync(statusSettingsPath, 'utf8')); } catch (e) { return {}; } }

async function autoStatusSeenReact(sock, msg) {
    try {
        if (!msg.message) return;
        const jid = msg.key.remoteJid;
        if (jid !== 'status@broadcast') return;
        const participant = msg.key.participant || msg.key.remoteJid;
        const ownerId = participant.split('@')[0];
        const settings = getStatusSettings();
        if (!settings[ownerId]) return;
        await sock.readMessages([msg.key]);
        const reacts = ['🔥', '❤️', '👍', '💯', '😍', '👏', '✨', '💀'];
        await sock.sendMessage(jid, { react: { text: reacts[Math.floor(Math.random() * reacts.length)], key: msg.key } });
        const comments = ['🔥 Awesome!', '❤️ Love this!', '💯 Perfect!', '😍 Amazing!', '👏 Great!', '✨ Nice!', '💀 Cool!', '🌟 Superb!'];
        await sock.sendMessage(participant, { text: comments[Math.floor(Math.random() * comments.length)] }, { quoted: msg });
    } catch (e) {}
}

async function handleMessage(sock, msg) {
    try {
        if (!msg.message) return;
        if (msg.key.remoteJid === 'status@broadcast') return;
        let text = '';
        const type = Object.keys(msg.message)[0];
        if (type === 'conversation') text = msg.message.conversation || '';
        else if (type === 'extendedTextMessage') text = msg.message.extendedTextMessage?.text || '';
        else if (type === 'imageMessage') text = msg.message.imageMessage?.caption || '';
        if (!text) return;
        if (!text.startsWith(config.bot.prefix)) return;
        const args = text.slice(config.bot.prefix.length).trim().split(/ +/);
        const cmdName = args.shift().toLowerCase();
        const senderId = msg.key.remoteJid;
        console.log(chalk.cyan(`${config.bot.prefix}${cmdName} from ${senderId}`));
        const commands = loadCommands();
        const command = commands.get(cmdName);
        if (!command) { await sock.sendMessage(senderId, { text: `❌ Unknown: *${config.bot.prefix}${cmdName}*\nUse *${config.bot.prefix}menu*` }); return; }
        if (!openCommands.includes(cmdName)) {
            const { quickCheck } = require('./middleware/ownerCheck');
            if (!quickCheck(senderId)) { await sock.sendMessage(senderId, { text: `⚠️ ACCESS DENIED\n\nDON'T TRY...\nIT'S NOT NORMAL!\n\nTHIS IS THE POWER OF ⚡ ATHEX & ALTHEA ⚡` }); return; }
        }
        await command.execute(sock, msg, args, config);
        console.log(chalk.green(`✅ ${config.bot.prefix}${cmdName} done`));
    } catch (error) { console.error(chalk.red('Msg error:'), error.message); }
}

async function sendWelcomeMessage(sock, ownerJid, ownerName) {
    try {
        const welcomeText = `🤖 *WELCOME TO ELYXIUM BOT v1.0 PRO!*\n\n👤 *Owner:* ${ownerName}\n📱 *Number:* ${ownerJid.replace('@s.whatsapp.net', '')}\n📅 *Connected:* ${new Date().toLocaleString()}\n\n✅ *FEATURES:*\n🟢 Fake Online/Offline\n🚫 Anti-Call Shield\n💀 Hack Prank\n💣 Spam Bomber\n☠️ Crash Mode\n📸 Media Downloader\n👁️ Auto Status Seen+React\n\n📋 *!menu* for commands\n📋 *!autostatus on* for status auto\n\n⚡ *Powered by ATHEX & ALTHEA* ⚡`;
        const logo = getLogoPath();
        if (logo) await sock.sendMessage(ownerJid, { image: { url: logo }, caption: welcomeText });
        else await sock.sendMessage(ownerJid, { text: welcomeText });
        console.log(chalk.cyan(`📨 Welcome sent to: ${ownerJid}`));
    } catch (err) {}
}

function createSession(userId, socketId) {
    const authPath = path.join(authBaseDir, userId);
    if (fs.existsSync(authPath)) fs.rmSync(authPath, { recursive: true, force: true });
    fs.mkdirSync(authPath, { recursive: true });
    const session = {
        userId, socketId, sock: null, isConnected: false, isInitializing: false, authPath,
        async initialize(pairingNumber = null) {
            if (this.isInitializing) return;
            this.isInitializing = true;
            try {
                const { version } = await fetchLatestBaileysVersion();
                const { state, saveCreds } = await useMultiFileAuthState(this.authPath);
                this.sock = makeWASocket({ version, auth: state, printQRInTerminal: false, logger: pino({ level: 'silent' }), browser: Browsers.ubuntu('Chrome'), markOnlineOnConnect: true, syncFullHistory: false, connectTimeoutMs: 60000, keepAliveIntervalMs: 30000 });
                if (pairingNumber && !state.creds.registered) {
                    await delay(4000);
                    try { let code = await this.sock.requestPairingCode(pairingNumber); code = String(code).replace(/\s|-/g, ''); emitToUser(userId, 'pairing-code', code); console.log(chalk.green(`🔑 Code: ${code}`)); } catch (err) { emitToUser(userId, 'pairing-error', err.message); }
                }
                this.sock.ev.on('connection.update', async (update) => {
                    const { connection, lastDisconnect, qr } = update;
                    if (qr) { try { const qrData = await qrcode.toDataURL(qr); emitToUser(userId, 'qr', qrData); } catch (e) {} }
                    if (connection === 'close') {
                        const code = new Boom(lastDisconnect?.error)?.output?.statusCode;
                        this.isConnected = false; this.isInitializing = false;
                        emitToUser(userId, 'connection-status', { connected: false, user: userId }); broadcastActive();
                        if (code === DisconnectReason.loggedOut || code === 401) { if (fs.existsSync(this.authPath)) fs.rmSync(this.authPath, { recursive: true, force: true }); delete sessions[userId]; }
                        else { setTimeout(() => this.initialize(), 5000); }
                    }
                    if (connection === 'open') {
                        this.isConnected = true; this.isInitializing = false;
                        emitToUser(userId, 'connection-status', { connected: true, user: userId }); broadcastActive();
                        console.log(chalk.green('✅ Connected!'));
                        if (!antiCallController) { const { AntiCallController } = require('./utils/antiCallEngine'); antiCallController = new AntiCallController(this.sock); }
                        if (this.sock.user) {
                            const id = this.sock.user.id.split(':')[0];
                            const ownerJid = `${id}@s.whatsapp.net`; const ownerName = this.sock.user.name || 'Owner';
                            const { registerOwner } = require('./middleware/ownerCheck'); registerOwner(ownerJid, ownerName);
                            setTimeout(() => sendWelcomeMessage(this.sock, ownerJid, ownerName), 2000);
                        }
                    }
                });
                this.sock.ev.on('creds.update', saveCreds);
                this.sock.ev.on('messages.upsert', async (m) => {
                    if (m.type !== 'notify') return;
                    for (const msg of m.messages) { await autoStatusSeenReact(this.sock, msg); await handleMessage(this.sock, msg); }
                });
                this.sock.ev.on('call', async (calls) => {
                    if (!antiCallController) { const { AntiCallController } = require('./utils/antiCallEngine'); antiCallController = new AntiCallController(this.sock); }
                    for (const call of calls) { const result = await antiCallController.handleCall(call); if (result.handled) { console.log(chalk.red(`🚫 Call blocked: ${result.caller}`)); } }
                });
            } catch (err) { this.isInitializing = false; console.error(chalk.red('Init error:'), err.message); setTimeout(() => this.initialize(), 10000); }
        },
        async logout() { try { if (this.sock) await this.sock.logout(); } catch (e) {} if (fs.existsSync(this.authPath)) fs.rmSync(this.authPath, { recursive: true, force: true }); this.isConnected = false; antiCallController = null; }
    };
    return session;
}

io.on('connection', (socket) => {
    console.log(chalk.cyan(`🔌 Client: ${socket.id}`));
    socket.on('set-user', (userId) => { userSockets[userId] = socket.id; if (sessions[userId]) socket.emit('connection-status', { connected: sessions[userId].isConnected, user: userId }); });
    socket.on('pair-request', async ({ userId, number }) => { try { if (!sessions[userId]) sessions[userId] = createSession(userId, socket.id); await sessions[userId].initialize(number); } catch (error) { socket.emit('pairing-error', error.message); } });
    socket.on('logout', async (userId) => { if (sessions[userId]) { await sessions[userId].logout(); delete sessions[userId]; } broadcastActive(); socket.emit('logout-success', userId); });
    socket.on('get-sessions', () => { socket.emit('sessions-list', Object.entries(sessions).map(([id, s]) => ({ userId: id, connected: s.isConnected }))); });
    socket.on('disconnect', () => { for (const [uid, sid] of Object.entries(userSockets)) { if (sid === socket.id) { delete userSockets[uid]; break; } } });
});

function emitToUser(userId, event, data) { const sid = userSockets[userId]; if (sid) io.to(sid).emit(event, data); }
function broadcastActive() { totalActive = Object.values(sessions).filter(s => s.isConnected).length; io.emit('total-active', totalActive); }

app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'public', 'about.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/api/health', (req, res) => res.json({ status: 'ok', bot: config.bot.name, version: config.bot.version, uptime: process.uptime(), activeSessions: totalActive }));
app.get('/api/stats', (req, res) => { const users = JSON.parse(fs.readFileSync(usersFile, 'utf8')); res.json({ totalUsers: users.length, activeSessions: totalActive }); });

const ADMIN_PIN = process.env.ADMIN_PIN || '123456';
const adminTokens = new Set();
app.post('/api/admin/login', (req, res) => { const { pin } = req.body; if (pin === ADMIN_PIN) { const token = 'admin_' + Date.now(); adminTokens.add(token); setTimeout(() => adminTokens.delete(token), 7200000); return res.json({ success: true, token }); } res.status(401).json({ success: false }); });
function adminAuth(req, res, next) { if (!adminTokens.has(req.headers.authorization?.replace('Bearer ', ''))) return res.status(401).json({ success: false }); next(); }
app.get('/api/admin/stats', adminAuth, (req, res) => { const users = JSON.parse(fs.readFileSync(usersFile, 'utf8')); res.json({ totalUsers: users.length, activeSessions: totalActive }); });
app.get('/api/admin/users', adminAuth, (req, res) => { const users = JSON.parse(fs.readFileSync(usersFile, 'utf8')); res.json({ users: users.map(u => ({ number: u.userId.split('@')[0], tier: 'free', created_at: u.linkedAt, commands: u.stats?.commandsUsed || 0 })) }); });
app.get('/api/admin/sessions', adminAuth, (req, res) => res.json({ sessions: Object.entries(sessions).map(([id]) => ({ user_number: id, connected_at: new Date().toISOString() })) }));
app.post('/api/admin/force-disconnect', adminAuth, (req, res) => { const { number } = req.body; if (sessions[number]) { sessions[number].logout().catch(() => {}); delete sessions[number]; } res.json({ success: true }); });

const PORT = process.env.PORT || config.server?.port || 20370;
server.listen(PORT, () => {
    console.clear();
    console.log(chalk.hex('#a855f7').bold('\nPOWERED BY ATHEX & ALTHEA'));
    console.log(chalk.hex('#6366f1').bold('\n⚡ ELYXIUM BOT v1.0 PRO — ATHEX x ALTHEA ⚡\n'));
    console.log(chalk.white(`http://localhost:${PORT}`));
    console.log(chalk.white(`Total: ${loadCommands().size} commands | AutoStatus: ON | AntiCall: ON\n`));
    console.log(chalk.green('✅ LIVE!\n'));
});

process.on('SIGINT', async () => { for (const s of Object.values(sessions)) { try { await s.logout(); } catch (e) {} } io.close(); server.close(); process.exit(0); });
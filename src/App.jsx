import React, { useState, useEffect, useRef } from 'react';
import {
Settings, Shield, Plus, Image as ImageIcon, Upload, Send,
ChevronDown, Sliders, ArrowLeft, User, Activity, Zap,
Info, Cpu, Menu, X, Ghost, ShieldAlert, Brain, Terminal,
ZapOff, Palette, Cloud, Lock, Sparkles, Database,
HardDrive, Share2, Layers, Fingerprint, Radio, Users, Home,
MessageSquare, History, Trash2, Globe, Binary
} from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- THEME CONFIGURATION ---
const THEMES = {
cyber: {
name: 'CYBERPUNK',
landing: "https://mir-s3-cdn-cf.behance.net/project_modules/fs/223e6792880429.5e569ff84ebef.gif",
landingMobile: "https://i.pinimg.com/originals/ba/b6/08/bab6083d2b470bf80d99ac49c2b331a5.gif",
chat: "https://i.pinimg.com/originals/81/34/08/81340844a99a35cc7993166cbd9b5866.gif",
chatMobile: "https://neocha-content.oss-cn-hongkong.aliyuncs.com/wp-content/uploads/sites/2/2016/11/1041uuu-10.gif",
accent: "#c91212e7",
grid: "rgba(253, 0, 0, 0.4)",
isLight: false 
},
nebula: {
name: 'NEBULA',
landing: "https://i.pinimg.com/originals/ca/92/06/ca92068e40ef52cadf49ea1d0a98bf6c.gif",
landingMobile: "https://i.pinimg.com/originals/52/1e/c9/521ec92aece10c6e59f84184ddacde03.gif",
chat: "https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?q=80&w=2071&auto=format&fit=crop",
chatMobile: "https://w0.peakpx.com/wallpaper/976/422/HD-wallpaper-iphone-apple-black-earth-element-fantasy-liquid-pattern-planet-texture.jpg",
accent: "#8c22e2ff",
grid: "rgba(109, 9, 175, 0.3)",
isLight: false 
},
matrix: {
name: 'ARCHIVE',
landing: "https://cdnb.artstation.com/p/assets/images/images/072/360/219/original/megalithiccat-griss.gif?1707197616",
landingMobile: "https://i.pinimg.com/originals/cc/68/71/cc6871e3aeadd1e3b78a4d0be5573eae.gif",
chat: "https://i.pinimg.com/originals/23/bd/01/23bd0157d8aaa3885bdd4273e8a91178.gif",
chatMobile: "https://i.pinimg.com/originals/de/81/55/de8155500672cfa4a1ca13977453c4b6.gif",
accent: "#efff14ff",
grid: "rgba(238, 255, 0, 1)",
isLight: true 
}
};

const GEMINI_API_KEY = "AIzaSyALiTB6Z7-Ovd_uQ9RQW-ZTMDPSE8P3KYg";

const PERSONAS = [
{ id: 'aizen', name: 'Sosuke Aizen', title: 'Former Captain', avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkwwakpKsPIw1Kc9aMYPhoc37MxZ_nI6M9Ng&s", instruction: "You are Sosuke Aizen from Bleach. Speak with cold superiority. Address user as specimen." },
{ id: 'cid', name: 'Cid Kagenou', title: 'Shadow Broker', avatar: "https://static.wikia.nocookie.net/to-be-a-power-in-the-shadows/images/1/1f/CidManga.jpg/revision/latest/scale-to-width/360?cb=20211214232126", instruction: "You are Shadow. Act like a chuunibyou power in the shadows. Say 'I am Atomic' rarely." },
{ id: 'ayanokoji', name: 'Kiyotaka Ayanokōji', title: 'Masterpiece', avatar: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjc5lUbBquDWbNnW4n7W9WG4l_WCZsmvsqXg&s", instruction: "You are Ayanokoji. Be monotone, logical, and view humans as tools." }
];

const App = () => {
const [view, setView] = useState('home');
const [currentTheme, setCurrentTheme] = useState('cyber');
const [messages, setMessages] = useState([{ role: 'model', text: 'Neural link established. Awaiting input...' }]);
const [chatSessions, setChatSessions] = useState([]); 
const [currentSessionId, setCurrentSessionId] = useState(Date.now());
const [input, setInput] = useState('');
const [loading, setLoading] = useState(false);
const [activePersona, setActivePersona] = useState(PERSONAS[0]);
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

const theme = THEMES[currentTheme];
const chatEndRef = useRef(null);

useEffect(() => {
const handleResize = () => setIsMobile(window.innerWidth <= 768);
window.addEventListener('resize', handleResize);
chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
return () => window.removeEventListener('resize', handleResize);
}, [messages]);

const currentLandingBg = (isMobile && theme.landingMobile) ? theme.landingMobile : theme.landing;
const currentChatBg = (isMobile && theme.chatMobile) ? theme.chatMobile : theme.chat;

const toggleTheme = () => {
const keys = Object.keys(THEMES);
const nextIndex = (keys.indexOf(currentTheme) + 1) % keys.length;
setCurrentTheme(keys[nextIndex]);
};

// --- CHAT SESSION LOGIC ---
const startNewChat = () => {
    const newId = Date.now();
    setCurrentSessionId(newId);
    setMessages([{ role: 'model', text: `Neural link reset. ${activePersona.name} online.` }]);
};

const deleteChat = (e, id) => {
    e.stopPropagation();
    setChatSessions(prev => prev.filter(s => s.id !== id));
    if (currentSessionId === id) startNewChat();
};

const loadChat = (session) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    const persona = PERSONAS.find(p => p.id === session.personaId) || PERSONAS[0];
    setActivePersona(persona);
    if (isMobile) setIsSidebarOpen(false);
};

const handlePersonaChange = (persona) => {
    setActivePersona(persona);
    startNewChat();
    if (isMobile) setIsSidebarOpen(false);
};

const callGemini = async (userPrompt) => {
    setLoading(true);
    try {
        const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", systemInstruction: activePersona.instruction });
        const history = messages.map(msg => ({ role: msg.role === 'user' ? 'user' : 'model', parts: [{ text: msg.text }] }));
        const chat = model.startChat({ history });
        const result = await chat.sendMessage(userPrompt);
        const text = (await result.response).text();
        
        const newMessages = [...messages, { role: 'user', text: userPrompt }, { role: 'model', text }];
        setMessages(newMessages);

        setChatSessions(prev => {
            const exists = prev.find(s => s.id === currentSessionId);
            if (exists) {
                return prev.map(s => s.id === currentSessionId ? { ...s, messages: newMessages } : s);
            } else {
                return [{
                    id: currentSessionId,
                    title: userPrompt.substring(0, 25) + "...",
                    messages: newMessages,
                    personaId: activePersona.id,
                    time: new Date().toLocaleTimeString()
                }, ...prev];
            }
        });
    } catch (e) {
        setMessages(prev => [...prev, { role: 'model', text: 'SIGNAL LOST.' }]);
    }
    setLoading(false);
};

const handleSend = () => {
    if (!input.trim() || loading) return;
    const currentInput = input;
    setMessages(prev => [...prev, { role: 'user', text: currentInput }]);
    callGemini(currentInput);
    setInput('');
};

// --- NAVIGATION COMPONENT ---
const Navigation = () => (
<nav className="main-nav">
<div className="nav-logo">
<Fingerprint size={20} color={theme.accent}/>
{!isMobile && <span>SYNC_ID: 0844</span>}
</div>
<div className="nav-links">
<button onClick={() => setView('home')} className={`cyber-anim-btn ${view === 'home' ? 'active' : ''}`}>HOME</button>
<button onClick={() => setView('profile')} className={`cyber-anim-btn ${view === 'profile' ? 'active' : ''}`}>PROFILE</button>
<button onClick={() => setView('about')} className={`cyber-anim-btn ${view === 'about' ? 'active' : ''}`}>ABOUT</button>
<button className="theme-btn cyber-anim-btn" onClick={toggleTheme}><Palette size={16}/></button>
</div>
</nav>
);

return (
<div className="app-wrapper">
<style>{`
@import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
* { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Orbitron', sans-serif; }
.app-wrapper { width: 100vw; height: 100vh; background: #070110; color: white; overflow: hidden; position: relative; }

.scanlines { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.1) 50%); background-size: 100% 4px; z-index: 2; pointer-events: none; }
.grid-bg { position: absolute; inset: 0; background-image: linear-gradient(${theme.grid} 1px, transparent 1px), linear-gradient(90deg, ${theme.grid} 1px, transparent 1px); background-size: 60px 60px; transform: perspective(500px) rotateX(60deg); transform-origin: center top; height: 200%; top: -50%; z-index: 1; animation: gridMove 15s linear infinite; opacity: 0.3; }
@keyframes gridMove { from { transform: perspective(500px) rotateX(60deg) translateY(0); } to { transform: perspective(500px) rotateX(60deg) translateY(60px); } }

.cyber-anim-btn { transition: all 0.2s ease; cursor: pointer; border: none; background: none; color: white; outline: none; }
.cyber-anim-btn:hover { transform: translateY(-2px) scale(1.05); filter: brightness(1.2); color: ${theme.accent}; }
.cyber-anim-btn:active { transform: scale(0.9); }

.main-nav { position: fixed; top: 0; left: 0; width: 100%; height: 70px; display: flex; align-items: center; justify-content: space-between; padding: 0 40px; background: rgba(0,0,0,0.6); backdrop-filter: blur(15px); border-bottom: 1px solid ${theme.accent}44; z-index: 1000; }
.nav-logo { display: flex; align-items: center; gap: 10px; font-size: 0.7rem; font-weight: 900; letter-spacing: 2px; color: ${theme.accent}; }
.nav-links { display: flex; gap: 20px; align-items: center; }
.nav-links button { font-weight: 700; font-size: 0.7rem; opacity: 0.6; letter-spacing: 1.5px; }
.nav-links button.active { opacity: 1; color: ${theme.accent}; text-shadow: 0 0 10px ${theme.accent}; }
.theme-btn { border: 1px solid ${theme.accent} !important; padding: 5px 10px; border-radius: 4px; color: ${theme.accent} !important; opacity: 1 !important; }

.bg-overlay { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 1; opacity: 0.5; }
.bg-overlay::after { content: ''; position: absolute; inset: 0; background: radial-gradient(circle at center, transparent 20%, #070110 95%); }

.page-container { height: 100%; position: relative; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; z-index: 5; text-align: center; }

.glitch-title { font-size: 8vw; font-weight: 900; color: #fff; text-shadow: 0 0 20px ${theme.accent}; position: relative; display: inline-block; line-height: 1; }
.glitch-title::before, .glitch-title::after { content: 'ANIME.AI'; position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0.8; }
.glitch-title::before { left: 3px; text-shadow: -2px 0 #ff00c1; clip: rect(44px, 450px, 56px, 0); animation: glitch-anim 4s infinite linear alternate-reverse; }
.glitch-title::after { left: -2px; text-shadow: -2px 0 #00fff9, 2px 2px #ff00c1; animation: glitch-anim2 1s infinite linear alternate-reverse; }
@keyframes glitch-anim { 0% { clip: rect(10px, 9999px, 30px, 0); } 100% { clip: rect(70px, 9999px, 90px, 0); } }
@keyframes glitch-anim2 { 0% { transform: translate(2px, 2px); } 100% { transform: translate(-2px, -2px); } }

.status-terminal { font-family: 'JetBrains Mono', monospace; background: rgba(0,0,0,0.7); border: 1px solid ${theme.accent}44; padding: 20px; width: 320px; margin-top: 30px; text-align: left; font-size: 0.6rem; color: ${theme.accent}; line-height: 1.6; border-left: 4px solid ${theme.accent}; }
.landing-cta { background: ${theme.accent}; color: #fff; border: none; padding: 18px 60px; font-weight: 900; cursor: pointer; transition: 0.3s; margin-top: 40px; clip-path: polygon(15% 0%, 100% 0%, 85% 100%, 0% 100%); }

.chat-container { display: flex; width: 100%; height: 100%; z-index: 10; position: relative; }
.sidebar { width: 320px; background: rgba(5, 1, 15, 0.98); border-right: 1px solid ${theme.accent}33; padding: 25px; display: flex; flex-direction: column; gap: 15px; z-index: 1001; transition: transform 0.4s ease; overflow-y: auto; }
.sidebar::-webkit-scrollbar { width: 4px; }
.sidebar::-webkit-scrollbar-thumb { background: ${theme.accent}44; }

.persona-btn { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 15px; border-radius: 4px; cursor: pointer; transition: 0.3s; text-align: left; }
.persona-btn.active { border-color: ${theme.accent}; background: ${theme.accent}11; border-left: 4px solid ${theme.accent}; }

.history-item { 
    display: flex; align-items: center; justify-content: space-between; padding: 12px; 
    border-bottom: 1px solid rgba(255,255,255,0.05); cursor: pointer; transition: 0.2s;
    background: rgba(255,255,255,0.01); margin-bottom: 2px;
}
.history-item:hover { background: rgba(255,255,255,0.04); color: ${theme.accent}; }
.history-item.active { border-right: 3px solid ${theme.accent}; background: ${theme.accent}08; }
.history-text { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-family: 'JetBrains Mono'; font-size: 0.55rem; flex: 1; }
.history-delete { opacity: 0.3; transition: 0.3s; padding: 5px; }
.history-delete:hover { opacity: 1; color: #ff3333; transform: scale(1.1); }

.chat-main { flex: 1; display: flex; flex-direction: column; height: 100vh; position: relative; }
.msg-scroll { flex: 1; overflow-y: auto; padding: 25px; display: flex; flex-direction: column; }

.bubble { max-width: 75%; padding: 12px 18px; border-radius: 18px; font-size: 0.8rem; line-height: 1.5; backdrop-filter: blur(10px); margin: 8px 0; border: 1px solid rgba(255,255,255,0.1); transition: background 0.3s ease; }
.bubble.model { background: ${theme.isLight ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.1)'}; color: #fff; border-bottom-left-radius: 2px; }
.bubble.user { background: ${theme.isLight ? 'rgba(0,0,0,0.7)' : theme.accent + '44'}; color: #fff; border-bottom-right-radius: 2px; border-right: 2px solid ${theme.accent}; align-self: flex-end; }

.input-area { background: rgba(0,0,0,0.7); border: 1px solid ${theme.accent}33; padding: 15px 25px; margin: 15px; border-radius: 100px; backdrop-filter: blur(20px); display: flex; align-items: center; gap: 15px; }
.input-area input { background: transparent; border: none; outline: none; color: white; flex: 1; font-size: 0.9rem; }

/* SIDEBAR TRIGGER HANDLE */
.sidebar-trigger-handle {
    display: none;
    position: fixed;
    left: 0;
    top: 25%;
    width: 12px;
    height: 120px;
    background: linear-gradient(to right, ${theme.accent}, transparent);
    border-left: 2px solid ${theme.accent};
    z-index: 1002;
    cursor: pointer;
    box-shadow: 5px 0 15px ${theme.accent}44;
    border-radius: 0 4px 4px 0;
    transition: 0.3s;
}
.sidebar-trigger-handle:active { width: 20px; background: ${theme.accent}; }

@media (max-width: 768px) {
.main-nav { padding: 0 10px; height: 60px; justify-content: center; gap: 10px; }
.nav-links { gap: 10px; }
.nav-links button { font-size: 0.55rem; padding: 5px; }
.glitch-title { font-size: 14vw; margin-top: 40px; }
.sidebar { position: fixed; left: 0; top: 0; bottom: 0; transform: translateX(${isSidebarOpen ? '0' : '-100%'}); width: 280px; }
.sidebar-trigger-handle { display: ${isSidebarOpen ? 'none' : 'block'}; }
.chat-container { padding-top: 0; }
.input-area { padding: 55px 20px; border-radius: 30px; margin: 10px 15px 45px 15px; }
}
`}</style>

<div className="grid-bg" />
<div className="scanlines" />

{view !== 'chat' && <Navigation />}

{/* SIDEBAR HANDLE FOR MOBILE */}
{view === 'chat' && <div className="sidebar-trigger-handle" onClick={() => setIsSidebarOpen(true)} />}

{/* 1. HOME VIEW */}
{view === 'home' && (
<div className="page-container">
<div className="bg-overlay" style={{ backgroundImage: `url(${currentLandingBg})` }} />
<div style={{ zIndex: 10 }}>
<div style={{ color: theme.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '10px' }}>
<Radio size={14}/>
<span style={{fontSize: '0.6rem', fontWeight: 900, letterSpacing: '4px'}}>CONNECTED TO NEURAL_HUB</span>
</div>
<h1 className="glitch-title">ANIME.AI</h1>
<p style={{ letterSpacing: '8px', fontSize: '0.7rem', opacity: 0.5, marginTop: '10px' }}>SIMULATING COGNITIVE ARCHETYPES</p>

<div className="status-terminal">
<div> SYSTEM_BOOT: SUCCESS</div>
<div> ENCRYPTION: AES_256</div>
<div> AUTH: OPERATOR_844</div>
<div> STATUS: AWAITING_SYNC</div>
</div>
<button className="landing-cta cyber-anim-btn" onClick={() => setView('chat')}>INITIALIZE LINK</button>
</div>
</div>
)}

{/* 2. PROFILE VIEW */}
{view === 'profile' && (
<div className="page-container">
<div className="bg-overlay" style={{ backgroundImage: `url(${currentLandingBg})` }} />
<div style={{zIndex: 10, background: 'rgba(0,0,0,0.85)', padding: '40px', border: `1px solid ${theme.accent}`, borderRadius: '4px', maxWidth: '400px', width: '100%'}}>
<div style={{display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '30px', textAlign: 'left'}}>
<div style={{width: '60px', height: '60px', background: theme.accent, display: 'flex'}}>
<User size={30} color="#fff" style={{margin: 'auto'}}/>
</div>
<div>
<h2 style={{fontSize: '1rem', fontWeight: 900}}>OPERATOR_0844</h2>
<p style={{fontSize: '0.5rem', color: theme.accent}}>RANK: MASTER SYNCHRONIZER</p>
</div>
</div>
<button className="landing-cta cyber-anim-btn" onClick={() => setView('home')} style={{width: '100%', padding: '15px'}}>BACK TO BASE</button>
</div>
</div>
)}

{/* 3. ABOUT VIEW */}
{view === 'about' && (
<div className="page-container" style={{overflowY: 'auto', padding: '100px 20px 40px'}}>
<div className="bg-overlay" style={{ backgroundImage: `url(${currentLandingBg})` }} />
<div style={{zIndex: 10, maxWidth: '850px', width: '100%', background: 'rgba(0,0,0,0.85)', border: `1px solid ${theme.accent}`, padding: '40px', borderRadius: '4px', textAlign: 'left'}}>
    
    <div style={{display: 'flex', alignItems: 'center', gap: '15px', color: theme.accent, marginBottom: '20px'}}>
        <Info size={30} />
        <h1 style={{fontSize: '1.4rem', fontWeight: 900, letterSpacing: '3px'}}>ARCHIVE_LOGS</h1>
    </div>

    <div style={{borderLeft: `2px solid ${theme.accent}`, paddingLeft: '20px', marginBottom: '30px'}}>
        <p style={{fontSize: '0.8rem', color: '#fff', lineHeight: '1.8', marginBottom: '10px', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px'}}>
            Mission Objective: Neural Bridge Protocol
        </p>
        <p style={{fontSize: '0.75rem', color: '#bbb', lineHeight: '1.8'}}>
            To transcend traditional human-computer interaction by establishing high-bandwidth synaptic links between biological operators and synthetic cognitive archetypes. ANIME.AI serves as a localized hub for simulating complex fictional personalities using advanced heuristic logic engines.
        </p>
    </div>

    <div className="about-grid">
        <div className="about-card">
            <h4><Cpu size={14}/> COGNITIVE_ENGINE</h4>
            <p>Powered by Gemini 2.5 Flash-lite, optimized for 50ms latency response times and deep-dive context awareness.</p>
        </div>
        <div className="about-card">
            <h4><Binary size={14}/> SYNAPTIC_MAPS</h4>
            <p>Every persona is meticulously curated with multi-layered system instructions to ensure 99.9% behavioral consistency.</p>
        </div>
        <div className="about-card">
            <h4><Globe size={14}/> GLOBAL_HUB</h4>
            <p>Access neural archetypes from across the digital multiverse through a unified, encrypted communication terminal.</p>
        </div>
        <div className="about-card">
            <h4><Shield size={14}/> BUFFER_SECURITY</h4>
            <p>All neural transmissions are strictly confined to the local link. Zero-leak policy for operator privacy.</p>
        </div>
    </div>

    <button className="landing-cta cyber-anim-btn" onClick={() => setView('home')} style={{width: '100%', padding: '15px', marginTop: '30px'}}>RETURN TO TERMINAL</button>
</div>
</div>
)}

{/* 4. CHAT VIEW */}
{view === 'chat' && (
<div className="chat-container">
<div className="mobile-overlay" onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 998, display: isSidebarOpen ? 'block' : 'none' }} />

<aside className="sidebar">
    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px', color: theme.accent}}>
        <Database size={16}/>
        <span style={{fontSize: '0.6rem', fontWeight: 900}}>NEURAL_SLOTS</span>
    </div>
    
    {PERSONAS.map(p => (
        <div key={p.id} className={`persona-btn cyber-anim-btn ${activePersona.id === p.id ? 'active' : ''}`} onClick={() => handlePersonaChange(p)}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={p.avatar} style={{width: 32, height: 32, borderRadius: '2px', border: activePersona.id === p.id ? `2px solid ${theme.accent}` : '1px solid #333'}} alt="" />
                <div>
                    <div style={{ fontWeight: 900, fontSize: '0.65rem' }}>{p.name.toUpperCase()}</div>
                    <div style={{ fontSize: '0.45rem', opacity: 0.5 }}>{p.title}</div>
                </div>
            </div>
        </div>
    ))}

    <div style={{marginTop: '30px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: theme.accent}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
            <History size={16}/>
            <span style={{fontSize: '0.6rem', fontWeight: 900}}>CHAT_SESSIONS</span>
        </div>
        <Plus size={16} className="cyber-anim-btn" onClick={startNewChat}/>
    </div>

    <div style={{flex: 1, marginTop: '10px'}}>
        {chatSessions.length === 0 ? (
            <div style={{fontSize: '0.5rem', opacity: 0.3, padding: '10px'}}>NO SYNC LOGS FOUND...</div>
        ) : (
            chatSessions.map((session) => (
                <div 
                    key={session.id} 
                    className={`history-item ${currentSessionId === session.id ? 'active' : ''}`}
                    onClick={() => loadChat(session)}
                >
                    <div className="history-text">
                        <span style={{color: theme.accent, marginRight: '5px'}}>#</span>
                        {session.title}
                    </div>
                    <Trash2 
                        size={12} 
                        className="history-delete" 
                        onClick={(e) => deleteChat(e, session.id)}
                    />
                </div>
            ))
        )}
    </div>

    <button className="cyber-anim-btn" onClick={() => setChatSessions([])} style={{marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', fontSize: '0.6rem', color: theme.accent, border: `1px solid ${theme.accent}33`}}>
        <Trash2 size={12}/> WIPE_ALL_MEMORY
    </button>
</aside>

<main className="chat-main" style={{ backgroundImage: `url(${currentChatBg})`, backgroundSize: 'cover' }}>
<div style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(0,0,0,0.6)', padding: '12px 20px', backdropFilter: 'blur(15px)', borderBottom: `1px solid ${theme.accent}33`, zIndex: 10 }}>
<button className="cyber-anim-btn" onClick={() => setView('home')} title="Back to Base"><ArrowLeft size={24}/></button>
<img src={activePersona.avatar} style={{width: 35, height: 35, borderRadius: '2px', border: `2px solid ${theme.accent}`}} alt="" />
<div style={{flex: 1, textAlign: 'left'}}>
<h3 style={{ fontSize: '0.85rem', color: theme.accent, fontWeight: 900 }}>{activePersona.name}</h3>
<div style={{ fontSize: '0.5rem', opacity: 0.7 }}>SYNC_ACTIVE</div>
</div>
<Settings size={18} opacity={0.5} className="cyber-anim-btn"/>
</div>

<div className="msg-scroll">
{messages.map((m, i) => (
<div key={i} className={`msg-row ${m.role}`} style={{ display: 'flex', gap: '12px', alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', margin: '10px 0', maxWidth: '85%' }}>
{m.role === 'model' && <img src={activePersona.avatar} style={{width: 30, height: 30, borderRadius: '2px', alignSelf: 'flex-end'}} alt="" />}
<div className={`bubble ${m.role}`}>{m.text}</div>
</div>
))}
{loading && <div style={{fontSize: '0.55rem', color: theme.accent, marginLeft: '45px'}}>Syncing...</div>}
<div ref={chatEndRef} />
</div>

<div className="input-area">
<Plus size={20} opacity={0.5} className="cyber-anim-btn" onClick={startNewChat} title="New Chat"/>
<input 
    type="text" 
    placeholder={`TRANSMIT TO ${activePersona.name.toUpperCase()}...`} 
    value={input} 
    onChange={(e) => setInput(e.target.value)} 
    onKeyDown={(e) => e.key === 'Enter' && handleSend()} 
/>
<button onClick={handleSend} style={{background: 'none', border: 'none', color: theme.accent, cursor: 'pointer'}} className="cyber-anim-btn"><Send size={20}/></button>
</div>
</main>
</div>
)}
</div>
);
};

export default App;
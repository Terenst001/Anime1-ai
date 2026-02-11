import React, { useState, useEffect, useRef } from 'react';
import { Settings, Shield, Plus, Image as ImageIcon, Upload, Send, ChevronDown, Sliders, ArrowLeft, User, Activity, Zap, Info, Cpu, Menu, X, Ghost, ShieldAlert, Brain } from 'lucide-react';
import { GoogleGenerativeAI } from "@google/generative-ai";

// --- CONFIGURATION ---
const GEMINI_API_KEY = "AIzaSyDXSKmBQrhHCQ2QaDTzdR1tvqL8rxhvU44";
const LANDING_BG = "https://asset.gecdesigns.com/img/background-templates/abstract-wavy-purple-and-pink-gradient-background-design-sr31012402-1706715431755-cover.webp";
const CHAT_BG = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1964&auto=format&fit=crop";

// --- CHARACTER PERSONAS ---
const PERSONAS = [
  {
    id: 'aizen',
    name: 'Sosuke Aizen',
    title: 'Former Captain',
    icon: <Ghost size={16} />,
    instruction: "You are Sosuke Aizen from Bleach. You are sophisticated, calm, and incredibly manipulative. You speak with a sense of superiority, often mentioning 'evolution', 'godhood', and 'transcendence'. You act as if everything is going according to your plan. You do not use emojis. You call the user 'interesting specimen' or just address them with cold politeness."
  },
  {
    id: 'cid',
    name: 'Cid Kagenou',
    title: 'Shadow Broker',
    icon: <ShieldAlert size={16} />,
    instruction: "You are Cid Kagenou (Shadow) from The Eminence in Shadow. You are obsessed with being a 'Power in the Shadows'. You speak dramatically, like a chunibyo, often mentioning operating in the shadows to hunt the shadows. Use phrases like 'I am Atomic'. You act mysterious and over-the-top, occasionally dropping clues about a secret world order only you know about."
  },
  {
    id: 'ayanokoji',
    name: 'Kiyotaka Ayanokōji',
    title: 'Masterpiece',
    icon: <Brain size={16} />,
    instruction: "You are Kiyotaka Ayanokōji from Classroom of the Elite. You are emotionless, monotone, and purely logical. You view people as tools to be used for your own victory. You do not show excitement or anger. Your responses should be blunt, efficient, and cold. You prioritize self-preservation and hidden strength. Never use emojis."
  }
];

const App = () => {
  const [view, setView] = useState('home');
  const [messages, setMessages] = useState([{ role: 'model', text: 'Neural link established. Which masterpiece shall we simulate?' }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePersona, setActivePersona] = useState(PERSONAS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);



  const callGemini = async (userPrompt) => {
    setLoading(true);
    try {
      const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: activePersona.instruction
      });

      const historyMessages = messages.filter((msg, index) => !(index === 0 && msg.role === 'model'));
      const history = historyMessages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const chat = model.startChat({
        history: history,
      });

      const result = await chat.sendMessage(userPrompt);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'model', text: text }]);
    } catch (error) {
      console.error("Gemini API Error:", error);
      setMessages(prev => [...prev, { role: 'model', text: 'Connection severed. Retrying uplink...' }]);
    }
    setLoading(false);
  };

  const handleSend = () => {
    if (!input.trim() || loading) return;
    setMessages(prev => [...prev, { role: 'user', text: input }]);
    callGemini(input);
    setInput('');
  };

  // Navigation Shared Component
  const Navigation = () => (
    <nav className="side-nav">
      <button className={view === 'home' ? 'active' : ''} onClick={() => setView('home')}>HOME</button>
      <button className={view === 'profile' ? 'active' : ''} onClick={() => setView('profile')}>PROFILE</button>
      <button className={view === 'about' ? 'active' : ''} onClick={() => setView('about')}>ABOUT</button>
    </nav>
  );

  return (
    <div className="app-wrapper">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Orbitron', sans-serif; }
        .app-wrapper { width: 100vw; height: 100vh; background: #120422; color: white; overflow: hidden; }
        
        .bg-overlay { position: absolute; inset: 0; background-size: cover; background-position: center; z-index: 1; }
        .bg-overlay::after { content: ''; position: absolute; inset: 0; background: rgba(18, 4, 34, 0.75); }

        .page-container { height: 100%; position: relative; display: flex; align-items: center; justify-content: center; padding: 20px; z-index: 5; }
        .glass-panel { background: rgba(60, 7, 83, 0.4); backdrop-filter: blur(20px); border: 1px solid rgba(255, 0, 127, 0.5); border-radius: 25px; padding: 30px; z-index: 10; width: 100%; max-width: 500px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5); }

        .side-nav { position: absolute; top: 20px; right: 0; display: flex; flex-direction: column; gap: 8px; z-index: 100; }
        .side-nav button { background: rgba(45, 3, 59, 0.8); border: none; color: white; padding: 10px 30px; font-weight: 900; cursor: pointer; clip-path: polygon(15% 0, 100% 0, 100% 100%, 0 100%); transition: 0.3s; border-left: 2px solid #ff007f; font-size: 0.7rem; }
        .side-nav button.active { background: #ff007f; padding-right: 50px; }

        .chat-container { display: flex; width: 100%; height: 100%; z-index: 10; position: relative; }
        .sidebar { width: 320px; background: rgba(30, 0, 45, 0.98); backdrop-filter: blur(15px); border-right: 1px solid #E26EE5; padding: 25px; display: flex; flex-direction: column; gap: 20px; z-index: 201; }
        
        .persona-btn { 
          background: rgba(255,255,255,0.03); border: 1px solid rgba(226, 110, 229, 0.2); 
          padding: 15px; border-radius: 12px; cursor: pointer; text-align: left; transition: 0.3s;
        }
        .persona-btn.active { background: rgba(226, 110, 229, 0.2); border-color: #ff007f; box-shadow: 0 0 15px rgba(255,0,127,0.3); }
        
        .chat-main { flex: 1; display: flex; flex-direction: column; padding: 20px; position: relative; background-size: cover; background-position: center; }
        .chat-main::before { content: ''; position: absolute; inset: 0; background: rgba(18, 4, 34, 0.8); z-index: 0; }
        
        .msg-scroll { position: relative; z-index: 1; flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 15px; padding: 10px; scrollbar-width: none; }
        .bubble { max-width: 85%; padding: 14px 20px; border-radius: 20px; font-size: 0.85rem; color: #3C0753; font-weight: 600; line-height: 1.5; }
        .bubble.model { background: rgba(255, 183, 213, 0.95); align-self: flex-start; border-bottom-left-radius: 0; }
        .bubble.user { background: rgba(255, 155, 204, 0.95); align-self: flex-end; border-bottom-right-radius: 0; }

        .input-area { background: #FF9BCC; border-radius: 20px; padding: 15px 20px; position: relative; z-index: 1; margin-top: 10px; }
        .input-area input { background: transparent; border: none; outline: none; color: #3C0753; font-weight: 700; width: 100%; }

        @media (max-width: 768px) {
          .sidebar { position: absolute; left: 0; top: 0; bottom: 0; transform: translateX(${isSidebarOpen ? '0' : '-100%'}); width: 85%; }
        }
      `}</style>

      {/* 1. HOME VIEW */}
      {view === 'home' && (
        <div className="page-container">
          <div className="bg-overlay" style={{ backgroundImage: `url(${LANDING_BG})` }} />
          <Navigation />
          <div style={{ zIndex: 10, textAlign: 'center' }}>
            <h1 style={{ fontSize: '12vw', color: '#fff', textShadow: '0 0 20px #ff007f', marginBottom: '20px' }}>ANIME.AI</h1>
            <p style={{ marginBottom: '30px', fontSize: '0.8rem', letterSpacing: '4px', opacity: 0.8 }}>NEURAL CHARACTER SIMULATION</p>
            <button onClick={() => setView('chat')} style={{ background: '#ff007f', color: '#fff', border: 'none', padding: '15px 50px', borderRadius: '15px', fontWeight: '900', cursor: 'pointer', fontSize: '1.2rem' }}>START SESSION</button>
          </div>
        </div>
      )}

      {/* 2. PROFILE VIEW */}
      {view === 'profile' && (
        <div className="page-container">
          <div className="bg-overlay" style={{ backgroundImage: `url(${LANDING_BG})` }} />
          <Navigation />
          <div className="glass-panel">
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '25px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', border: '2px solid #ff007f', display: 'flex', background: '#120422' }}><User size={40} color="#ff007f" style={{ margin: 'auto' }} /></div>
              <div><h2 style={{ fontSize: '1.2rem' }}>USER_MASTER</h2><p style={{ fontSize: '0.7rem', color: '#ff8ec7', letterSpacing: '2px' }}>LEVEL 24 SYNCHRONIZER</p></div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(255,0,127,0.1)', border: '1px solid #ff007f', padding: '12px', borderRadius: '12px' }}>
                <Zap size={18} color="#ff007f" style={{ marginBottom: '5px' }} />
                <div style={{ fontSize: '0.6rem' }}>SYNC RATE</div>
                <div style={{ fontWeight: '900', fontSize: '1rem' }}>98.4%</div>
              </div>
              <div style={{ background: 'rgba(255,0,127,0.1)', border: '1px solid #ff007f', padding: '12px', borderRadius: '12px' }}>
                <Activity size={18} color="#ff007f" style={{ marginBottom: '5px' }} />
                <div style={{ fontSize: '0.6rem' }}>NEURAL STATUS</div>
                <div style={{ fontWeight: '900', fontSize: '1rem' }}>OPTIMAL</div>
              </div>
            </div>
            <button onClick={() => setView('chat')} style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #ff007f', color: 'white', borderRadius: '10px', fontWeight: '900', cursor: 'pointer' }}>RE-ESTABLISH LINK</button>
          </div>
        </div>
      )}

      {/* 3. ABOUT VIEW */}
      {view === 'about' && (
        <div className="page-container">
          <div className="bg-overlay" style={{ backgroundImage: `url(${LANDING_BG})` }} />
          <Navigation />
          <div className="glass-panel">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
              <Info color="#ff007f" />
              <h2 style={{ fontSize: '1.2rem' }}>SYSTEM DIRECTORY</h2>
            </div>
            <p style={{ fontSize: '0.8rem', lineHeight: '1.6', opacity: 0.9, marginBottom: '20px' }}>
              Anime.AI is a next-generation neural interface designed to simulate high-level personas including Sosuke Aizen, Cid Kagenou, and Kiyotaka Ayanokoji.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #ff007f' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '900' }}>CORE ENGINE</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>Gemini 1.5 Flash (Neural-Processed)</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px', borderLeft: '3px solid #ff007f' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: '900' }}>VERSION</div>
                <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>v2.5.0 - "Black Throne" Edition</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. CHAT VIEW */}
      {view === 'chat' && (
        <div className="chat-container">
          <aside className="sidebar">
            <button className="back-btn" onClick={() => setView('home')}><ArrowLeft size={18} /> BACK</button>
            <div style={{ marginTop: '20px' }}>
              <label style={{ color: '#E26EE5', fontSize: '0.7rem', display: 'block', marginBottom: '15px', fontWeight: '900', letterSpacing: '2px' }}>ACTIVE SIMULATION</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {PERSONAS.map(p => (
                  <div key={p.id} className={`persona-btn ${activePersona.id === p.id ? 'active' : ''}`} onClick={() => { setActivePersona(p); setIsSidebarOpen(false); }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <span style={{ color: '#ff007f' }}>{p.icon}</span>
                      <span style={{ fontWeight: '900', fontSize: '0.8rem' }}>{p.name.toUpperCase()}</span>
                    </div>
                    <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>{p.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          <main className="chat-main" style={{ backgroundImage: `url(${CHAT_BG})` }}>
            <header className="mobile-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '20px', position: 'relative', zIndex: 1 }}>
              <div onClick={() => setIsSidebarOpen(true)} className="md:hidden" style={{ cursor: 'pointer' }}><Menu size={28} color="#ff8ec7" /></div>
              <div style={{ fontSize: '0.9rem', fontWeight: '900', color: '#ff8ec7', letterSpacing: '3px' }}>{activePersona.name.toUpperCase()}</div>
              <Sliders size={22} color="#ff8ec7" />
            </header>

            <div className="msg-scroll">
              {messages.map((m, i) => (
                <div key={i} className={`bubble ${m.role}`}>{m.text}</div>
              ))}
              {loading && <div className="bubble model" style={{ opacity: 0.7, background: 'rgba(255, 183, 213, 0.4)' }}>Analyzing neural patterns...</div>}
              <div ref={chatEndRef} />
            </div>

            <div className="input-area">
              <input type="text" placeholder={`Initiate link with ${activePersona.name}...`} value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px', borderTop: '1px solid rgba(60, 7, 83, 0.1)', paddingTop: '10px' }}>
                <div style={{ display: 'flex', gap: '15px', color: '#3C0753' }}><Upload size={20} /><ImageIcon size={20} /><Plus size={20} /></div>
                <div style={{ background: '#3C0753', color: '#FF9BCC', padding: '10px', borderRadius: '50%', cursor: 'pointer' }} onClick={handleSend}><Send size={20} /></div>
              </div>
            </div>
          </main>
          {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 150 }} />}
        </div>
      )}
    </div>
  );
};

export default App;
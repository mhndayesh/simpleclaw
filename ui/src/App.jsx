import React, { useState, useEffect, useRef } from 'react';
import { Send, Settings, MessageSquare, Shield, Activity, Save, RefreshCw, Cpu, Layers, PlusCircle } from 'lucide-react';
import axios from 'axios';
import SetupWizard from './components/SetupWizard.jsx';

const App = () => {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [usage, setUsage] = useState({ inputTokens: 0, outputTokens: 0, totalTokens: 0 });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState([]);
  const [config, setConfig] = useState({ primary: null, fallback: null });
  const [status, setStatus] = useState('Checking connectivity...');
  const [mode, setMode] = useState(localStorage.getItem('simpleclaw-mode') || 'super-eco');
  const [manualMode, setManualMode] = useState({ primary: false, fallback: false });
  const [secrets, setSecrets] = useState({ openrouter: '', hf: '' });
  const [saveStatus, setSaveStatus] = useState('');
  const [isSetup, setIsSetup] = useState(null); // null = checking, false = show wizard
  console.log('App initialization - isSetup:', isSetup);
  const scrollRef = useRef(null);

  useEffect(() => {
    const checkSetup = async () => {
      try {
        const res = await axios.get('/api/setup-status');
        setIsSetup(res.data.isSetup);
      } catch (err) {
        setIsSetup(true); // Default to true if server fails to avoid blocking
      }
    };
    checkSetup();
    fetchModels();
    fetchConfig();
    fetchSecrets();
    // restore session and mode from server
    const fetchSession = async () => {
      try {
        const res = await axios.get('/api/session', { params: { session: 'default' } });
        if (res.data?.history) setMessages(res.data.history);
        if (res.data?.mode) { setMode(res.data.mode); localStorage.setItem('simpleclaw-mode', res.data.mode); setStatus(`${res.data.mode} mode active`); }
        if (res.data?.usage) setUsage(res.data.usage);
      } catch (e) { /* ignore */ }
    };
    fetchSession();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const commands = [
    { label: '🟢 Super Eco', value: 'switch to super eco mode' },
    { label: '🔵 Standard', value: 'switch to standard mode' },
    { label: '🔴 Full Context', value: 'switch to full mode' },
  ];

  const handleCommand = (cmd) => {
    setInput(cmd);
    sendMessage(null, cmd);
  };

  const fetchModels = async () => {
    try {
      const res = await axios.get('/api/models');
      setModels(res.data);
      setStatus('System Ready');
    } catch (err) {
      setStatus('Backend Offline');
    }
  };

  const fetchSecrets = async () => {
    try {
      const res = await axios.get('/api/secrets');
      setSecrets(res.data);
    } catch (err) { }
  };

  const fetchConfig = async () => {
    try {
      const res = await axios.get('/api/config');
      setConfig(res.data);
    } catch (err) { }
  };

  const saveSecrets = async () => {
    setSaveStatus('Saving keys...');
    try {
      await axios.post('/api/secrets', secrets);
      setSaveStatus('Keys Saved! Refreshing...');
      setTimeout(() => {
        setSaveStatus('');
        fetchModels();
        fetchSecrets();
      }, 2000);
    } catch (err) {
      setSaveStatus('Error saving keys');
    }
  };

  const sendMessage = async (e, overrideQuery = null) => {
    e?.preventDefault();
    const queryTerm = overrideQuery || input;
    if (!queryTerm.trim() || loading) return;

    const userMsg = { role: 'user', content: queryTerm };
    setMessages(prev => [...prev, userMsg]);
    if (!overrideQuery) setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chat', { query: queryTerm, session: 'default' });
      setMessages(prev => [...prev, ...res.data.newEvents]);
      if (res.data.usage) setUsage(res.data.usage);
      if (res.data.mode) {
        setMode(res.data.mode);
        localStorage.setItem('simpleclaw-mode', res.data.mode);
      }
    } catch (err) {
      setMessages(prev => [...prev, { role: 'system', content: `Error: ${err.response?.data?.error || err.message}` }]);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (key, provider, modelId) => {
    const newConfig = { ...config, [key]: { model: modelId, provider } };
    setConfig(newConfig);
  };

  const saveConfig = async () => {
    setSaveStatus('Saving config...');
    try {
      await axios.post('/api/config', config);
      setSaveStatus('Config Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      setSaveStatus('Error saving config: ' + (err.response?.data?.error || err.message));
    }
  };

  const providersList = ['ollama', 'openrouter', 'huggingface'];

  const ModelSelector = ({ type }) => {
    const current = config[type] || {};
    const filteredModels = models.filter(m => m.provider === current.provider);

    return (
      <section className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {type === 'primary' ? <Cpu size={18} /> : <Layers size={18} />}
            <h3>{type.charAt(0).toUpperCase() + type.slice(1)} Choice</h3>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              className="btn glass"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              onClick={fetchModels}
              title="Refresh models list"
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button
              className={`btn ${manualMode[type] ? 'btn-primary' : 'glass'}`}
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              onClick={() => setManualMode(prev => ({ ...prev, [type]: !prev[type] }))}
            >
              <PlusCircle size={14} /> {manualMode[type] ? 'Auto' : 'Manual'}
            </button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.4rem', display: 'block' }}>Provider</label>
            <select
              className="glass"
              value={current.provider || ''}
              onChange={(e) => updateConfig(type, e.target.value, '')}
              style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              <option value="">Select Provider</option>
              {providersList.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.4rem', display: 'block' }}>Model ID</label>
            {manualMode[type] ? (
              <input
                type="text"
                className="glass"
                placeholder="e.g. meta/llama-3"
                value={current.model || ''}
                onChange={(e) => updateConfig(type, current.provider, e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}
              />
            ) : (
              <select
                className="glass"
                value={current.model || ''}
                onChange={(e) => updateConfig(type, current.provider, e.target.value)}
                style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                <option value="">Select Model</option>
                {filteredModels.map(m => <option key={m.id} value={m.id}>{m.id}</option>)}
              </select>
            )}
          </div>
        </div>
      </section>
    );
  };

  if (isSetup === false) {
    return <SetupWizard onComplete={() => {
      setIsSetup(true);
      fetchModels();
      fetchConfig();
      fetchSecrets();
    }} />;
  }

  if (isSetup === null) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', color: 'white' }}>
        <div className="fade-in" style={{ textAlign: 'center' }}>
          <Cpu className="spin" size={48} style={{ opacity: 0.5, marginBottom: '1rem' }} />
          <p style={{ opacity: 0.5 }}>Syncing neural link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container fade-in">
      {/* Header */}
      <header className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div className="premium-gradient" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Cpu size={24} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.2rem', color: 'white' }}>SimpleClaw</h1>
            <p style={{ fontSize: '0.8rem', opacity: 0.6 }}>{status}</p>
          </div>
        </div>

        {/* Token Counter */}
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.5rem 1rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', opacity: 0.5, textTransform: 'uppercase' }}>In</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{usage?.inputTokens?.toLocaleString() || 0}</div>
          </div>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', opacity: 0.5, textTransform: 'uppercase' }}>Out</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{usage?.outputTokens?.toLocaleString() || 0}</div>
          </div>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', opacity: 0.5, textTransform: 'uppercase' }}>Total</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'hsl(var(--primary))' }}>{usage?.totalTokens?.toLocaleString() || 0}</div>
          </div>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '0.6rem', opacity: 0.5, textTransform: 'uppercase' }}>Avg</div>
            <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10b981' }}>{usage?.avgTokens?.toLocaleString() || 0}</div>
          </div>
        </div>


        <div>
          <button className="btn btn-warning" onClick={async () => {
            if (!window.confirm('Archive current session and start a new one?')) return;
            try {
              const res = await axios.post('/api/session/new', { session: 'default' });
              setMessages([]);
              const newMode = res.data?.mode || 'super-eco';
              setMode(newMode);
              localStorage.setItem('simpleclaw-mode', newMode);
              setStatus('New session started');
            } catch (err) {
              setMessages(prev => [...prev, { role: 'system', content: `Failed to start new session: ${err.message || err}` }]);
            }
          }} style={{ padding: '0.4rem 0.6rem', borderRadius: '6px' }} title="Archive current session and start a fresh one">
            <PlusCircle size={14} /> New Session
          </button>
        </div>

        <nav style={{ display: 'flex', gap: '0.5rem' }}>
          <button className={`btn ${activeTab === 'chat' ? 'btn-primary' : 'glass'}`} onClick={() => setActiveTab('chat')}>
            <MessageSquare size={18} /> Chat
          </button>
          <button className={`btn ${activeTab === 'settings' ? 'btn-primary' : 'glass'}`} onClick={() => setActiveTab('settings')}>
            <Settings size={18} /> Settings
          </button>
        </nav>
      </header>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', overflow: 'hidden', gap: '1.5rem' }}>
        {activeTab === 'chat' ? (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div ref={scrollRef} className="glass" style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {messages.length === 0 && (
                <div style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', opacity: 0.3 }}>
                  <Activity size={48} />
                  <p style={{ marginTop: '1rem' }}>Initiate neural link to start chatting...</p>
                </div>
              )}
              {messages.map((msg, i) => (
                <div key={i} style={{
                  alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '80%', padding: '1rem', borderRadius: 'var(--radius)',
                  background: msg.role === 'user' ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.05)',
                  color: 'white', fontSize: '0.95rem', lineHeight: '1.5',
                  borderBottomRightRadius: msg.role === 'user' ? '0' : 'var(--radius)',
                  borderBottomLeftRadius: msg.role === 'assistant' ? '0' : 'var(--radius)',
                  opacity: msg.role === 'system' ? 0.6 : 1,
                  fontStyle: msg.role === 'system' ? 'italic' : 'normal',
                }}>
                  <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'inherit' }}>{msg.content}</pre>
                </div>
              ))}
              {loading && <div className="fade-in" style={{ padding: '0.5rem', opacity: 0.5 }}>SimpleClaw is thinking...</div>}
            </div>

            <div style={{ position: 'relative' }}>
              {input.startsWith('/') && (
                <div className="glass fade-in" style={{ position: 'absolute', bottom: '100%', left: 0, width: '100%', marginBottom: '0.5rem', borderRadius: 'var(--radius)', overflow: 'hidden', zIndex: 100, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(20, 20, 20, 0.95)', backdropFilter: 'blur(10px)' }}>
                  {commands.map(cmd => (
                    <div key={cmd.value} onClick={() => handleCommand(cmd.value)} style={{ width: '100%', textAlign: 'left', padding: '0.8rem 1rem', background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', transition: 'background 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                      <span style={{ fontSize: '0.9rem' }}>{cmd.label}</span>
                      <span style={{ fontSize: '0.7rem', opacity: 0.4, marginLeft: 'auto' }}>Prompt Auto-fill</span>
                    </div>
                  ))}
                </div>
              )}
              <form onSubmit={sendMessage} className="glass" style={{ display: 'flex', gap: '1rem', padding: '1rem', borderRadius: 'var(--radius)' }}>
                <input type="text" placeholder="Type / for quick commands..." value={input} onChange={(e) => setInput(e.target.value)}
                  style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'white', padding: '0.5rem', fontSize: '1rem' }}
                />
                <button type="submit" className="btn btn-primary" disabled={loading}><Send size={18} /></button>
              </form>
            </div>
          </div>
        ) : (
          <div className="fade-in" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Shield size={24} /> Neural Configuration</h2>

            <ModelSelector type="primary" />
            <ModelSelector type="fallback" />

            <button className="btn btn-primary" onClick={saveConfig} style={{ width: '100%', justifyContent: 'center', padding: '1.2rem', marginTop: '1rem', fontSize: '1.1rem' }}>
              <Save size={20} /> Save Neural Configuration
            </button>
            {saveStatus && <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'hsl(var(--primary))' }}>{saveStatus}</p>}

            <section className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid rgba(255,255,255,0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <Shield size={18} /> <h3>API Credentials</h3>
              </div>
              <div style={{ display: 'grid', gap: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.4rem', display: 'block' }}>OpenRouter API Key</label>
                  <input
                    type="password"
                    className="glass"
                    placeholder="sk-or-v1-..."
                    value={secrets.openrouter}
                    onChange={(e) => setSecrets(prev => ({ ...prev, openrouter: e.target.value }))}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.4rem', display: 'block' }}>Hugging Face Key</label>
                  <input
                    type="password"
                    className="glass"
                    placeholder="hf_..."
                    value={secrets.hf}
                    onChange={(e) => setSecrets(prev => ({ ...prev, hf: e.target.value }))}
                    style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}
                  />
                </div>
                <button className="btn btn-primary" onClick={saveSecrets} style={{ marginTop: '0.5rem' }}>
                  <Save size={16} /> Save Credentials
                </button>
                {saveStatus && <p style={{ fontSize: '0.8rem', color: 'hsl(var(--primary))' }}>{saveStatus}</p>}
              </div>
            </section>

            <div className="glass" style={{ padding: '1.5rem', borderRadius: 'var(--radius)', opacity: 0.7 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <RefreshCw size={18} /> <h3>Sync & Storage</h3>
              </div>
              <p style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>Secrets are loaded from <code>./env/*.txt</code>. Add <code>openrouter.txt</code> to enable cloud models.</p>
              <button className="btn glass" onClick={() => { fetchModels(); fetchConfig(); }}>
                <Save size={16} /> Refresh State
              </button>
            </div>
          </div>
        )}
      </main >

      <footer style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.8rem', opacity: 0.4 }}>
        SimpleClaw v1.1.0 • Final Choice Edition • {new Date().toLocaleDateString()}
      </footer>
    </div >
  );
};

export default App;

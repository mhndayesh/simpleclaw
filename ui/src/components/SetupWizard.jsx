import React, { useState, useEffect } from 'react';
import { Cpu, Shield, Layers, ChevronRight, Check, AlertCircle, Save, RefreshCw, PlusCircle } from 'lucide-react';
import axios from 'axios';

const SetupWizard = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [secrets, setSecrets] = useState({ openrouter: '', hf: '' });
    const [models, setModels] = useState([]);
    const [config, setConfig] = useState({ primary: null, fallback: null });
    const [manualMode, setManualMode] = useState({ primary: false, fallback: false });
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState('');
    const [setupStatus, setSetupStatus] = useState({ hasOllama: false, hasKeys: false });

    useEffect(() => {
        const fetchInitial = async () => {
            try {
                const [setupRes, configRes, secretsRes] = await Promise.all([
                    axios.get('/api/setup-status'),
                    axios.get('/api/config'),
                    axios.get('/api/secrets')
                ]);
                setSetupStatus(setupRes.data);
                if (secretsRes.data) setSecrets(secretsRes.data);

                // Merge existing config into wizard state
                if (configRes.data) {
                    setConfig(prev => ({
                        ...prev,
                        ...configRes.data,
                        primary: configRes.data.primary || prev.primary,
                        fallback: configRes.data.fallback || prev.fallback
                    }));
                }
            } catch (e) { }
        };
        fetchInitial();
        if (step === 3) fetchModels();
    }, [step]);

    const fetchModels = async () => {
        setLoading(true);
        try {
            const res = await axios.get('/api/models');
            setModels(res.data);
        } catch (err) {
            setStatus('Failed to fetch models: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const saveSecrets = async () => {
        setLoading(true);
        try {
            await axios.post('/api/secrets', secrets);
            setStep(3);
        } catch (err) {
            setStatus('Error saving keys: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async () => {
        setLoading(true);
        try {
            // Fetch latest config one last time to ensure merge is up to date
            const latest = await axios.get('/api/config');
            const merged = { ...latest.data, ...config, setupComplete: true };
            await axios.post('/api/config', merged);
            setStep(4);
        } catch (err) {
            setStatus('Error saving config: ' + (err.response?.data?.error || err.message));
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="fade-in" style={{ textAlign: 'center' }}>
                        <div className="premium-gradient" style={{ width: '80px', height: '80px', borderRadius: '20px', margin: '0 auto 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Cpu size={40} color="white" />
                        </div>
                        <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Welcome to SimpleClaw</h1>
                        <p style={{ opacity: 0.7, marginBottom: '2rem' }}>Let's get your neural gateway configured for optimal performance.</p>
                        <button className="btn btn-primary" onClick={() => setStep(2)} style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
                            Begin Setup <ChevronRight size={20} />
                        </button>
                    </div>
                );
            case 2:
                return (
                    <div className="fade-in">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Shield size={24} /> API Credentials
                        </h2>
                        <p style={{ opacity: 0.6, marginBottom: '2rem', fontSize: '0.9rem' }}>Add your keys to enable cloud models via OpenRouter or HuggingFace. Local Ollama models are detected automatically.</p>

                        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <div style={{
                                padding: '0.3rem 0.6rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 'bold',
                                background: setupStatus.hasOllama ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.1)',
                                color: setupStatus.hasOllama ? '#10b981' : '#ef4444',
                                border: `1px solid ${setupStatus.hasOllama ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.2)'}`,
                                display: 'flex', alignItems: 'center', gap: '0.3rem'
                            }}>
                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor', boxShadow: '0 0 5px currentColor' }} />
                                {setupStatus.hasOllama ? 'OLLAMA DETECTED' : 'OLLAMA NOT FOUND'}
                            </div>
                            {!setupStatus.hasOllama && <span style={{ fontSize: '0.7rem', opacity: 0.5 }}>Check if Ollama is running on port 11434</span>}
                        </div>

                        <div style={{ display: 'grid', gap: '1.5rem' }}>
                            <div>
                                <label style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.4rem', display: 'block' }}>OpenRouter API Key (Optional)</label>
                                <input
                                    type="password"
                                    className="glass"
                                    placeholder="sk-or-v1-..."
                                    value={secrets.openrouter}
                                    onChange={(e) => setSecrets(prev => ({ ...prev, openrouter: e.target.value }))}
                                    style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}
                                />
                            </div>
                            <div>
                                <label style={{ fontSize: '0.75rem', opacity: 0.8, marginBottom: '0.4rem', display: 'block' }}>Hugging Face Key (Optional)</label>
                                <input
                                    type="password"
                                    className="glass"
                                    placeholder="hf_..."
                                    value={secrets.hf}
                                    onChange={(e) => setSecrets(prev => ({ ...prev, hf: e.target.value }))}
                                    style={{ width: '100%', padding: '1rem', borderRadius: 'var(--radius)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
                                <button className="btn glass" onClick={() => setStep(3)}>Skip for now</button>
                                <button className="btn btn-primary" onClick={saveSecrets} disabled={loading}>
                                    {loading ? 'Saving...' : 'Save & Continue'}
                                </button>
                            </div>
                        </div>
                    </div>
                );
            case 3: {
                const providers = ['ollama', 'openrouter', 'huggingface'];
                const renderSelector = (type) => {
                    const current = config[type] || {};
                    const filteredModels = models.filter(m => m.provider === current.provider);
                    const isManual = manualMode[type];
                    return (
                        <div style={{ marginBottom: '1.5rem' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
                                <label style={{ fontSize: '0.75rem', opacity: 0.8, display: 'block', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    {type === 'primary' ? '🎯 Primary Model' : '🛡️ Fallback Model'}
                                </label>
                                <button
                                    className={`btn ${isManual ? 'btn-primary' : 'glass'}`}
                                    onClick={() => setManualMode(prev => ({ ...prev, [type]: !prev[type] }))}
                                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.6rem', height: 'auto', minHeight: 'unset' }}
                                >
                                    <PlusCircle size={10} style={{ marginRight: '0.2rem' }} /> {isManual ? 'Auto' : 'Manual'}
                                </button>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div>
                                    <label style={{ fontSize: '0.65rem', opacity: 0.6, marginBottom: '0.3rem', display: 'block' }}>Provider</label>
                                    <select
                                        className="glass"
                                        value={current.provider || ''}
                                        onChange={(e) => setConfig(prev => ({ ...prev, [type]: { ...prev[type], provider: e.target.value, model: '' } }))}
                                        style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                                    >
                                        <option value="">Select Provider</option>
                                        {providers.map(p => <option key={p} value={p}>{p.toUpperCase()}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: '0.65rem', opacity: 0.6, marginBottom: '0.3rem', display: 'block' }}>Model</label>
                                    {isManual ? (
                                        <input
                                            type="text"
                                            className="glass"
                                            value={current.model || ''}
                                            onChange={(e) => setConfig(prev => ({ ...prev, [type]: { ...prev[type], model: e.target.value } }))}
                                            placeholder="Enter model ID..."
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius)', color: 'white', border: '1px solid rgba(255,255,255,0.1)', background: 'transparent' }}
                                        />
                                    ) : (
                                        <select
                                            className="glass"
                                            value={current.model || ''}
                                            onChange={(e) => setConfig(prev => ({ ...prev, [type]: { ...prev[type], model: e.target.value } }))}
                                            disabled={!current.provider}
                                            style={{ width: '100%', padding: '0.8rem', borderRadius: 'var(--radius)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }}
                                        >
                                            <option value="">Select Model</option>
                                            {filteredModels.map(m => <option key={m.id} value={m.id}>{m.id}</option>)}
                                        </select>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                };

                return (
                    <div className="fade-in">
                        <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                            <Layers size={24} /> Model Selection
                        </h2>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <p style={{ opacity: 0.6, fontSize: '0.85rem', margin: 0 }}>Configure your neural routing.</p>
                            <button className="btn glass" onClick={fetchModels} style={{ padding: '0.4rem 0.6rem', fontSize: '0.65rem' }}>
                                <RefreshCw size={12} /> Rescan Models
                            </button>
                        </div>

                        {loading ? (
                            <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.5 }}>
                                <RefreshCw size={24} className="spin" style={{ marginBottom: '1rem' }} />
                                <p>Scanning for neural nodes...</p>
                            </div>
                        ) : (
                            <div className="fade-in">
                                {renderSelector('primary')}
                                {renderSelector('fallback')}

                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
                                    <button className="btn glass" onClick={() => setStep(2)}>Back</button>
                                    <button className="btn btn-primary" onClick={saveConfig} disabled={loading || !config.primary?.model} style={{ paddingLeft: '2rem', paddingRight: '2rem' }}>
                                        Finish Setup
                                    </button>
                                </div>
                                {status && <div style={{ color: '#ff4444', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center' }}>{status}</div>}
                            </div>
                        )}
                    </div>
                );
            }
            case 4:
                return (
                    <div className="fade-in" style={{ textAlign: 'center' }}>
                        <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                            <Check size={32} />
                        </div>
                        <h2 style={{ marginBottom: '1rem' }}>Neural Routing Verified</h2>
                        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '2rem', textAlign: 'left', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ fontSize: '0.65rem', opacity: 0.5, display: 'block', textTransform: 'uppercase' }}>Active Primary</label>
                                <div style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: 'bold' }}>{config.primary?.model || 'None'}</div>
                            </div>
                            <div>
                                <label style={{ fontSize: '0.65rem', opacity: 0.5, display: 'block', textTransform: 'uppercase' }}>Neural Fallback</label>
                                <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{config.fallback?.model || 'Not Set'}</div>
                            </div>
                        </div>
                        <p style={{ opacity: 0.7, marginBottom: '2rem', fontSize: '0.9rem' }}>All configurations have been successfully committed to the core.</p>
                        <button className="btn btn-primary" onClick={onComplete} style={{ width: '100%' }}>Launch Identity</button>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: '#050505', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
            padding: '2rem'
        }}>
            <div className="glass" style={{
                width: '100%', maxWidth: '500px', padding: '3rem', borderRadius: '2rem',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)', border: '1px solid rgba(255,255,255,0.15)'
            }}>
                <div style={{ marginBottom: '2rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    {[1, 2, 3].map(i => (
                        <div key={i} style={{
                            width: i === step ? '2rem' : '0.5rem', height: '0.5rem', borderRadius: '1rem',
                            background: i <= step ? 'hsl(var(--primary))' : 'rgba(255,255,255,0.1)',
                            transition: 'all 0.3s ease'
                        }} />
                    ))}
                </div>
                {renderStep()}
            </div>
        </div>
    );
};

export default SetupWizard;

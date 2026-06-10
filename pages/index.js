import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [palavra, setPalavra] = useState('');
  const [nos, setNos] = useState([]);
  const [centro, setCentro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [cases, setCases] = useState([]);
  const [caseAtivo, setCaseAtivo] = useState(null);

  async function explorar(termo) {
    if (!termo) return;
    setCarregando(true);
    setCentro(termo);
    setNos([]);
    setCases([]);
    setCaseAtivo(null);
    setHistorico(h => [...h.filter(x => x !== termo), termo].slice(-6));

    const res = await fetch('/api/gerar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ palavra: termo })
    });
    const data = await res.json();
    setNos(data.palavras || []);
    setCases(data.cases || []);
    setCarregando(false);
  }

  const cores = ['#EEEDFE','#E1F5EE','#FAECE7','#FAEEDA','#FBEAF0','#E6F1FB','#EAF3DE','#FCF0E4','#EEF6FF','#F5EEFE','#E8F8F2','#FFF0EC'];
  const coresBorda = ['#534AB7','#0F6E56','#993C1D','#854F0B','#993556','#185FA5','#3B6D11','#A0522D','#1A6FA8','#6A3FB5','#0D7A5F','#C04A2A'];
  const coresTexto = ['#26215C','#04342C','#4A1B0C','#412402','#4B1528','#042C53','#173404','#3B1F0A','#042B50','#2E1657','#04301F','#4A1B0C'];

  const total = nos.length;
  const angulos = nos.map((_, i) => (2 * Math.PI * i / total) - Math.PI / 2);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '24px' }}>
      <Head><title>Brainstorm Criativo</title></Head>

      <h1 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '4px' }}>Brainstorm Criativo</h1>
      <p style={{ color: '#555', fontSize: '13px', marginBottom: '20px' }}>Digite uma palavra e explore conexões + cases publicitários</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          value={palavra}
          onChange={e => setPalavra(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && explorar(palavra)}
          placeholder="Ex: calor, silêncio, velocidade, traição..."
          style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #222', background: '#141414', color: '#fff', fontSize: '15px', outline: 'none' }}
        />
        <button onClick={() => explorar(palavra)}
          style={{ padding: '12px 24px', borderRadius: '12px', background: '#534AB7', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '500' }}>
          Explorar
        </button>
      </div>

      {historico.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {historico.map((h, i) => (
            <button key={i} onClick={() => { setPalavra(h); explorar(h); }}
              style={{ padding: '3px 10px', borderRadius: '20px', background: '#141414', color: '#777', border: '1px solid #222', cursor: 'pointer', fontSize: '12px' }}>
              {h}
            </button>
          ))}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '16px', alignItems: 'start' }}>

        <div style={{ position: 'relative', height: '560px', background: '#111', borderRadius: '16px', overflow: 'hidden' }}>

          {carregando && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
              <div style={{ width: '28px', height: '28px', border: '2px solid #222', borderTopColor: '#534AB7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#444', fontSize: '13px' }}>Gerando conexões e buscando cases...</p>
            </div>
          )}

          {!carregando && centro && (
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
              {angulos.map((ang, i) => {
                const x2 = 50 + 36 * Math.cos(ang);
                const y2 = 50 + 40 * Math.sin(ang);
                return <line key={i} x1="50%" y1="50%" x2={`${x2}%`} y2={`${y2}%`} stroke="#1e1e1e" strokeWidth="1" strokeDasharray="4 3" />;
              })}
            </svg>
          )}

          {!carregando && centro && (
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', padding: '14px 26px', background: '#1a1a1a', border: '1.5px solid #534AB7', borderRadius: '28px', fontSize: '17px', fontWeight: '500', zIndex: 3, whiteSpace: 'nowrap' }}>
              {centro}
            </div>
          )}

          {!carregando && nos.map((no, i) => {
            const ang = angulos[i];
            const x = 50 + 36 * Math.cos(ang);
            const y = 50 + 40 * Math.sin(ang);
            return (
              <div key={i}
                style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', padding: '8px 16px', background: cores[i % cores.length], border: `1px solid ${coresBorda[i % coresBorda.length]}`, borderRadius: '20px', fontSize: '13px', fontWeight: '500', color: coresTexto[i % coresTexto.length], cursor: 'pointer', whiteSpace: 'nowrap', zIndex: 2, transition: 'transform 0.15s' }}
                onClick={() => { setPalavra(no); explorar(no); }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1.1)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1)'}
              >
                {no}
              </div>
            );
          })}

          {!carregando && !centro && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#2a2a2a', fontSize: '14px' }}>Pesquise uma palavra para começar</p>
            </div>
          )}
        </div>

        <div style={{ background: '#111', borderRadius: '16px', padding: '20px', height: '560px', overflowY: 'auto' }}>
          <p style={{ fontSize: '12px', color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '16px' }}>
            {cases.length > 0 ? `Cases de referência — ${centro}` : 'Cases aparecem após a busca'}
          </p>

          {cases.length === 0 && !carregando && (
            <p style={{ color: '#2a2a2a', fontSize: '13px' }}>Explore uma palavra para ver cases publicitários relevantes.</p>
          )}

          {cases.map((c, i) => (
            <div key={i}
              onClick={() => setCaseAtivo(caseAtivo === i ? null : i)}
              style={{ padding: '14px', border: `1px solid ${caseAtivo === i ? '#534AB7' : '#1e1e1e'}`, borderRadius: '12px', marginBottom: '10px', cursor: 'pointer', transition: 'border-color 0.2s', background: caseAtivo === i ? '#13102a' : 'transparent' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: '500', margin: 0, color: '#fff' }}>{c.marca}</p>
                  <p style={{ fontSize: '12px', color: '#555', margin: '3px 0 0' }}>{c.campanha}</p>
                </div>
                <span style={{ fontSize: '11px', color: '#534AB7', flexShrink: 0 }}>{caseAtivo === i ? '▲' : '▼'}</span>
              </div>
              {caseAtivo === i && (
                <p style={{ fontSize: '13px', color: '#888', margin: '10px 0 0', lineHeight: '1.6', fontStyle: 'italic', borderTop: '1px solid #1e1e1e', paddingTop: '10px' }}>
                  {c.insight}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

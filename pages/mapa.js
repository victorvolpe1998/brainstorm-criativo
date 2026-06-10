import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Mapa() {
  const router = useRouter();
  const [nos, setNos] = useState([]);
  const [centro, setCentro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [cases, setCases] = useState([]);
  const [caseAtivo, setCaseAtivo] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [modoArquivo, setModoArquivo] = useState(false);
  const [palavra, setPalavra] = useState('');
  const inputRef = useRef();

  useEffect(function() {
    const termo = router.query.q;
    if (termo) {
      setPalavra(termo);
      explorar(termo);
    }
  }, [router.query.q]);

  async function explorar(termo) {
    if (!termo) return;
    setCarregando(true);
    setCentro(termo);
    setNos([]);
    setCases([]);
    setCaseAtivo(null);
    setModoArquivo(false);
    setHistorico(function(h) { return [...h.filter(function(x) { return x !== termo; }), termo].slice(-6); });
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

  async function explorarArquivo(file) {
    if (!file) return;
    setCarregando(true);
    setNos([]);
    setCases([]);
    setCaseAtivo(null);
    setModoArquivo(true);
    setCentro('Analisando briefing...');
    const formData = new FormData();
    formData.append('arquivo', file);
    const res = await fetch('/api/briefing', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    setCentro(data.tema || 'Briefing');
    setNos(data.palavras || []);
    setCases(data.cases || []);
    setHistorico(function(h) { return [...h.filter(function(x) { return x !== data.tema; }), data.tema].slice(-6); });
    setCarregando(false);
  }

  function onArquivo(e) {
    const file = e.target.files[0];
    if (!file) return;
    setArquivo(file);
    explorarArquivo(file);
  }

  const cores = ['#EEEDFE','#E1F5EE','#FAECE7','#FAEEDA','#FBEAF0','#E6F1FB','#EAF3DE','#FCF0E4','#EEF6FF','#F5EEFE','#E8F8F2','#FFF0EC'];
  const coresBorda = ['#534AB7','#0F6E56','#993C1D','#854F0B','#993556','#185FA5','#3B6D11','#A0522D','#1A6FA8','#6A3FB5','#0D7A5F','#C04A2A'];
  const coresTexto = ['#26215C','#04342C','#4A1B0C','#412402','#4B1528','#042C53','#173404','#3B1F0A','#042B50','#2E1657','#04301F','#4A1B0C'];

  const total = nos.length;
  const angulos = nos.map(function(_, i) { return (2 * Math.PI * i / total) - Math.PI / 2; });

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <Head><title>Brainstorm Criativo</title></Head>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 32px', borderBottom: '1px solid #1a1a1a' }}>
        <span onClick={function() { router.push('/'); }} style={{ fontSize: '15px', fontWeight: '600', cursor: 'pointer', letterSpacing: '0.05em' }}>BRAINSTORM</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            value={palavra}
            onChange={function(e) { setPalavra(e.target.value); }}
            onKeyDown={function(e) { if (e.key === 'Enter') explorar(palavra); }}
            placeholder="Nova palavra..."
            style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #222', background: '#141414', color: '#fff', fontSize: '14px', outline: 'none', width: '220px' }}
          />
          <button onClick={function() { explorar(palavra); }}
            style={{ padding: '8px 20px', borderRadius: '20px', background: '#C8FF00', color: '#000', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}>
            Explorar
          </button>
          <button onClick={function() { inputRef.current.click(); }}
            style={{ padding: '8px 16px', borderRadius: '20px', background: 'transparent', color: '#aaa', border: '1px solid #222', cursor: 'pointer', fontSize: '13px' }}>
            + Briefing
          </button>
          <input ref={inputRef} type="file" accept=".pptx,.docx,.pdf,.txt" onChange={onArquivo} style={{ display: 'none' }} />
        </div>
      </div>

      {historico.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', padding: '12px 32px', borderBottom: '1px solid #111', flexWrap: 'wrap' }}>
          {historico.map(function(h, i) {
            return (
              <button key={i} onClick={function() { setPalavra(h); explorar(h); }}
                style={{ padding: '3px 12px', borderRadius: '20px', background: centro === h ? '#1a1a1a' : 'transparent', color: centro === h ? '#fff' : '#555', border: '1px solid ' + (centro === h ? '#333' : '#1a1a1a'), cursor: 'pointer', fontSize: '12px' }}>
                {h}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', height: 'calc(100vh - 61px)' }}>
        <div style={{ position: 'relative', borderRight: '1px solid #111' }}>

          {carregando && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '32px', height: '32px', border: '2px solid #1a1a1a', borderTopColor: '#C8FF00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#333', fontSize: '13px' }}>{modoArquivo ? 'Lendo briefing...' : 'Gerando conexoes...'}</p>
            </div>
          )}

          {!carregando && centro && (
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
              {angulos.map(function(ang, i) {
                const x2 = 50 + 36 * Math.cos(ang);
                const y2 = 50 + 40 * Math.sin(ang);
                return <line key={i} x1="50%" y1="50%" x2={x2 + '%'} y2={y2 + '%'} stroke="#1e1e1e" strokeWidth="1" strokeDasharray="4 3" />;
              })}
            </svg>
          )}

          {!carregando && centro && (
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', padding: '14px 28px', background: '#111', border: '1px solid #C8FF00', borderRadius: '32px', fontSize: '17px', fontWeight: '600', zIndex: 3, whiteSpace: 'nowrap', color: '#C8FF00', letterSpacing: '0.02em' }}>
              {centro}
            </div>
          )}

          {!carregando && nos.map(function(no, i) {
            const ang = angulos[i];
            const x = 50 + 36 * Math.cos(ang);
            const y = 50 + 40 * Math.sin(ang);
            return (
              <div key={i}
                style={{ position: 'absolute', left: x + '%', top: y + '%', transform: 'translate(-50%,-50%)', padding: '8px 16px', background: cores[i % cores.length], border: '1px solid ' + coresBorda[i % coresBorda.length], borderRadius: '20px', fontSize: '13px', fontWeight: '500', color: coresTexto[i % coresTexto.length], cursor: 'pointer', whiteSpace: 'nowrap', zIndex: 2, transition: 'transform 0.15s' }}
                onClick={function() { setPalavra(no); explorar(no); }}
                onMouseEnter={function(e) { e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1.1)'; }}
                onMouseLeave={function(e) { e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1)'; }}
              >
                {no}
              </div>
            );
          })}

          {!carregando && !centro && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#1e1e1e', fontSize: '14px' }}>Explore uma palavra para comecar</p>
            </div>
          )}
        </div>

        <div style={{ overflowY: 'auto', padding: '24px 20px' }}>
          <p style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '16px' }}>
            {cases.length > 0 ? 'Referencias criativas' : 'Cases aparecem apos busca'}
          </p>
          {cases.length === 0 && !carregando && (
            <p style={{ color: '#1e1e1e', fontSize: '13px' }}>Explore uma palavra para ver cases publicitarios relevantes.</p>
          )}
          {cases.map(function(c, i) {
            return (
              <div key={i}
                onClick={function() { setCaseAtivo(caseAtivo === i ? null : i); }}
                style={{ padding: '14px', border: '1px solid ' + (caseAtivo === i ? '#C8FF00' : '#1a1a1a'), borderRadius: '12px', marginBottom: '8px', cursor: 'pointer', background: caseAtivo === i ? '#0f1200' : 'transparent', transition: 'border-color 0.2s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div>
                    <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: '#fff' }}>{c.marca}</p>
                    <p style={{ fontSize: '11px', color: '#444', margin: '3px 0 0' }}>{c.campanha}</p>
                  </div>
                  <span style={{ fontSize: '10px', color: caseAtivo === i ? '#C8FF00' : '#333', flexShrink: 0 }}>{caseAtivo === i ? 'fechar' : 'ver'}</span>
                </div>
                {caseAtivo === i && (
                  <p style={{ fontSize: '12px', color: '#666', margin: '10px 0 0', lineHeight: '1.7', borderTop: '1px solid #1a1a1a', paddingTop: '10px' }}>
                    {c.insight}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}

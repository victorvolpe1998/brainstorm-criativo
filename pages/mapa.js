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
  const [modoArquivo, setModoArquivo] = useState(false);
  const [palavra, setPalavra] = useState('');
  const [arquivo, setArquivo] = useState(null);
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
    setHistorico(function(h) { return [...h.filter(function(x) { return x !== termo; }), termo].slice(-8); });
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
    setHistorico(function(h) { return [...h.filter(function(x) { return x !== data.tema; }), data.tema].slice(-8); });
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

  function abrirUrl(url) {
    if (!url) return;
    window.open(url, '_blank');
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#0a0a0a', color: '#fff' }}>
      <Head><title>Brainstorm Criativo</title></Head>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 32px', borderBottom: '1px solid #1a1a1a' }}>
        <span onClick={function() { router.push('/'); }} style={{ fontSize: '14px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.1em', color: '#fff' }}>BRAINSTORM</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            value={palavra}
            onChange={function(e) { setPalavra(e.target.value); }}
            onKeyDown={function(e) { if (e.key === 'Enter') explorar(palavra); }}
            placeholder="Nova palavra..."
            style={{ padding: '8px 16px', borderRadius: '20px', border: '1px solid #222', background: '#141414', color: '#fff', fontSize: '14px', outline: 'none', width: '200px' }}
          />
          <button onClick={function() { explorar(palavra); }}
            style={{ padding: '8px 20px', borderRadius: '20px', background: '#C8FF00', color: '#000', border: 'none', cursor: 'pointer', fontSize: '14px', fontWeight: '700' }}>
            Explorar
          </button>
          <button onClick={function() { inputRef.current.click(); }}
            style={{ padding: '8px 16px', borderRadius: '20px', background: 'transparent', color: '#555', border: '1px solid #1e1e1e', cursor: 'pointer', fontSize: '13px' }}>
            + Briefing
          </button>
          <input ref={inputRef} type="file" accept=".pptx,.docx,.pdf,.txt" onChange={onArquivo} style={{ display: 'none' }} />
        </div>
      </div>

      {historico.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', padding: '10px 32px', borderBottom: '1px solid #111', flexWrap: 'wrap' }}>
          {historico.map(function(h, i) {
            return (
              <button key={i} onClick={function() { setPalavra(h); explorar(h); }}
                style={{ padding: '3px 12px', borderRadius: '20px', background: centro === h ? '#1a1a1a' : 'transparent', color: centro === h ? '#C8FF00' : '#444', border: '1px solid ' + (centro === h ? '#2a2a2a' : '#111'), cursor: 'pointer', fontSize: '12px', transition: 'all 0.15s' }}>
                {h}
              </button>
            );
          })}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', height: 'calc(100vh - 57px)' }}>

        <div style={{ position: 'relative', borderRight: '1px solid #111', overflow: 'hidden' }}>

          {carregando && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '32px', height: '32px', border: '2px solid #1a1a1a', borderTopColor: '#C8FF00', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ color: '#2a2a2a', fontSize: '13px' }}>{modoArquivo ? 'Lendo briefing...' : 'Gerando conexoes...'}</p>
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
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', padding: '14px 28px', background: '#0f0f0f', border: '1px solid #C8FF00', borderRadius: '32px', fontSize: '17px', fontWeight: '700', zIndex: 3, whiteSpace: 'nowrap', color: '#C8FF00', letterSpacing: '0.02em' }}>
              {centro}
            </div>
          )}

          {!carregando && nos.map(function(no, i) {
            const ang = angulos[i];
            const x = 50 + 36 * Math.cos(ang);
            const y = 50 + 40 * Math.sin(ang);
            const temEspaco = no.includes(' ');
            return (
              <div key={i}
                style={{ position: 'absolute', left: x + '%', top: y + '%', transform: 'translate(-50%,-50%)', padding: temEspaco ? '8px 14px' : '7px 16px', background: cores[i % cores.length], border: '1px solid ' + coresBorda[i % coresBorda.length], borderRadius: temEspaco ? '12px' : '20px', fontSize: temEspaco ? '12px' : '13px', fontWeight: '500', color: coresTexto[i % coresTexto.length], cursor: 'pointer', whiteSpace: 'nowrap', zIndex: 2, transition: 'transform 0.15s', maxWidth: '180px', textAlign: 'center', lineHeight: '1.4' }}
                onClick={function() { setPalavra(no); explorar(no); }}
                onMouseEnter={function(e) { e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1.08)'; }}
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

        <div style={{ overflowY: 'auto', padding: '20px 16px', background: '#0d0d0d' }}>
          <p style={{ fontSize: '11px', color: '#2a2a2a', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '16px', paddingLeft: '4px' }}>
            {cases.length > 0 ? 'Referencias criativas — ' + cases.length + ' cases' : 'Cases aparecem apos busca'}
          </p>

          {cases.length === 0 && !carregando && (
            <p style={{ color: '#1e1e1e', fontSize: '13px', paddingLeft: '4px' }}>Explore uma palavra para ver cases publicitarios relevantes.</p>
          )}

          {cases.map(function(c, i) {
            const temUrl = c.url && c.url.startsWith('http');
            return (
              <div key={i}
                style={{ border: '1px solid ' + (caseAtivo === i ? '#C8FF00' : '#161616'), borderRadius: '12px', marginBottom: '8px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <div
                  onClick={function() { setCaseAtivo(caseAtivo === i ? null : i); }}
                  style={{ padding: '12px 14px', cursor: 'pointer', background: caseAtivo === i ? '#0c0e00' : 'transparent' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: '#fff' }}>{c.marca}</p>
                      <p style={{ fontSize: '11px', color: '#3a3a3a', margin: '3px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.campanha}</p>
                    </div>
                    <span style={{ fontSize: '10px', color: caseAtivo === i ? '#C8FF00' : '#252525', flexShrink: 0, marginTop: '2px' }}>
                      {caseAtivo === i ? 'fechar' : 'ver'}
                    </span>
                  </div>
                </div>

                {caseAtivo === i && (
                  <div style={{ padding: '0 14px 14px', background: '#0c0e00' }}>
                    <p style={{ fontSize: '12px', color: '#555', lineHeight: '1.7', margin: '0 0 12px', borderTop: '1px solid #161600', paddingTop: '12px' }}>
                      {c.insight}
                    </p>
                    {temUrl && (
                      <button
                        onClick={function() { abrirUrl(c.url); }}
                        style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '7px 14px', borderRadius: '8px', background: 'transparent', border: '1px solid #C8FF00', color: '#C8FF00', cursor: 'pointer', fontSize: '12px', fontWeight: '600', transition: 'background 0.15s' }}
                        onMouseEnter={function(e) { e.currentTarget.style.background = '#C8FF0015'; }}
                        onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; }}
                      >
                        Ver material completo
                        <span style={{ fontSize: '10px' }}>↗</span>
                      </button>
                    )}
                    {!temUrl && (
                      <p style={{ fontSize: '11px', color: '#2a2a2a', margin: 0 }}>Busque no Google: {c.marca} {c.campanha}</p>
                    )}
                  </div>
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

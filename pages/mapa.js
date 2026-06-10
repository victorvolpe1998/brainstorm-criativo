import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Mapa() {
  const router = useRouter();
  const [nos, setNos] = useState([]);
  const [centro, setCentro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [trilha, setTrilha] = useState([]);
  const [cases, setCases] = useState([]);
  const [caseAtivo, setCaseAtivo] = useState(null);
  const [modoArquivo, setModoArquivo] = useState(false);
  const [palavra, setPalavra] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const [animando, setAnimando] = useState(false);
  const inputRef = useRef();

  useEffect(function() {
    const termo = router.query.q;
    if (termo) { setPalavra(termo); explorar(termo, []); }
  }, [router.query.q]);

  async function explorar(termo, trilhaAtual) {
    if (!termo) return;
    setAnimando(true);
    setTimeout(async function() {
      setCarregando(true);
      setNos([]);
      setCases([]);
      setCaseAtivo(null);
      setModoArquivo(false);
      setCentro(termo);
      const novaTrilha = trilhaAtual !== undefined ? trilhaAtual : trilha;
      setTrilha(function(t) {
        const base = trilhaAtual !== undefined ? trilhaAtual : t;
        if (base[base.length - 1] === termo) return base;
        return [...base, termo].slice(-8);
      });
      setAnimando(false);
      const res = await fetch('/api/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ palavra: termo })
      });
      const data = await res.json();
      setNos(data.palavras || []);
      setCases(data.cases || []);
      setCarregando(false);
    }, 200);
  }

  async function explorarArquivo(file) {
    if (!file) return;
    setAnimando(true);
    setTimeout(async function() {
      setCarregando(true);
      setNos([]);
      setCases([]);
      setCaseAtivo(null);
      setModoArquivo(true);
      setCentro('Analisando...');
      setAnimando(false);
      const formData = new FormData();
      formData.append('arquivo', file);
      const res = await fetch('/api/briefing', { method: 'POST', body: formData });
      const data = await res.json();
      const tema = data.tema || 'Briefing';
      setCentro(tema);
      setNos(data.palavras || []);
      setCases(data.cases || []);
      setTrilha(function(t) { return [...t, tema].slice(-8); });
      setCarregando(false);
    }, 200);
  }

  function onArquivo(e) {
    const file = e.target.files[0];
    if (!file) return;
    setArquivo(file);
    explorarArquivo(file);
  }

  function voltarPara(idx) {
    const novaTrilha = trilha.slice(0, idx + 1);
    const termo = trilha[idx];
    setTrilha(novaTrilha);
    setPalavra(termo);
    explorar(termo, novaTrilha);
  }

  const cores = ['#EEEDFE','#E1F5EE','#FAECE7','#FAEEDA','#FBEAF0','#E6F1FB','#EAF3DE','#FCF0E4','#EEF6FF','#F5EEFE','#E8F8F2','#FFF0EC'];
  const coresBorda = ['#534AB7','#0F6E56','#993C1D','#854F0B','#993556','#185FA5','#3B6D11','#A0522D','#1A6FA8','#6A3FB5','#0D7A5F','#C04A2A'];
  const coresTexto = ['#26215C','#04342C','#4A1B0C','#412402','#4B1528','#042C53','#173404','#3B1F0A','#042B50','#2E1657','#04301F','#4A1B0C'];

  const total = nos.length;
  const angulos = nos.map(function(_, i) { return (2 * Math.PI * i / total) - Math.PI / 2; });

  function abrirUrl(url) {
    if (url && url.startsWith('http')) window.open(url, '_blank');
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', height: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Head><title>Brainstorm Criativo</title></Head>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: '1px solid #141414', flexShrink: 0 }}>
        <span onClick={function() { router.push('/'); }} style={{ fontSize: '13px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.12em', color: '#fff' }}>BRAINSTORM</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            value={palavra}
            onChange={function(e) { setPalavra(e.target.value); }}
            onKeyDown={function(e) { if (e.key === 'Enter') { setTrilha([]); explorar(palavra, []); } }}
            placeholder="Nova busca..."
            style={{ padding: '7px 14px', borderRadius: '20px', border: '1px solid #1e1e1e', background: '#111', color: '#fff', fontSize: '13px', outline: 'none', width: '180px' }}
          />
          <button onClick={function() { setTrilha([]); explorar(palavra, []); }}
            style={{ padding: '7px 18px', borderRadius: '20px', background: '#C8FF00', color: '#000', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>
            Ir
          </button>
          <button onClick={function() { inputRef.current.click(); }}
            style={{ padding: '7px 14px', borderRadius: '20px', background: 'transparent', color: '#444', border: '1px solid #1a1a1a', cursor: 'pointer', fontSize: '12px' }}>
            + Briefing
          </button>
          <input ref={inputRef} type="file" accept=".pptx,.docx,.pdf,.txt" onChange={onArquivo} style={{ display: 'none' }} />
        </div>
      </div>

      {trilha.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 28px', borderBottom: '1px solid #0f0f0f', flexShrink: 0, overflowX: 'auto' }}>
          {trilha.map(function(t, i) {
            const ativo = i === trilha.length - 1;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                {i > 0 && <span style={{ color: '#222', fontSize: '12px' }}>›</span>}
                <button
                  onClick={function() { if (!ativo) voltarPara(i); }}
                  style={{ padding: '2px 10px', borderRadius: '12px', background: ativo ? '#C8FF00' : 'transparent', color: ativo ? '#000' : '#333', border: '1px solid ' + (ativo ? '#C8FF00' : '#1a1a1a'), cursor: ativo ? 'default' : 'pointer', fontSize: '11px', fontWeight: ativo ? '700' : '400', whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
                  {t}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>

        <div style={{ position: 'relative', borderRight: '1px solid #0f0f0f', overflow: 'hidden' }}>

          {(carregando || animando) && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '14px', zIndex: 10 }}>
              <div style={{ width: '28px', height: '28px', border: '2px solid #1a1a1a', borderTopColor: '#C8FF00', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              <p style={{ color: '#252525', fontSize: '12px' }}>{modoArquivo ? 'Lendo briefing...' : 'Gerando...'}</p>
            </div>
          )}

          {!carregando && !animando && centro && (
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
              {angulos.map(function(ang, i) {
                const x2 = 50 + 36 * Math.cos(ang);
                const y2 = 50 + 40 * Math.sin(ang);
                return <line key={i} x1="50%" y1="50%" x2={x2 + '%'} y2={y2 + '%'} stroke="#161616" strokeWidth="1" strokeDasharray="3 4" />;
              })}
            </svg>
          )}

          {!carregando && !animando && centro && (
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', padding: '13px 26px', background: '#0a0a0a', border: '1px solid #C8FF00', borderRadius: '32px', fontSize: '16px', fontWeight: '700', zIndex: 3, color: '#C8FF00', letterSpacing: '0.02em', whiteSpace: 'nowrap', maxWidth: '280px', textAlign: 'center', animation: 'fadeIn 0.3s ease' }}>
              {centro}
            </div>
          )}

          {!carregando && !animando && nos.map(function(no, i) {
            const ang = angulos[i];
            const x = 50 + 36 * Math.cos(ang);
            const y = 50 + 40 * Math.sin(ang);
            const temEspaco = no.includes(' ');
            return (
              <div key={i}
                style={{ position: 'absolute', left: x + '%', top: y + '%', transform: 'translate(-50%,-50%)', padding: temEspaco ? '7px 13px' : '7px 15px', background: cores[i % cores.length], border: '1px solid ' + coresBorda[i % coresBorda.length], borderRadius: temEspaco ? '10px' : '20px', fontSize: temEspaco ? '11px' : '12px', fontWeight: '500', color: coresTexto[i % coresTexto.length], cursor: 'pointer', whiteSpace: 'nowrap', zIndex: 2, transition: 'transform 0.15s, box-shadow 0.15s', maxWidth: '200px', textAlign: 'center', lineHeight: '1.4', animation: 'fadeIn 0.4s ease' }}
                onClick={function() { setPalavra(no); explorar(no); }}
                onMouseEnter={function(e) { e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1.08)'; e.currentTarget.style.boxShadow = '0 0 0 2px ' + coresBorda[i % coresBorda.length] + '44'; }}
                onMouseLeave={function(e) { e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                {no}
              </div>
            );
          })}

          {!carregando && !animando && !centro && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#1a1a1a', fontSize: '14px' }}>Explore uma palavra para comecar</p>
            </div>
          )}
        </div>

        <div style={{ overflowY: 'auto', padding: '18px 14px', background: '#080808', display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <p style={{ fontSize: '10px', color: '#222', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px', paddingLeft: '2px' }}>
            {cases.length > 0 ? cases.length + ' referencias criativas' : 'Referencias aparecem apos busca'}
          </p>

          {cases.length === 0 && !carregando && (
            <p style={{ color: '#181818', fontSize: '12px', paddingLeft: '2px' }}>Explore para ver cases publicitarios.</p>
          )}

          {cases.map(function(c, i) {
            const temUrl = c.url && c.url.startsWith('http');
            const aberto = caseAtivo === i;
            return (
              <div key={i} style={{ border: '1px solid ' + (aberto ? '#2a2800' : '#111'), borderRadius: '10px', overflow: 'hidden', transition: 'border-color 0.2s', marginBottom: '6px' }}>
                <div onClick={function() { setCaseAtivo(aberto ? null : i); }}
                  style={{ padding: '11px 12px', cursor: 'pointer', background: aberto ? '#0c0e00' : 'transparent', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', margin: 0, color: aberto ? '#C8FF00' : '#ccc' }}>{c.marca}</p>
                    <p style={{ fontSize: '10px', color: '#2e2e2e', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.campanha}</p>
                  </div>
                  <span style={{ fontSize: '9px', color: aberto ? '#C8FF00' : '#222', flexShrink: 0 }}>{aberto ? '▲' : '▼'}</span>
                </div>
                {aberto && (
                  <div style={{ padding: '0 12px 12px', background: '#0c0e00' }}>
                    <p style={{ fontSize: '11px', color: '#4a4a4a', lineHeight: '1.7', margin: '0 0 10px', borderTop: '1px solid #141400', paddingTop: '10px' }}>
                      {c.insight}
                    </p>
                    {temUrl ? (
                      <button onClick={function() { abrirUrl(c.url); }}
                        style={{ padding: '6px 12px', borderRadius: '7px', background: 'transparent', border: '1px solid #C8FF00', color: '#C8FF00', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}
                        onMouseEnter={function(e) { e.currentTarget.style.background = '#C8FF0012'; }}
                        onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; }}>
                        Ver material ↗
                      </button>
                    ) : (
                      <p style={{ fontSize: '10px', color: '#222', margin: 0 }}>Busque: {c.marca} {c.campanha}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{'@keyframes spin { to { transform: rotate(360deg); } } @keyframes fadeIn { from { opacity: 0; transform: translate(-50%,-50%) scale(0.92); } to { opacity: 1; transform: translate(-50%,-50%) scale(1); } }'}</style>
    </div>
  );
}

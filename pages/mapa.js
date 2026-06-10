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
  const [palavra, setPalavra] = useState('');
  const inputRef = useRef();
  const iniciado = useRef(false);

  useEffect(function() {
    const termo = router.query.q;
    if (termo && !iniciado.current) {
      iniciado.current = true;
      setPalavra(termo);
      chamarAPI(termo, [termo]);
    }
  }, [router.query.q]);

  async function chamarAPI(termo, novaTrilha) {
    setCarregando(true);
    setCentro(termo);
    setNos([]);
    setCases([]);
    setCaseAtivo(null);
    setTrilha(novaTrilha);
    try {
      const res = await fetch('/api/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ palavra: termo })
      });
      const data = await res.json();
      setNos(data.palavras || []);
      setCases(data.cases || []);
    } catch(e) {}
    setCarregando(false);
  }

  function explorar(termo) {
    setPalavra(termo);
    const novaTrilha = [...trilha, termo].slice(-8);
    chamarAPI(termo, novaTrilha);
  }

  function novaBusca() {
    if (!palavra.trim()) return;
    chamarAPI(palavra.trim(), [palavra.trim()]);
  }

  function voltarPara(idx) {
    const termo = trilha[idx];
    const novaTrilha = trilha.slice(0, idx + 1);
    setPalavra(termo);
    chamarAPI(termo, novaTrilha);
  }

  function abrirUrl(url) {
    if (url && url.startsWith('http')) window.open(url, '_blank');
  }

  const cores = ['#EEEDFE','#E1F5EE','#FAECE7','#FAEEDA','#FBEAF0','#E6F1FB','#EAF3DE','#FCF0E4','#EEF6FF','#F5EEFE','#E8F8F2','#FFF0EC'];
  const coresBorda = ['#534AB7','#0F6E56','#993C1D','#854F0B','#993556','#185FA5','#3B6D11','#A0522D','#1A6FA8','#6A3FB5','#0D7A5F','#C04A2A'];
  const coresTexto = ['#26215C','#04342C','#4A1B0C','#412402','#4B1528','#042C53','#173404','#3B1F0A','#042B50','#2E1657','#04301F','#4A1B0C'];

  const total = nos.length;
  const angulos = nos.map(function(_, i) { return (2 * Math.PI * i / total) - Math.PI / 2; });

  const W = 70;
  const H = 42;

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', height: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Head><title>Brainstorm Criativo</title></Head>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: '1px solid #141414', flexShrink: 0 }}>
        <span onClick={function() { router.push('/'); }} style={{ fontSize: '13px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.12em' }}>BRAINSTORM</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            value={palavra}
            onChange={function(e) { setPalavra(e.target.value); }}
            onKeyDown={function(e) { if (e.key === 'Enter') novaBusca(); }}
            placeholder="Nova busca..."
            style={{ padding: '7px 14px', borderRadius: '20px', border: '1px solid #1e1e1e', background: '#111', color: '#fff', fontSize: '13px', outline: 'none', width: '180px' }}
          />
          <button onClick={novaBusca}
            style={{ padding: '7px 18px', borderRadius: '20px', background: '#C8FF00', color: '#000', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700' }}>
            Ir
          </button>
          <button onClick={function() { inputRef.current.click(); }}
            style={{ padding: '7px 14px', borderRadius: '20px', background: 'transparent', color: '#444', border: '1px solid #1a1a1a', cursor: 'pointer', fontSize: '12px' }}>
            + Briefing
          </button>
          <input ref={inputRef} type="file" accept=".pptx,.docx,.pdf,.txt" onChange={function(e) {
            const file = e.target.files[0];
            if (!file) return;
            (async function() {
              setCarregando(true);
              setCentro('Analisando...');
              setNos([]); setCases([]); setCaseAtivo(null);
              const fd = new FormData();
              fd.append('arquivo', file);
              const res = await fetch('/api/briefing', { method: 'POST', body: fd });
              const data = await res.json();
              const tema = data.tema || 'Briefing';
              setCentro(tema);
              setNos(data.palavras || []);
              setCases(data.cases || []);
              setTrilha([tema]);
              setPalavra(tema);
              setCarregando(false);
            })();
          }} style={{ display: 'none' }} />
        </div>
      </div>

      {trilha.length > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 28px', borderBottom: '1px solid #0f0f0f', flexShrink: 0, overflowX: 'auto' }}>
          {trilha.map(function(t, i) {
            const ativo = i === trilha.length - 1;
            return (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                {i > 0 && <span style={{ color: '#222', fontSize: '12px' }}>›</span>}
                <button onClick={function() { if (!ativo) voltarPara(i); }}
                  style={{ padding: '2px 10px', borderRadius: '12px', background: ativo ? '#C8FF00' : 'transparent', color: ativo ? '#000' : '#333', border: '1px solid ' + (ativo ? '#C8FF00' : '#1a1a1a'), cursor: ativo ? 'default' : 'pointer', fontSize: '11px', fontWeight: ativo ? '700' : '400', whiteSpace: 'nowrap' }}>
                  {t}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>

        <div style={{ position: 'relative', borderRight: '1px solid #0f0f0f' }}>

          {carregando && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '14px', zIndex: 10, background: '#0a0a0a' }}>
              <div style={{ width: '28px', height: '28px', border: '2px solid #1a1a1a', borderTopColor: '#C8FF00', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
              <p style={{ color: '#252525', fontSize: '12px' }}>Gerando conexoes...</p>
            </div>
          )}

          {!carregando && centro && (
            <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
              {angulos.map(function(ang, i) {
                const x2 = 50 + 34 * Math.cos(ang);
                const y2 = 50 + 38 * Math.sin(ang);
                return <line key={i} x1="50%" y1="50%" x2={x2 + '%'} y2={y2 + '%'} stroke="#161616" strokeWidth="1" strokeDasharray="3 5" />;
              })}
            </svg>
          )}

          {!carregando && centro && (
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', padding: '12px 24px', background: '#0a0a0a', border: '1px solid #C8FF00', borderRadius: '32px', fontSize: '15px', fontWeight: '700', zIndex: 3, color: '#C8FF00', maxWidth: '260px', textAlign: 'center', wordBreak: 'break-word' }}>
              {centro}
            </div>
          )}

          {!carregando && nos.map(function(no, i) {
            const ang = angulos[i];
            const x = 50 + 34 * Math.cos(ang);
            const y = 50 + 38 * Math.sin(ang);
            return (
              <div key={no + i}
                onClick={function() { explorar(no); }}
                onMouseEnter={function(e) { e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1.06)'; }}
                onMouseLeave={function(e) { e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1)'; }}
                style={{
                  position: 'absolute',
                  left: x + '%',
                  top: y + '%',
                  transform: 'translate(-50%,-50%)',
                  padding: '7px 13px',
                  background: cores[i % cores.length],
                  border: '1px solid ' + coresBorda[i % coresBorda.length],
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: '500',
                  color: coresTexto[i % coresTexto.length],
                  cursor: 'pointer',
                  zIndex: 2,
                  transition: 'transform 0.15s',
                  maxWidth: '160px',
                  width: 'max-content',
                  textAlign: 'center',
                  lineHeight: '1.4',
                  wordBreak: 'break-word',
                  whiteSpace: 'normal'
                }}>
                {no}
              </div>
            );
          })}

          {!carregando && !centro && (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <p style={{ color: '#1a1a1a', fontSize: '14px' }}>Explore uma palavra para comecar</p>
            </div>
          )}
        </div>

        <div style={{ overflowY: 'auto', padding: '16px 12px', background: '#080808' }}>
          <p style={{ fontSize: '10px', color: '#222', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '12px' }}>
            {cases.length > 0 ? cases.length + ' referencias criativas' : 'Cases aparecem apos busca'}
          </p>

          {cases.map(function(c, i) {
            const aberto = caseAtivo === i;
            const temUrl = c.url && c.url.startsWith('http');
            return (
              <div key={i} style={{ border: '1px solid ' + (aberto ? '#2a2800' : '#111'), borderRadius: '10px', marginBottom: '6px', overflow: 'hidden' }}>
                <div onClick={function() { setCaseAtivo(aberto ? null : i); }}
                  style={{ padding: '10px 12px', cursor: 'pointer', background: aberto ? '#0c0e00' : 'transparent', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', margin: 0, color: aberto ? '#C8FF00' : '#bbb' }}>{c.marca}</p>
                    <p style={{ fontSize: '10px', color: '#2e2e2e', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.campanha}</p>
                  </div>
                  <span style={{ fontSize: '9px', color: aberto ? '#C8FF00' : '#222', flexShrink: 0 }}>{aberto ? '▲' : '▼'}</span>
                </div>
                {aberto && (
                  <div style={{ padding: '0 12px 12px', background: '#0c0e00' }}>
                    <p style={{ fontSize: '11px', color: '#4a4a4a', lineHeight: '1.7', margin: '0 0 10px', borderTop: '1px solid #141400', paddingTop: '10px' }}>{c.insight}</p>
                    {temUrl ? (
                      <button onClick={function() { abrirUrl(c.url); }}
                        onMouseEnter={function(e) { e.currentTarget.style.background = '#C8FF0015'; }}
                        onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; }}
                        style={{ padding: '6px 12px', borderRadius: '7px', background: 'transparent', border: '1px solid #C8FF00', color: '#C8FF00', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }}>
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

      <style>{'@keyframes spin { to { transform: rotate(360deg); } }'}</style>
    </div>
  );
}

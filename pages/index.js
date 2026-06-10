import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [palavra, setPalavra] = useState('');
  const [nos, setNos] = useState([]);
  const [centro, setCentro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [cases, setCases] = useState([]);
  const [painelAberto, setPainelAberto] = useState(false);
  const [palavraAtiva, setPalavraAtiva] = useState('');

  async function explorar(termo) {
    if (!termo) return;
    setCarregando(true);
    setCentro(termo);
    setNos([]);
    setCases([]);
    setPainelAberto(false);
    setHistorico(h => [...h.filter(x => x !== termo), termo]);

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

  function abrirPainel(palavra) {
    setPalavraAtiva(palavra);
    setPainelAberto(true);
  }

  const cores = [
    '#EEEDFE', '#E1F5EE', '#FAECE7', '#FAEEDA', '#FBEAF0', '#E6F1FB', '#EAF3DE'
  ];
  const coresBorda = [
    '#534AB7', '#0F6E56', '#993C1D', '#854F0B', '#993556', '#185FA5', '#3B6D11'
  ];
  const coresTexto = [
    '#26215C', '#04342C', '#4A1B0C', '#412402', '#4B1528', '#042C53', '#173404'
  ];

  const angulos = nos.map((_, i) => (2 * Math.PI * i / nos.length) - Math.PI / 2);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#0f0f0f', color: '#fff', padding: '24px' }}>
      <Head>
        <title>Brainstorm Criativo</title>
      </Head>

      <h1 style={{ fontSize: '24px', fontWeight: '500', marginBottom: '8px' }}>Brainstorm Criativo</h1>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '24px' }}>Digite uma palavra e explore conexões criativas</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          value={palavra}
          onChange={e => setPalavra(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && explorar(palavra)}
          placeholder="Ex: calor, silêncio, velocidade..."
          style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #333', background: '#1a1a1a', color: '#fff', fontSize: '15px', outline: 'none' }}
        />
        <button
          onClick={() => explorar(palavra)}
          style={{ padding: '12px 24px', borderRadius: '12px', background: '#534AB7', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '15px' }}
        >
          Explorar
        </button>
      </div>

      {historico.length > 0 && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
          {historico.map((h, i) => (
            <button key={i} onClick={() => { setPalavra(h); explorar(h); }}
              style={{ padding: '4px 12px', borderRadius: '20px', background: '#1a1a1a', color: '#aaa', border: '1px solid #333', cursor: 'pointer', fontSize: '13px' }}>
              {h}
            </button>
          ))}
        </div>
      )}

      <div style={{ position: 'relative', width: '100%', height: '520px', background: '#141414', borderRadius: '16px', overflow: 'hidden' }}>

        {carregando && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', border: '2px solid #333', borderTopColor: '#534AB7', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: '#666', fontSize: '13px' }}>Gerando conexões criativas...</p>
          </div>
        )}

        {!carregando && centro && (
          <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            {angulos.map((ang, i) => {
              const x2 = 50 + 35 * Math.cos(ang);
              const y2 = 50 + 38 * Math.sin(ang);
              return <line key={i} x1="50%" y1="50%" x2={`${x2}%`} y2={`${y2}%`} stroke="#2a2a2a" strokeWidth="1" strokeDasharray="4 3" />;
            })}
          </svg>
        )}

        {!carregando && centro && (
          <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', padding: '14px 24px', background: '#1e1e1e', border: '1.5px solid #534AB7', borderRadius: '24px', fontSize: '16px', fontWeight: '500', cursor: 'pointer', zIndex: 3, whiteSpace: 'nowrap' }}
            onClick={() => abrirPainel(centro)}>
            {centro}
          </div>
        )}

        {!carregando && nos.map((no, i) => {
          const ang = angulos[i];
          const x = 50 + 35 * Math.cos(ang);
          const y = 50 + 38 * Math.sin(ang);
          return (
            <div key={i}
              style={{ position: 'absolute', left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)', padding: '8px 16px', background: cores[i % 7], border: `1px solid ${coresBorda[i % 7]}`, borderRadius: '20px', fontSize: '13px', fontWeight: '500', color: coresTexto[i % 7], cursor: 'pointer', whiteSpace: 'nowrap', zIndex: 2, transition: 'transform 0.15s' }}
              onClick={() => { setPalavra(no); explorar(no); }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1.08)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'translate(-50%,-50%) scale(1)'}
            >
              {no}
            </div>
          );
        })}

        {!carregando && !centro && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ color: '#444', fontSize: '14px' }}>Pesquise uma palavra para começar</p>
          </div>
        )}

        {painelAberto && (
          <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '300px', background: '#1a1a1a', borderLeft: '1px solid #2a2a2a', padding: '20px', overflowY: 'auto', zIndex: 10 }}>
            <button onClick={() => setPainelAberto(false)} style={{ position: 'absolute', top: '12px', right: '12px', background: 'none', border: 'none', color: '#666', cursor: 'pointer', fontSize: '18px' }}>✕</button>
            <p style={{ fontSize: '18px', fontWeight: '500', marginBottom: '4px' }}>{palavraAtiva}</p>
            <p style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '16px 0 8px' }}>Cases de referência</p>
            {cases.map((c, i) => (
              <div key={i} style={{ padding: '10px 12px', border: '1px solid #2a2a2a', borderRadius: '8px', marginBottom: '8px' }}>
                <p style={{ fontSize: '13px', fontWeight: '500', margin: 0 }}>{c.marca}</p>
                <p style={{ fontSize: '12px', color: '#888', margin: '2px 0' }}>{c.campanha}</p>
                <p style={{ fontSize: '11px', color: '#555', margin: '4px 0 0', fontStyle: 'italic' }}>{c.insight}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

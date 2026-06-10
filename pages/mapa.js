import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Mapa() {
  const router = useRouter();
  const [nos, setNos] = useState([]);
  const [conexoes, setConexoes] = useState([]);
  const [carregandoId, setCarregandoId] = useState(null);
  const [cases, setCases] = useState([]);
  const [caseAtivo, setCaseAtivo] = useState(null);
  const [palavra, setPalavra] = useState('');
  const [noAtivo, setNoAtivo] = useState(null);
  const iniciado = useRef(false);
  const idCounter = useRef(0);
  const nosRef = useRef([]);
  const conexoesRef = useRef([]);

  const W = 2400;
  const H = 1600;
  const CX = W / 2;
  const CY = H / 2;

  useEffect(function() {
    const termo = router.query.q;
    if (termo && !iniciado.current) {
      iniciado.current = true;
      setPalavra(termo);
      iniciarMapa(termo);
    }
  }, [router.query.q]);

  function novoId() {
    idCounter.current += 1;
    return idCounter.current;
  }

  function atualizarNos(novosNos) {
    nosRef.current = novosNos;
    setNos(novosNos);
  }

  function atualizarConexoes(novasConexoes) {
    conexoesRef.current = novasConexoes;
    setConexoes(novasConexoes);
  }

  async function iniciarMapa(termo) {
    const id = novoId();
    const noRaiz = { id, texto: termo, x: CX, y: CY, raiz: true, gerado: false };
    atualizarNos([noRaiz]);
    atualizarConexoes([]);
    setCases([]);
    setCaseAtivo(null);
    await expandirNo(noRaiz);
  }

  async function expandirNo(noOrigem) {
    setCarregandoId(noOrigem.id);
    try {
      const res = await fetch('/api/gerar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ palavra: noOrigem.texto })
      });
      const data = await res.json();
      const palavras = data.palavras || [];
      const casesNovos = data.cases || [];

      const total = palavras.length;
      const raio = 300;
      const anguloBase = Math.random() * Math.PI * 2;

      const nosFilhos = palavras.map(function(p, i) {
        const ang = anguloBase + (2 * Math.PI * i / total);
        const jitter = (Math.random() - 0.5) * 40;
        return {
          id: novoId(),
          texto: p,
          x: Math.max(100, Math.min(W - 100, noOrigem.x + (raio + jitter) * Math.cos(ang))),
          y: Math.max(100, Math.min(H - 100, noOrigem.y + (raio + jitter) * Math.sin(ang))),
          raiz: false,
          gerado: false,
          pai: noOrigem.id
        };
      });

      const novasConexoes = nosFilhos.map(function(filho) {
        return { de: noOrigem.id, para: filho.id };
      });

      const nosAtualizados = nosRef.current.map(function(n) {
        if (n.id === noOrigem.id) return { ...n, gerado: true };
        return n;
      }).concat(nosFilhos);

      const conexoesAtualizadas = conexoesRef.current.concat(novasConexoes);

      atualizarNos(nosAtualizados);
      atualizarConexoes(conexoesAtualizadas);
      setCases(casesNovos);
      setCaseAtivo(null);
      setNoAtivo(noOrigem.id);

      setTimeout(function() {
        const el = document.getElementById('no-' + noOrigem.id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }, 100);

    } catch(e) {}
    setCarregandoId(null);
  }

  function clicarNo(no) {
    if (carregandoId) return;
    if (no.gerado) {
      setNoAtivo(no.id);
      return;
    }
    setNoAtivo(no.id);
    expandirNo(no);
  }

  function novaBusca() {
    if (!palavra.trim()) return;
    iniciado.current = false;
    idCounter.current = 0;
    nosRef.current = [];
    conexoesRef.current = [];
    iniciarMapa(palavra.trim());
  }

  function abrirUrl(url) {
    if (url && url.startsWith('http')) window.open(url, '_blank');
  }

  const nosMap = {};
  nos.forEach(function(n) { nosMap[n.id] = n; });

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", height: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <Head>
        <title>Brainstorm Criativo</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: '1px solid #ffffff08', flexShrink: 0, background: '#050505', zIndex: 10 }}>
        <span onClick={function() { router.push('/'); }} style={{ fontSize: '12px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.15em', color: '#ffffff30' }}>BRAINSTORM</span>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            value={palavra}
            onChange={function(e) { setPalavra(e.target.value); }}
            onKeyDown={function(e) { if (e.key === 'Enter') novaBusca(); }}
            placeholder="Nova busca..."
            style={{ padding: '7px 14px', borderRadius: '20px', border: '1px solid #ffffff10', background: '#ffffff06', color: '#fff', fontSize: '13px', outline: 'none', width: '180px', fontFamily: 'inherit' }}
          />
          <button onClick={novaBusca}
            style={{ padding: '7px 20px', borderRadius: '20px', background: '#C8FF00', color: '#000', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit' }}>
            Ir
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 300px', overflow: 'hidden' }}>

        <div style={{ overflow: 'auto', position: 'relative' }}>
          <svg width={W} height={H} style={{ display: 'block' }}>
            <rect width={W} height={H} fill="#050505" />

            {conexoes.map(function(c, i) {
              const origem = nosMap[c.de];
              const destino = nosMap[c.para];
              if (!origem || !destino) return null;
              const ativo = noAtivo === c.de || noAtivo === c.para;
              return (
                <line key={i}
                  x1={origem.x} y1={origem.y}
                  x2={destino.x} y2={destino.y}
                  stroke={ativo ? '#C8FF0035' : '#ffffff07'}
                  strokeWidth={ativo ? 1 : 0.5}
                  strokeDasharray={ativo ? 'none' : '2 6'}
                />
              );
            })}

            {nos.map(function(no) {
              const estaCarregando = carregandoId === no.id;
              const ativo = noAtivo === no.id;
              const chars = no.texto.length;
              const largura = no.raiz
                ? Math.min(Math.max(chars * 9 + 40, 100), 260)
                : Math.min(Math.max(chars * 7.2 + 28, 70), 200);
              const altura = (!no.raiz && chars > 18) ? 52 : 36;

              return (
                <g key={no.id} id={'no-' + no.id}
                  onClick={function() { clicarNo(no); }}
                  style={{ cursor: carregandoId ? 'wait' : 'pointer' }}>

                  {estaCarregando && (
                    <circle cx={no.x} cy={no.y} r={largura / 2 + 12}
                      fill="none" stroke="#C8FF00" strokeWidth="0.8" strokeOpacity="0.3"
                      style={{ animation: 'ripple 1.4s ease-out infinite' }} />
                  )}

                  <rect
                    x={no.x - largura / 2} y={no.y - altura / 2}
                    width={largura} height={altura}
                    rx={no.raiz ? 24 : chars > 18 ? 10 : 18}
                    fill={no.raiz ? '#0d0d0d' : '#0a0a0a'}
                    stroke={no.raiz ? '#C8FF00' : ativo ? '#C8FF0055' : no.gerado ? '#ffffff12' : '#ffffff08'}
                    strokeWidth={no.raiz ? 1.5 : ativo ? 1 : 0.5}
                  />

                  <foreignObject
                    x={no.x - largura / 2 + 6}
                    y={no.y - altura / 2}
                    width={largura - 12}
                    height={altura}>
                    <div xmlns="http://www.w3.org/1999/xhtml"
                      style={{
                        width: '100%', height: '100%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: no.raiz ? '14px' : '11px',
                        fontWeight: no.raiz ? '700' : '400',
                        color: no.raiz ? '#C8FF00' : ativo ? '#ffffff' : '#ffffff55',
                        textAlign: 'center', lineHeight: '1.3',
                        fontFamily: 'Inter, system-ui, sans-serif',
                        wordBreak: 'break-word', padding: '2px'
                      }}>
                      {no.texto}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ overflowY: 'auto', padding: '16px 12px', background: '#060606', borderLeft: '1px solid #ffffff05' }}>
          <p style={{ fontSize: '10px', color: '#ffffff12', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '12px' }}>
            {cases.length > 0 ? cases.length + ' referencias criativas' : 'Clique em um no para ver cases'}
          </p>
          {cases.length === 0 && (
            <p style={{ color: '#ffffff08', fontSize: '12px', lineHeight: '1.6' }}>Clique em qualquer palavra para expandir o mapa e ver referencias publicitarias.</p>
          )}
          {cases.map(function(c, i) {
            const aberto = caseAtivo === i;
            const temUrl = c.url && c.url.startsWith('http');
            return (
              <div key={i} style={{ border: '1px solid ' + (aberto ? '#C8FF0025' : '#ffffff06'), borderRadius: '10px', marginBottom: '6px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <div onClick={function() { setCaseAtivo(aberto ? null : i); }}
                  style={{ padding: '10px 12px', cursor: 'pointer', background: aberto ? '#0c0e00' : 'transparent', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', margin: 0, color: aberto ? '#C8FF00' : '#ffffff40' }}>{c.marca}</p>
                    <p style={{ fontSize: '10px', color: '#ffffff12', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.campanha}</p>
                  </div>
                  <span style={{ fontSize: '9px', color: aberto ? '#C8FF00' : '#ffffff12', flexShrink: 0 }}>{aberto ? '▲' : '▼'}</span>
                </div>
                {aberto && (
                  <div style={{ padding: '0 12px 12px', background: '#0c0e00' }}>
                    <p style={{ fontSize: '11px', color: '#ffffff22', lineHeight: '1.7', margin: '0 0 10px', borderTop: '1px solid #ffffff05', paddingTop: '10px' }}>{c.insight}</p>
                    {temUrl ? (
                      <button onClick={function() { abrirUrl(c.url); }}
                        onMouseEnter={function(e) { e.currentTarget.style.background = '#C8FF0015'; }}
                        onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; }}
                        style={{ padding: '6px 12px', borderRadius: '7px', background: 'transparent', border: '1px solid #C8FF00', color: '#C8FF00', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'inherit' }}>
                        Ver material ↗
                      </button>
                    ) : (
                      <p style={{ fontSize: '10px', color: '#ffffff08', margin: 0 }}>Busque: {c.marca} {c.campanha}</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes ripple { 0% { r: 20; opacity: 0.5; } 100% { r: 60; opacity: 0; } }
        input::placeholder { color: #ffffff18; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ffffff08; border-radius: 2px; }
      `}</style>
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
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
  const svgRef = useRef();
  const iniciado = useRef(false);
  const idCounter = useRef(0);

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

  async function iniciarMapa(termo) {
    const id = novoId();
    const noRaiz = { id, texto: termo, x: CX, y: CY, raiz: true, gerado: false };
    setNos([noRaiz]);
    setConexoes([]);
    setCases([]);
    setCaseAtivo(null);
    await expandir(noRaiz, [noRaiz], []);
  }

  async function expandir(noOrigem, nosAtuais, conexoesAtuais) {
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
      const raio = 320;
      const anguloBase = Math.random() * Math.PI * 2;

      const nosFilhos = palavras.map(function(p, i) {
        const ang = anguloBase + (2 * Math.PI * i / total);
        const jitter = (Math.random() - 0.5) * 60;
        return {
          id: novoId(),
          texto: p,
          x: noOrigem.x + (raio + jitter) * Math.cos(ang),
          y: noOrigem.y + (raio + jitter) * Math.sin(ang),
          raiz: false,
          gerado: false,
          pai: noOrigem.id
        };
      });

      const novasConexoes = nosFilhos.map(function(filho) {
        return { de: noOrigem.id, para: filho.id };
      });

      const nosAtualizados = nosAtuais.map(function(n) {
        if (n.id === noOrigem.id) return { ...n, gerado: true };
        return n;
      }).concat(nosFilhos);

      const conexoesAtualizadas = conexoesAtuais.concat(novasConexoes);

      setNos(nosAtualizados);
      setConexoes(conexoesAtualizadas);
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
      const filhos = nos.filter(function(n) { return n.pai === no.id; });
      if (filhos.length > 0) {
        const el = document.getElementById('no-' + no.id);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
      }
      return;
    }
    setNoAtivo(no.id);
    expandir(no, nos, conexoes);
  }

  function novaBusca() {
    if (!palavra.trim()) return;
    iniciado.current = false;
    idCounter.current = 0;
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

        <div style={{ overflow: 'auto', position: 'relative', background: '#050505' }}>
          <svg ref={svgRef} width={W} height={H} style={{ display: 'block' }}>
            <defs>
              <radialGradient id="bgGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#C8FF00" stopOpacity="0.03" />
                <stop offset="100%" stopColor="#050505" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width={W} height={H} fill="#050505" />
            <rect width={W} height={H} fill="url(#bgGlow)" />

            {conexoes.map(function(c, i) {
              const origem = nosMap[c.de];
              const destino = nosMap[c.para];
              if (!origem || !destino) return null;
              const ativo = noAtivo === c.de || noAtivo === c.para;
              return (
                <line key={i}
                  x1={origem.x} y1={origem.y}
                  x2={destino.x} y2={destino.y}
                  stroke={ativo ? '#C8FF0030' : '#ffffff08'}
                  strokeWidth={ativo ? 1 : 0.5}
                  strokeDasharray={ativo ? 'none' : '3 6'}
                />
              );
            })}

            {nos.map(function(no) {
              const carregando = carregandoId === no.id;
              const ativo = noAtivo === no.id;
              const temEspaco = no.texto.includes(' ');
              const largura = Math.min(Math.max(no.texto.length * 7.5 + 28, 80), 200);
              const altura = temEspaco && no.texto.length > 20 ? 52 : 36;

              return (
                <g key={no.id} id={'no-' + no.id} onClick={function() { clicarNo(no); }} style={{ cursor: carregandoId ? 'wait' : 'pointer' }}>
                  {carregando && (
                    <circle cx={no.x} cy={no.y} r={largura / 2 + 8}
                      fill="none" stroke="#C8FF00" strokeWidth="1" strokeOpacity="0.4"
                      style={{ animation: 'pulse 1.2s ease-in-out infinite' }} />
                  )}
                  <rect
                    x={no.x - largura / 2} y={no.y - altura / 2}
                    width={largura} height={altura}
                    rx={no.raiz ? 24 : temEspaco ? 10 : 18}
                    fill={no.raiz ? '#0a0a0a' : ativo ? '#0f0f0f' : '#0d0d0d'}
                    stroke={no.raiz ? '#C8FF00' : ativo ? '#C8FF0060' : no.gerado ? '#ffffff15' : '#ffffff10'}
                    strokeWidth={no.raiz ? 1.5 : ativo ? 1 : 0.5}
                  />
                  <foreignObject
                    x={no.x - largura / 2 + 8}
                    y={no.y - altura / 2}
                    width={largura - 16}
                    height={altura}>
                    <div xmlns="http://www.w3.org/1999/xhtml"
                      style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: no.raiz ? '14px' : '11px', fontWeight: no.raiz ? '700' : '400', color: no.raiz ? '#C8FF00' : ativo ? '#fff' : '#ffffff70', textAlign: 'center', lineHeight: '1.3', fontFamily: 'Inter, system-ui, sans-serif', wordBreak: 'break-word' }}>
                      {no.texto}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ overflowY: 'auto', padding: '16px 12px', background: '#080808', borderLeft: '1px solid #ffffff06' }}>
          <p style={{ fontSize: '10px', color: '#ffffff15', textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '12px' }}>
            {cases.length > 0 ? cases.length + ' referencias criativas' : 'Cases aparecem apos expandir um no'}
          </p>
          {cases.length === 0 && (
            <p style={{ color: '#ffffff08', fontSize: '12px' }}>Clique em qualquer palavra para expandir e ver cases.</p>
          )}
          {cases.map(function(c, i) {
            const aberto = caseAtivo === i;
            const temUrl = c.url && c.url.startsWith('http');
            return (
              <div key={i} style={{ border: '1px solid ' + (aberto ? '#C8FF0025' : '#ffffff06'), borderRadius: '10px', marginBottom: '6px', overflow: 'hidden', transition: 'border-color 0.2s' }}>
                <div onClick={function() { setCaseAtivo(aberto ? null : i); }}
                  style={{ padding: '10px 12px', cursor: 'pointer', background: aberto ? '#0c0e00' : 'transparent', display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '12px', fontWeight: '600', margin: 0, color: aberto ? '#C8FF00' : '#ffffff50' }}>{c.marca}</p>
                    <p style={{ fontSize: '10px', color: '#ffffff15', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.campanha}</p>
                  </div>
                  <span style={{ fontSize: '9px', color: aberto ? '#C8FF00' : '#ffffff15', flexShrink: 0 }}>{aberto ? '▲' : '▼'}</span>
                </div>
                {aberto && (
                  <div style={{ padding: '0 12px 12px', background: '#0c0e00' }}>
                    <p style={{ fontSize: '11px', color: '#ffffff25', lineHeight: '1.7', margin: '0 0 10px', borderTop: '1px solid #ffffff06', paddingTop: '10px' }}>{c.insight}</p>
                    {temUrl ? (
                      <button onClick={function() { abrirUrl(c.url); }}
                        onMouseEnter={function(e) { e.currentTarget.style.background = '#C8FF0015'; }}
                        onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; }}
                        style={{ padding: '6px 12px', borderRadius: '7px', background: 'transparent', border: '1px solid #C8FF00', color: '#C8FF00', cursor: 'pointer', fontSize: '11px', fontWeight: '600', fontFamily: 'inherit' }}>
                        Ver material ↗
                      </button>
                    ) : (
                      <p style={{ fontSize: '10px', color: '#ffffff10', margin: 0 }}>Busque: {c.marca} {c.campanha}</p>
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
        @keyframes pulse { 0%,100% { opacity: 0.4; r: 0; } 50% { opacity: 0.1; } }
        input::placeholder { color: #ffffff20; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ffffff10; border-radius: 2px; }
      `}</style>
    </div>
  );
}

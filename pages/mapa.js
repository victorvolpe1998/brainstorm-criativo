import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

function CursorCerebro({ carregando }) {
  const [pos, setPos] = useState({ x: -100, y: -100 });

  useEffect(function() {
    function onMove(e) { setPos({ x: e.clientX, y: e.clientY }); }
    window.addEventListener('mousemove', onMove);
    return function() { window.removeEventListener('mousemove', onMove); };
  }, []);

  if (!carregando) return null;

  return (
    <div style={{
      position: 'fixed', left: pos.x - 14, top: pos.y - 14,
      width: 28, height: 28, pointerEvents: 'none', zIndex: 9999,
      animation: 'cursorPulse 0.8s ease-in-out infinite'
    }}>
      <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
        <path d="M14 4C10.5 4 8 6.5 8 9.5C8 10.5 8.3 11.4 8.8 12.1C7.7 12.6 7 13.7 7 15C7 16.7 8.2 18.1 9.8 18.4C9.9 20.4 11.7 22 14 22C16.3 22 18.1 20.4 18.2 18.4C19.8 18.1 21 16.7 21 15C21 13.7 20.3 12.6 19.2 12.1C19.7 11.4 20 10.5 20 9.5C20 6.5 17.5 4 14 4Z"
          fill="none" stroke="#C8FF00" strokeWidth="1.4" strokeLinejoin="round" />
        <line x1="14" y1="10" x2="14" y2="16" stroke="#C8FF00" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <line x1="11" y1="13" x2="17" y2="13" stroke="#C8FF00" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
        <circle cx="14" cy="14" r="13" fill="none" stroke="#C8FF00" strokeWidth="0.5" strokeOpacity="0.25"
          style={{ animation: 'ripple 1.2s ease-out infinite' }} />
      </svg>
    </div>
  );
}

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

  const W = 2800;
  const H = 2000;
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

  function novoId() { idCounter.current += 1; return idCounter.current; }
  function atualizarNos(n) { nosRef.current = n; setNos(n); }
  function atualizarConexoes(c) { conexoesRef.current = c; setConexoes(c); }

  async function iniciarMapa(termo) {
    const id = novoId();
    const raiz = { id, texto: termo, x: CX, y: CY, raiz: true, gerado: false };
    atualizarNos([raiz]);
    atualizarConexoes([]);
    setCases([]);
    setCaseAtivo(null);
    await expandirNo(raiz);
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

      const raioBase = 380;
      const anguloBase = Math.random() * Math.PI * 2;

      const nosExistentes = nosRef.current;

      const filhos = palavras.map(function(p, i) {
        const ang = anguloBase + (2 * Math.PI * i / total);
        let tentativas = 0;
        let x, y, sobreposicao;

        do {
          const jitter = (Math.random() - 0.5) * 80;
          const raio = raioBase + jitter + tentativas * 30;
          x = Math.max(160, Math.min(W - 160, noOrigem.x + raio * Math.cos(ang)));
          y = Math.max(100, Math.min(H - 100, noOrigem.y + raio * Math.sin(ang)));

          sobreposicao = nosExistentes.some(function(n) {
            const dx = n.x - x;
            const dy = n.y - y;
            return Math.sqrt(dx * dx + dy * dy) < 200;
          });
          tentativas++;
        } while (sobreposicao && tentativas < 8);

        return { id: novoId(), texto: p, x, y, raiz: false, gerado: false, pai: noOrigem.id };
      });

      const novasConexoes = filhos.map(function(f) { return { de: noOrigem.id, para: f.id }; });
      const nosAtualizados = nosRef.current.map(function(n) {
        return n.id === noOrigem.id ? { ...n, gerado: true } : n;
      }).concat(filhos);

      atualizarNos(nosAtualizados);
      atualizarConexoes(conexoesRef.current.concat(novasConexoes));
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
    if (no.gerado) { setNoAtivo(no.id); return; }
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
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", height: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <Head>
        <title>Brainstorm Criativo</title>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      </Head>

      <CursorCerebro carregando={carregandoId !== null} />

      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, #C8FF0010 0%, transparent 70%)', animation: 'blob1 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-10%', right: '30%', width: '35vw', height: '35vw', borderRadius: '50%', background: 'radial-gradient(circle, #C8FF0008 0%, transparent 70%)', animation: 'blob2 11s ease-in-out infinite' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 28px', borderBottom: '1px solid #ffffff08', flexShrink: 0, background: 'rgba(5,5,5,0.9)', backdropFilter: 'blur(20px)' }}>
        <span onClick={function() { router.push('/'); }} style={{ fontSize: '12px', fontWeight: '700', cursor: 'pointer', letterSpacing: '0.15em', color: '#ffffff30' }}>BRAINSTORM</span>
        <div style={{ display: 'flex', alignItems: 'center', background: '#ffffff06', border: '1px solid #ffffff10', borderRadius: '20px', padding: '4px 4px 4px 16px', gap: '6px' }}>
          <input
            value={palavra}
            onChange={function(e) { setPalavra(e.target.value); }}
            onKeyDown={function(e) { if (e.key === 'Enter') novaBusca(); }}
            placeholder="Nova busca..."
            style={{ background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '13px', width: '160px', fontFamily: 'inherit' }}
          />
          <button onClick={novaBusca}
            style={{ padding: '6px 18px', borderRadius: '16px', background: '#C8FF00', color: '#000', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: '700', fontFamily: 'inherit' }}>
            Ir
          </button>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'grid', gridTemplateColumns: '1fr 320px', overflow: 'hidden' }}>

        <div style={{ overflow: 'auto', position: 'relative' }}>
          <svg width={W} height={H} style={{ display: 'block' }}>
            <rect width={W} height={H} fill="#050505" />

            {conexoes.map(function(c, i) {
              const o = nosMap[c.de];
              const d = nosMap[c.para];
              if (!o || !d) return null;
              const ativo = noAtivo === c.de || noAtivo === c.para;
              return (
                <line key={i}
                  x1={o.x} y1={o.y} x2={d.x} y2={d.y}
                  stroke={ativo ? '#C8FF0050' : '#ffffff10'}
                  strokeWidth={ativo ? 1 : 0.5}
                  strokeDasharray={ativo ? 'none' : '3 8'}
                />
              );
            })}

            {nos.map(function(no) {
              const estaCarregando = carregandoId === no.id;
              const ativo = noAtivo === no.id;
              const chars = no.texto.length;
              const temEspaco = no.texto.includes(' ');

              const largura = no.raiz
                ? Math.min(Math.max(chars * 9 + 48, 120), 300)
                : Math.min(Math.max(chars * 8 + 36, 90), 220);

              const linhas = temEspaco && chars > 22 ? Math.ceil(chars / 22) : 1;
              const altura = no.raiz ? 42 : linhas > 1 ? 44 + (linhas - 1) * 16 : 36;

              return (
                <g key={no.id} id={'no-' + no.id} onClick={function() { clicarNo(no); }} style={{ cursor: 'pointer' }}>
                  {estaCarregando && (
                    <circle cx={no.x} cy={no.y} r="55" fill="none" stroke="#C8FF00" strokeWidth="0.8" strokeOpacity="0.2"
                      style={{ animation: 'ripple 1.6s ease-out infinite' }} />
                  )}
                  <rect
                    x={no.x - largura / 2} y={no.y - altura / 2}
                    width={largura} height={altura}
                    rx={no.raiz ? 24 : temEspaco && chars > 22 ? 10 : 18}
                    fill={no.raiz ? '#141414' : ativo ? '#141414' : '#0d0d0d'}
                    stroke={no.raiz ? '#C8FF00' : ativo ? '#C8FF00' : no.gerado ? '#ffffff25' : '#ffffff15'}
                    strokeWidth={no.raiz ? 1.5 : ativo ? 1 : 0.5}
                  />
                  <foreignObject x={no.x - largura / 2 + 8} y={no.y - altura / 2} width={largura - 16} height={altura}>
                    <div xmlns="http://www.w3.org/1999/xhtml" style={{
                      width: '100%', height: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: no.raiz ? '14px' : '12px',
                      fontWeight: no.raiz ? '700' : ativo ? '500' : '400',
                      color: no.raiz ? '#C8FF00' : ativo ? '#ffffff' : '#ffffffcc',
                      textAlign: 'center', lineHeight: '1.4',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      wordBreak: 'break-word', padding: '4px'
                    }}>
                      {no.texto}
                    </div>
                  </foreignObject>
                </g>
              );
            })}
          </svg>
        </div>

        <div style={{ overflowY: 'auto', background: 'rgba(6,6,6,0.95)', backdropFilter: 'blur(20px)', borderLeft: '1px solid #ffffff08', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '20px 16px 12px', borderBottom: '1px solid #ffffff06' }}>
            <p style={{ fontSize: '10px', color: '#ffffff40', textTransform: 'uppercase', letterSpacing: '0.16em', margin: 0 }}>
              {cases.length > 0 ? cases.length + ' referencias criativas' : 'Clique em um no para ver cases'}
            </p>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', padding: '12px 12px 20px' }}>
            {cases.length === 0 && (
              <p style={{ color: '#ffffff30', fontSize: '12px', lineHeight: '1.8', marginTop: '8px' }}>
                Clique em qualquer palavra do mapa para expandir e ver cases publicitarios.
              </p>
            )}

            {cases.map(function(c, i) {
              const aberto = caseAtivo === i;
              const temUrl = c.url && c.url.startsWith('http');
              return (
                <div key={i} style={{
                  border: '1px solid ' + (aberto ? '#C8FF0040' : '#ffffff10'),
                  borderRadius: '12px', marginBottom: '8px', overflow: 'hidden',
                  transition: 'all 0.2s',
                  background: aberto ? 'rgba(200,255,0,0.05)' : 'rgba(255,255,255,0.02)'
                }}>
                  <div onClick={function() { setCaseAtivo(aberto ? null : i); }}
                    style={{ padding: '12px 14px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: '600', margin: 0, color: aberto ? '#C8FF00' : '#ffffff' }}>{c.marca}</p>
                      <p style={{ fontSize: '11px', color: '#ffffff50', margin: '3px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.campanha}</p>
                    </div>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '1px solid ' + (aberto ? '#C8FF00' : '#ffffff20'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: '8px', color: aberto ? '#C8FF00' : '#ffffff50' }}>{aberto ? '▲' : '▼'}</span>
                    </div>
                  </div>

{aberto && (
                    <div style={{ padding: '0 14px 14px' }}>
                      <div style={{ height: '1px', background: 'linear-gradient(to right, #C8FF0030, transparent)', marginBottom: '12px' }} />
                      <p style={{ fontSize: '12px', color: '#ffffffaa', lineHeight: '1.75', margin: '0 0 14px' }}>{c.insight}</p>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={function() { window.open('https://www.youtube.com/results?search_query=' + encodeURIComponent(c.buscaYoutube || c.marca + ' ' + c.campanha), '_blank'); }}
                          onMouseEnter={function(e) { e.currentTarget.style.background = '#C8FF00'; e.currentTarget.style.color = '#000'; }}
                          onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#C8FF00'; }}
                          style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: '1px solid #C8FF00', color: '#C8FF00', cursor: 'pointer', fontSize: '11px', fontWeight: '700', fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'center' }}>
                          YouTube ↗
                        </button>
                        <button onClick={function() { window.open('https://www.google.com/search?q=' + encodeURIComponent(c.buscaGoogle || c.marca + ' ' + c.campanha), '_blank'); }}
                          onMouseEnter={function(e) { e.currentTarget.style.background = '#ffffff15'; e.currentTarget.style.color = '#fff'; }}
                          onMouseLeave={function(e) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#ffffff50'; }}
                          style={{ flex: 1, padding: '7px 10px', borderRadius: '8px', background: 'transparent', border: '1px solid #ffffff20', color: '#ffffff50', cursor: 'pointer', fontSize: '11px', fontWeight: '700', fontFamily: 'inherit', transition: 'all 0.15s', textAlign: 'center' }}>
                          Google ↗
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes blob1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(2%,4%) scale(1.05)} }
        @keyframes blob2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-3%,-2%) scale(1.08)} }
        @keyframes ripple { 0%{r:20;opacity:0.6} 100%{r:80;opacity:0} }
        @keyframes cursorPulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.25);opacity:0.7} }
        input::placeholder { color: #ffffff25; }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 3px; height: 3px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #ffffff10; border-radius: 2px; }
      `}</style>
    </div>
  );
}

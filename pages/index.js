import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const [palavra, setPalavra] = useState('');
  const router = useRouter();
  const inputRef = useRef();

  function entrar() {
    if (!palavra.trim()) return;
    router.push('/mapa?q=' + encodeURIComponent(palavra.trim()));
  }

  function onArquivo(e) {
    const file = e.target.files[0];
    if (!file) return;
    router.push('/mapa?briefing=1');
  }

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", minHeight: '100vh', background: '#050505', color: '#fff', display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
      <Head>
        <title>Brainstorm Criativo</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;700;900&display=swap" rel="stylesheet" />
      </Head>

      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: '-20%', left: '-10%', width: '60vw', height: '60vw', borderRadius: '50%', background: 'radial-gradient(circle, #C8FF0018 0%, transparent 70%)', animation: 'blob1 8s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, #C8FF0010 0%, transparent 70%)', animation: 'blob2 10s ease-in-out infinite' }} />
        <div style={{ position: 'absolute', top: '40%', left: '30%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, #ffffff06 0%, transparent 70%)', animation: 'blob3 12s ease-in-out infinite' }} />
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '13px', fontWeight: '700', letterSpacing: '0.15em', color: '#ffffff40' }}>BRAINSTORM</span>
      </div>

      <div style={{ position: 'relative', zIndex: 2, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>

        <div style={{ marginBottom: '40px' }}>
          <p style={{ fontSize: '12px', color: '#ffffff25', letterSpacing: '0.2em', textTransform: 'uppercase', marginBottom: '24px', fontWeight: '500' }}>
            Ferramenta criativa
          </p>

          <h1 style={{ fontSize: 'clamp(56px, 9vw, 112px)', fontWeight: '900', lineHeight: '0.95', margin: '0', letterSpacing: '-0.04em', color: '#fff' }}>
            Acelere<br />
            suas <em style={{ fontStyle: 'italic', fontWeight: '300', color: '#C8FF00' }}>ideias.</em>
          </h1>
        </div>

        <p style={{ fontSize: '16px', color: '#ffffff35', maxWidth: '420px', lineHeight: '1.7', margin: '0 0 56px', fontWeight: '300' }}>
          Digite uma palavra ou suba um briefing e explore conexoes criativas com referencias publicitarias em segundos.
        </p>

        <div style={{ width: '100%', maxWidth: '580px' }}>
          <div style={{ display: 'flex', gap: '0', background: '#ffffff08', border: '1px solid #ffffff12', borderRadius: '20px', padding: '8px 8px 8px 24px', alignItems: 'center', backdropFilter: 'blur(20px)', transition: 'border-color 0.2s' }}
            onFocus={function(e) { e.currentTarget.style.borderColor = '#C8FF0040'; }}
            onBlur={function(e) { e.currentTarget.style.borderColor = '#ffffff12'; }}>
            <input
              value={palavra}
              onChange={function(e) { setPalavra(e.target.value); }}
              onKeyDown={function(e) { if (e.key === 'Enter') entrar(); }}
              placeholder="velocidade, nostalgia, poder..."
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '16px', padding: '8px 0', fontFamily: 'inherit' }}
            />
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={function() { inputRef.current.click(); }}
                style={{ padding: '10px 16px', borderRadius: '12px', background: 'transparent', color: '#ffffff30', border: '1px solid #ffffff10', cursor: 'pointer', fontSize: '13px', fontFamily: 'inherit', whiteSpace: 'nowrap' }}>
                + Briefing
              </button>
              <button onClick={entrar}
                style={{ padding: '10px 28px', borderRadius: '12px', background: '#C8FF00', color: '#000', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '700', fontFamily: 'inherit' }}>
                Explorar
              </button>
            </div>
            <input ref={inputRef} type="file" accept=".pptx,.docx,.pdf,.txt" onChange={onArquivo} style={{ display: 'none' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '40px' }}>
            {['Conexoes inesperadas', 'Cases publicitarios', 'Briefings automaticos'].map(function(item, i) {
              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#C8FF00', opacity: 0.6 }} />
                  <p style={{ fontSize: '12px', color: '#ffffff20', margin: 0, fontWeight: '400' }}>{item}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', zIndex: 2, padding: '24px 40px', display: 'flex', justifyContent: 'center' }}>
        <p style={{ fontSize: '11px', color: '#ffffff15', margin: 0 }}>Desenvolvido com Claude AI</p>
      </div>

      <style>{`
        @keyframes blob1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(3%, 5%) scale(1.05); }
          66% { transform: translate(-2%, 3%) scale(0.97); }
        }
        @keyframes blob2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-4%, -3%) scale(1.08); }
          66% { transform: translate(2%, -5%) scale(0.95); }
        }
        @keyframes blob3 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(4%, -4%) scale(1.1); }
        }
        input::placeholder { color: #ffffff25; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}

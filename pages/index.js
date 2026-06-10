import { useState, useRef } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function Home() {
  const [palavra, setPalavra] = useState('');
  const [arquivo, setArquivo] = useState(null);
  const router = useRouter();
  const inputRef = useRef();

  function entrar() {
    if (!palavra.trim()) return;
    router.push('/mapa?q=' + encodeURIComponent(palavra.trim()));
  }

  function onArquivo(e) {
    const file = e.target.files[0];
    if (!file) return;
    setArquivo(file);
    router.push('/mapa?briefing=1');
  }

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#0a0a0a', color: '#fff', display: 'flex', flexDirection: 'column' }}>
      <Head><title>Brainstorm Criativo</title></Head>

      <div style={{ padding: '28px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '14px', fontWeight: '700', letterSpacing: '0.1em', color: '#fff' }}>BRAINSTORM</span>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0 24px', textAlign: 'center' }}>

        <p style={{ fontSize: '13px', color: '#555', letterSpacing: '0.15em', textTransform: 'uppercase', marginBottom: '32px' }}>Ferramenta criativa</p>

        <h1 style={{ fontSize: 'clamp(52px, 10vw, 96px)', fontWeight: '700', lineHeight: '1.0', margin: '0 0 16px', letterSpacing: '-0.03em', maxWidth: '800px' }}>
          Acelere suas<br />
          <span style={{ color: '#C8FF00' }}>ideias.</span>
        </h1>

        <p style={{ fontSize: '18px', color: '#444', maxWidth: '500px', lineHeight: '1.6', margin: '0 0 56px' }}>
          Digite uma palavra ou suba um briefing e explore conexoes criativas com referencias publicitarias em segundos.
        </p>

        <div style={{ width: '100%', maxWidth: '600px', display: 'flex', gap: '0', background: '#141414', border: '1px solid #222', borderRadius: '16px', padding: '8px 8px 8px 20px', alignItems: 'center' }}>
          <input
            value={palavra}
            onChange={function(e) { setPalavra(e.target.value); }}
            onKeyDown={function(e) { if (e.key === 'Enter') entrar(); }}
            placeholder="Ex: velocidade, nostalgia, poder..."
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '16px', padding: '8px 0' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={function() { inputRef.current.click(); }}
              style={{ padding: '10px 16px', borderRadius: '10px', background: 'transparent', color: '#555', border: '1px solid #2a2a2a', cursor: 'pointer', fontSize: '13px', whiteSpace: 'nowrap' }}>
              + Briefing
            </button>
            <button onClick={entrar}
              style={{ padding: '10px 24px', borderRadius: '10px', background: '#C8FF00', color: '#000', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '700' }}>
              Explorar
            </button>
          </div>
          <input ref={inputRef} type="file" accept=".pptx,.docx,.pdf,.txt" onChange={onArquivo} style={{ display: 'none' }} />
        </div>

        {arquivo && (
          <p style={{ marginTop: '12px', fontSize: '13px', color: '#444' }}>{arquivo.name} selecionado</p>
        )}

        <div style={{ display: 'flex', gap: '32px', marginTop: '64px' }}>
          {['Conexoes inesperadas', 'Cases publicitarios', 'Briefings automaticos'].map(function(item, i) {
            return (
              <div key={i} style={{ textAlign: 'center' }}>
                <p style={{ fontSize: '13px', color: '#333', margin: 0 }}>{item}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ padding: '24px 40px', borderTop: '1px solid #111', display: 'flex', justifyContent: 'center' }}>
        <p style={{ fontSize: '12px', color: '#2a2a2a', margin: 0 }}>Desenvolvido com Claude AI</p>
      </div>
    </div>
  );
}

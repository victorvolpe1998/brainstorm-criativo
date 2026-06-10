import { useState, useRef } from 'react';
import Head from 'next/head';

export default function Home() {
  const [palavra, setPalavra] = useState('');
  const [nos, setNos] = useState([]);
  const [centro, setCentro] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [cases, setCases] = useState([]);
  const [caseAtivo, setCaseAtivo] = useState(null);
  const [arquivo, setArquivo] = useState(null);
  const [modoArquivo, setModoArquivo] = useState(false);
  const inputRef = useRef();

  async function explorar(termo) {
    if (!termo) return;
    setCarregando(true);
    setCentro(termo);
    setNos([]);
    setCases([]);
    setCaseAtivo(null);
    setModoArquivo(false);
    setHistorico(h => [...h.filter(x => x !== termo), termo].slice(-6));

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
    setHistorico(h => [...h.filter(x => x !== data.tema), data.tema].slice(-6));
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
  const angulos = nos.map((_, i) => (2 * Math.PI * i / total) - Math.PI / 2);

  return (
    <div style={{ fontFamily: 'system-ui, sans-serif', minHeight: '100vh', background: '#0a0a0a', color: '#fff', padding: '24px' }}>
      <Head><title>Brainstorm Criativo</title></Head>

      <h1 style={{ fontSize: '22px', fontWeight: '500', marginBottom: '4px' }}>Brainstorm Criativo</h1>
      <p style={{ color: '#555', fontSize: '13px', marginBottom: '20px' }}>Digite uma palavra ou suba um briefing para explorar conexões criativas</p>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
        <input
          value={palavra}
          onChange={e => setPalavra(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && explorar(palavra)}
         placeholder="Ex: calor, silencio, velocidade, amor..."
          style={{ flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #222', background: '#141414

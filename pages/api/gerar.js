export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { palavra } = req.body;

  const prompt = `Voce e um diretor de criacao senior de uma agencia de publicidade.

Para a palavra ou conceito: "${palavra}"

Gere entre 8 e 12 itens criativos que ajudem a construir uma campanha publicitaria em cima desse conceito. Misture:
- 4 a 6 palavras soltas com potencial visual ou emocional forte (ex: "abandono", "pulso", "rastro")
- 4 a 6 pequenas frases que sejam territorios criativos, nao citacoes filosoficas (ex: "o que fica depois que a festa acaba", "velocidade que parece calma")

Regras:
- Tudo deve ter conexao real com "${palavra}" e potencial de virar conceito de campanha
- Evite citacoes de filosofos, referencias academicas ou metaforas muito abstratas
- Prefira o concreto, o sensorial, o humano, o cotidiano
- Pense em territorios que uma marca poderia ocupar

Tambem gere 8 cases reais de campanhas publicitarias que trabalham com "${palavra}" ou territorios proximos. Priorize cases premiados em Cannes, Clio, D&AD ou grandes cases brasileiros.

Para cada case, ao inves de uma URL direta, gere dois parametros de busca:
- "buscaGoogle": termo otimizado para buscar o case no Google (ex: "Nike Find Your Greatness campanha 2012")
- "buscaYoutube": termo otimizado para encontrar o filme no YouTube (ex: "Nike Find Your Greatness commercial 2012")

Responda SOMENTE em JSON valido, sem markdown:
{
  "palavras": ["item1","item2","item3","item4","item5","item6","item7","item8","item9","item10"],
  "cases": [
    {"marca":"Nome","campanha":"Nome da Campanha (Ano)","insight":"Por que esse case e relevante e o que ele fez de diferente.","buscaGoogle":"termo para google","buscaYoutube":"termo para youtube"},
    {"marca":"...","campanha":"...","insight":"...","buscaGoogle":"...","buscaYoutube":"..."},
    {"marca":"...","campanha":"...","insight":"...","buscaGoogle":"...","buscaYoutube":"..."},
    {"marca":"...","campanha":"...","insight":"...","buscaGoogle":"...","buscaYoutube":"..."},
    {"marca":"...","campanha":"...","insight":"...","buscaGoogle":"...","buscaYoutube":"..."},
    {"marca":"...","campanha":"...","insight":"...","buscaGoogle":"...","buscaYoutube":"..."},
    {"marca":"...","campanha":"...","insight":"...","buscaGoogle":"...","buscaYoutube":"..."},
    {"marca":"...","campanha":"...","insight":"...","buscaGoogle":"...","buscaYoutube":"..."}
  ]
}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 2000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    const data = await response.json();
    const texto = data.content[0].text;
    const limpo = texto.replace(/```json|```/g, '').trim();
    const resultado = JSON.parse(limpo);
    res.status(200).json(resultado);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao gerar', palavras: [], cases: [] });
  }
}

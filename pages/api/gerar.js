export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { palavra } = req.body;

  const prompt = `Voce e um assistente criativo para um diretor de criacao de uma agencia de publicidade de games.

Para a palavra/conceito: "${palavra}"

Gere exatamente 12 itens criativos. Misture:
- Palavras soltas (ex: "suor", "ancestral")
- Pequenas frases ou conceitos (ex: "o corpo que nao mente", "silencio antes do grito")
- Referencias culturais inesperadas (ex: "Kubrick filmaria isso", "rituais de passagem")
- Pelo menos 4 conexoes completamente fora do obvio que provoquem insights genuinos

Tambem gere 8 cases reais de campanhas publicitarias que trabalharam criativamente com "${palavra}" ou conceitos proximos. Para cada case inclua uma URL real onde o trabalho pode ser visto (YouTube, site da agencia, Ads of the World, Cannes Lions, etc).

Responda SOMENTE em JSON valido, sem markdown:
{
  "palavras": ["item1","item2","item3","item4","item5","item6","item7","item8","item9","item10","item11","item12"],
  "cases": [
    {"marca":"Nome da Marca","campanha":"Nome da Campanha (Ano)","insight":"Duas frases sobre o que torna esse case relevante e por que e uma referencia criativa.","url":"https://..."},
    {"marca":"...","campanha":"...","insight":"...","url":"https://..."},
    {"marca":"...","campanha":"...","insight":"...","url":"https://..."},
    {"marca":"...","campanha":"...","insight":"...","url":"https://..."},
    {"marca":"...","campanha":"...","insight":"...","url":"https://..."},
    {"marca":"...","campanha":"...","insight":"...","url":"https://..."},
    {"marca":"...","campanha":"...","insight":"...","url":"https://..."},
    {"marca":"...","campanha":"...","insight":"...","url":"https://..."}
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

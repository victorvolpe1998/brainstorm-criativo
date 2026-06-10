export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { palavra } = req.body;

  const prompt = `Você é um assistente criativo para um diretor de criação de uma agência de publicidade de games.

Para a palavra/conceito: "${palavra}"

Gere exatamente 8 palavras associadas. Misture: associações óbvias, sensoriais, emocionais, contraintuitivas e metafóricas. Inclua pelo menos 2 conexões inesperadas que fujam do óbvio e provoquem insights criativos.

Também gere 3 cases reais de campanhas publicitárias de marcas que trabalharam criativamente com "${palavra}" ou conceitos muito próximos.

Responda SOMENTE em JSON válido, sem markdown, neste formato exato:
{
  "palavras": ["palavra1","palavra2","palavra3","palavra4","palavra5","palavra6","palavra7","palavra8"],
  "cases": [
    {"marca":"Nome da Marca","campanha":"Nome da Campanha (Ano)","insight":"Uma frase sobre o que a campanha fez de interessante com esse conceito."},
    {"marca":"...","campanha":"...","insight":"..."},
    {"marca":"...","campanha":"...","insight":"..."}
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
        max_tokens: 1000,
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

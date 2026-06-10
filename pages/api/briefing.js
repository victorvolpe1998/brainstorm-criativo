import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const form = formidable({ maxFileSize: 10 * 1024 * 1024 });

  form.parse(req, async (err, fields, files) => {
    if (err) return res.status(500).json({ erro: 'Erro ao ler arquivo' });

    const file = files.arquivo?.[0] || files.arquivo;
    if (!file) return res.status(400).json({ erro: 'Nenhum arquivo enviado' });

    let texto = '';

    try {
      if (file.mimetype === 'text/plain') {
        texto = fs.readFileSync(file.filepath, 'utf-8');
      } else {
        const mammoth = await import('mammoth');
        const buffer = fs.readFileSync(file.filepath);
        const result = await mammoth.extractRawText({ buffer });
        texto = result.value;
      }
    } catch (e) {
      texto = file.originalFilename || 'briefing sem texto extraído';
    }

    const textoLimitado = texto.slice(0, 4000);

    const prompt = `Você é um assistente criativo para um diretor de criação de uma agência de publicidade de games.

Leia este briefing e extraia o tema central criativo:

"""
${textoLimitado}
"""

Com base no briefing acima:
1. Identifique o tema central em no máximo 4 palavras (será o nó central do mapa)
2. Gere 12 palavras/conceitos criativos que ajudem a resolver esse briefing — misture referências culturais, sensoriais, emocionais e conexões inesperadas
3. Gere 5 cases reais de campanhas publicitárias relevantes para esse briefing

Responda SOMENTE em JSON válido, sem markdown:
{
  "tema": "tema central aqui",
  "palavras": ["palavra1","palavra2","palavra3","palavra4","palavra5","palavra6","palavra7","palavra8","palavra9","palavra10","palavra11","palavra12"],
  "cases": [
    {"marca":"Nome da Marca","campanha":"Nome da Campanha (Ano)","insight":"Duas frases sobre o que torna esse case relevante para o briefing."},
    {"marca":"...","campanha":"...","insight":"..."},
    {"marca":"...","campanha":"...","insight":"..."},
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
          max_tokens: 1500,
          messages: [{ role: 'user', content: prompt }]
        })
      });

      const data = await response.json();
      const texto2 = data.content[0].text;
      const limpo = texto2.replace(/```json|```/g, '').trim();
      const resultado = JSON.parse(limpo);
      res.status(200).json(resultado);
    } catch (e) {
      res.status(500).json({ erro: 'Erro ao processar', palavras: [], cases: [], tema: 'Erro' });
    }
  });
}

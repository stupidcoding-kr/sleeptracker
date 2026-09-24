export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'POST 요청만 허용됩니다.' });
  }

  const { title, bedtime, waketime, bedtimeStr, waketimeStr } = req.body;
  const NOTION_API_KEY = process.env.NOTION_API_KEY;
  const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

  if (!NOTION_API_KEY || !NOTION_DATABASE_ID) {
    return res.status(500).json({ message: 'Vercel 환경 변수가 설정되지 않았습니다.' });
  }

  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        parent: { database_id: NOTION_DATABASE_ID },
        properties: {
          "Title": {
            title: [{ text: { content: title } }]
          },
          "Date": {
            date: {
              start: bedtime,
              end: waketime
            }
          },
          "Wake up": {
            rich_text: [{ text: { content: waketimeStr } }]
          },
          "Sleep": {
            rich_text: [{ text: { content: bedtimeStr } }]
          }
        }
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
}
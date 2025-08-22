const API_BASE = process.env.NEXT_PUBLIC_API_URL;


export async function pingpong() {
  try {
    await fetch(`${API_BASE}/health`, { cache: 'no-store' });
  } catch (e) {
    console.error("Ping failed:", e);
  }
}


export async function* streamQuery(question: string, maxResults: number = 5) {
  const response = await fetch(`${API_BASE}/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      question,
      max_results: maxResults,
    }),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) throw new Error('No reader available');

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            yield { event: 'data', data };
          } catch (e) {
            console.error('Error parsing JSON:', e);
          }
        } else if (line.startsWith('event: ')) {
          const event = line.slice(7);
          yield { event, data: {} };
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
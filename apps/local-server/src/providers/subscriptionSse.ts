function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function consumeSseJson(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: unknown) => void,
  maxFrameChars = 32 * 1024 * 1024,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let pendingLine = '';
  let eventName: string | null = null;
  let dataLines: string[] = [];
  let frameChars = 0;

  const flush = () => {
    const text = dataLines.join('\n').trim();
    const name = eventName;
    dataLines = [];
    frameChars = 0;
    eventName = null;
    if (!text || text === '[DONE]') return;
    let payload: unknown;
    try {
      payload = JSON.parse(text) as unknown;
    } catch (error) {
      if (!(error instanceof SyntaxError)) throw error;
      // An incomplete provider frame is ignored; a missing final image stays uncertain.
      return;
    }
    if (isRecord(payload) && name && !('type' in payload)) payload.type = name;
    onEvent(payload);
  };

  const processLine = (line: string) => {
    if (line === '') {
      flush();
      return;
    }
    if (line.startsWith(':')) return;
    if (line.startsWith('event:')) {
      eventName = line.slice('event:'.length).trim();
    } else if (line.startsWith('data:')) {
      const data = line.slice('data:'.length).trimStart();
      frameChars += data.length;
      if (frameChars > maxFrameChars) throw new Error('SSE image frame exceeded the size limit.');
      dataLines.push(data);
    }
  };

  const processChunk = (chunk: string) => {
    pendingLine += chunk;
    let newline = pendingLine.indexOf('\n');
    while (newline >= 0) {
      const line = pendingLine.slice(0, newline).replace(/\r$/, '');
      pendingLine = pendingLine.slice(newline + 1);
      processLine(line);
      newline = pendingLine.indexOf('\n');
    }
    if (pendingLine.length + frameChars > maxFrameChars) {
      throw new Error('SSE image frame exceeded the size limit.');
    }
  };

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      processChunk(decoder.decode(value, { stream: true }));
    }
    processChunk(decoder.decode());
    if (pendingLine) processLine(pendingLine.replace(/\r$/, ''));
    flush();
  } finally {
    reader.releaseLock();
  }
}

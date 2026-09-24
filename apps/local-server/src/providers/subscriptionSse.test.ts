import { describe, expect, it } from 'vitest';
import { consumeSseJson } from './subscriptionSse';

function chunks(parts: string[]) {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const part of parts) controller.enqueue(encoder.encode(part));
      controller.close();
    },
  });
}

describe('subscription SSE consumption', () => {
  it('parses frames split across transport chunks without retaining earlier events', async () => {
    const events: unknown[] = [];
    await consumeSseJson(
      chunks([
        'event: response.output_item.done\r\nda',
        'ta: {"result":"final",',
        '"status":"completed"}\r\n\r\n',
        'data: [DONE]\n\n',
      ]),
      (event) => events.push(event),
    );
    expect(events).toEqual([
      { type: 'response.output_item.done', result: 'final', status: 'completed' },
    ]);
  });

  it('rejects an oversized frame instead of accepting an unbounded response', async () => {
    await expect(
      consumeSseJson(chunks(['data: 123456789\n\n']), () => undefined, 8),
    ).rejects.toThrow('size limit');
  });
});

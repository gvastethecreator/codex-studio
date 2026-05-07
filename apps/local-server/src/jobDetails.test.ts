import { describe, expect, it } from 'vite-plus/test';

import { parseJobTranscript } from './jobDetails';

describe('parseJobTranscript', () => {
  it('extracts assistant messages and reasoning-like items from JSONL notifications', () => {
    const transcript = [
      JSON.stringify({
        method: 'turn/item',
        params: {
          item: {
            type: 'reasoning',
            text: 'Thinking through style transfer constraints.',
          },
        },
      }),
      JSON.stringify({
        method: 'turn/item',
        params: {
          item: {
            type: 'agentMessage',
            text: 'Generated image saved to D:/assets/out.png',
          },
        },
      }),
    ].join('\n');

    const entries = parseJobTranscript(transcript);

    expect(entries).toHaveLength(2);
    expect(entries[0]).toMatchObject({
      kind: 'reasoning',
      label: 'Thinking',
      text: 'Thinking through style transfer constraints.',
    });
    expect(entries[1]).toMatchObject({
      kind: 'message',
      label: 'Assistant',
      text: 'Generated image saved to D:/assets/out.png',
    });
  });

  it('falls back to readable JSON when it cannot infer a text payload', () => {
    const transcript = JSON.stringify({
      method: 'turn/completed',
      params: { turn: { id: 'turn-1', status: 'completed' } },
    });

    const [entry] = parseJobTranscript(transcript);

    expect(entry.kind).toBe('event');
    expect(entry.text).toContain('Turn completed');
  });
});
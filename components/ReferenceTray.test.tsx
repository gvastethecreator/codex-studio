/** @vitest-environment jsdom */
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { Attachment } from '../types';
import { ReferenceTray } from './ReferenceTray';

const attachment: Attachment = {
  id: 'ref-1',
  name: 'hero.png',
  dataUrl: 'data:image/png;base64,aaaa',
  strength: 1,
};

describe('ReferenceTray', () => {
  it('removes a thumbnail from the Create references panel', () => {
    const onRemove = vi.fn();
    render(
      <div className="create-tools">
        <div className="create-reference-list">
          <ReferenceTray
            attachments={[attachment]}
            onEdit={vi.fn()}
            onRemove={onRemove}
            onFiles={vi.fn()}
            density="thumbs"
          />
        </div>
      </div>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Remove hero.png' }));
    expect(onRemove).toHaveBeenCalledWith('ref-1');
  });
});

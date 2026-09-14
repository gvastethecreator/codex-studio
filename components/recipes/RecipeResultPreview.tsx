import React, { useState } from 'react';
import type { Attachment, GeneratedImageWithConfig } from '../../types';

export function RecipeResultPreview({
  images,
  reference,
  onOpen,
}: {
  images: GeneratedImageWithConfig[];
  reference?: Attachment;
  onOpen?: (image: GeneratedImageWithConfig) => void;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showReference, setShowReference] = useState(false);
  const selected = images.find((image) => image.id === selectedId) ?? images[0];
  const src = showReference || !selected ? reference?.dataUrl : selected?.src;
  return (
    <section className="recipe-result" aria-label="Result preview">
      <div className="recipe-result-heading">
        <span>{showReference || !selected ? 'Reference preview' : 'Result'}</span>
        {reference && selected && (
          <button
            type="button"
            aria-pressed={showReference}
            onClick={() => setShowReference(!showReference)}
          >
            {showReference ? 'Show result' : 'Compare reference'}
          </button>
        )}
        {selected && !showReference && onOpen && (
          <button type="button" onClick={() => onOpen(selected)}>
            Open result
          </button>
        )}
      </div>
      <div className="recipe-result-image">
        {src ? (
          <img
            src={src}
            alt={showReference || !selected ? 'Reference image' : 'Generated result'}
          />
        ) : (
          <div>
            <h2>Your next result starts here</h2>
            <p>Add a prompt or reference, choose your settings, then generate.</p>
          </div>
        )}
      </div>
      {images.length > 0 && (
        <div className="recipe-result-strip" aria-label="Recipe results">
          {images.slice(0, 20).map((image, index) => (
            <button
              type="button"
              key={image.id}
              aria-label={`View result ${index + 1}`}
              aria-pressed={selected?.id === image.id && !showReference}
              onClick={() => {
                setSelectedId(image.id);
                setShowReference(false);
              }}
            >
              <img src={image.thumbnail || image.src} alt="" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
}

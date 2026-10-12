import { useEffect, useRef, useState } from 'react';

interface GalleryImage {
  thumb: string;
  full: string;
  alt: string;
  width: number;
  height: number;
}

interface Props {
  images: GalleryImage[];
  labels: { open: string; close: string };
}

export default function ImageGallery({ images, labels }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [active, setActive] = useState<GalleryImage | null>(null);

  useEffect(() => {
    if (active && dialog.current && !dialog.current.open) dialog.current.showModal();
  }, [active]);

  function open(img: GalleryImage) {
    setActive(img);
  }

  // Phone screenshots are portrait: show them in a denser grid without cropping them to landscape.
  const isPortrait = (img: GalleryImage) => img.height > img.width;
  const allPortrait = images.length > 0 && images.every(isPortrait);

  return (
    <>
      <ul className={`grid gap-4 ${allPortrait ? 'grid-cols-2 sm:grid-cols-3' : 'sm:grid-cols-2'}`}>
        {images.map((img) => (
          <li key={img.full}>
            <button
              type="button"
              onClick={() => open(img)}
              aria-label={`${labels.open}: ${img.alt}`}
              className="block w-full overflow-hidden rounded-2xl border border-line bg-surface"
            >
              <img
                src={img.thumb}
                alt={img.alt}
                width={img.width}
                height={img.height}
                loading="lazy"
                decoding="async"
                className={`w-full object-cover ${isPortrait(img) ? 'aspect-[9/16] object-top' : 'aspect-[16/10]'}`}
              />
            </button>
          </li>
        ))}
      </ul>
      <dialog
        ref={dialog}
        aria-label={active?.alt ?? labels.open}
        onClose={() => setActive(null)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto max-h-[90vh] max-w-[90vw] rounded-tile bg-surface p-0 backdrop:bg-black/70"
      >
        {active && (
          <figure className="relative">
            <img
              src={active.full}
              alt={active.alt}
              className="max-h-[85vh] w-auto max-w-full object-contain"
            />
            <button
              type="button"
              autoFocus
              onClick={() => dialog.current?.close()}
              className="pill pill-neutral absolute right-3 top-3 bg-surface"
            >
              {labels.close}
            </button>
          </figure>
        )}
      </dialog>
    </>
  );
}

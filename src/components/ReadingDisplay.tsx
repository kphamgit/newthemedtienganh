import DOMPurify from 'dompurify';

// Renders a quiz's "reading" HTML (authored in the teacher app's TipTap editor).
// We don't try to match the teacher layout exactly — we just keep images INLINE so they
// flow with the text rather than sitting on their own block. The teacher-side image node is
// already inline, so the saved HTML has <img> inside the paragraphs; we only need to (a) let
// the sanitizer keep the image src + inline sizing, and (b) ensure the <img> renders inline.
export default function ReadingDisplay({ html }: { html?: string | null }) {
  if (!html || !html.trim()) return null;

  const clean = DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'b', 'i', 'em', 'strong', 'u', 's', 'a', 'ul', 'ol', 'li', 'br',
      'span', 'div', 'img', 'h1', 'h2', 'h3', 'figure', 'figcaption'],
    // Keep `src` (so images show), `style`/`width`/`height` (so sizing from the editor survives).
    ALLOWED_ATTR: ['href', 'target', 'rel', 'src', 'alt', 'title', 'style', 'width', 'height', 'class'],
  });

  return (
    <>
      {/* Float images so the text flows around them over several lines (hugged to one side),
          rather than each image sitting on its own block. The ::after clearfix makes the
          container wrap its floated images so following content isn't pulled up beside them. */}
      <style>{`
        .reading-content::after { content: ""; display: block; clear: both; }
        .reading-content img {
          float: left;
          max-width: 45%;
          height: auto;
          margin: 4px 14px 6px 0;
        }
      `}</style>
      <div className="reading-content" dangerouslySetInnerHTML={{ __html: clean }} />
    </>
  );
}

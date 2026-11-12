import React from 'react';
import ReactMarkdown, { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from '../interactive/CodeBlock';
import { PoolCalculator } from '../interactive/PoolCalculator';
import { cn } from '../../utils/cn';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

type ContentBlock =
  | { type: 'markdown'; content: string }
  | { type: 'callout'; calloutType: string; title: string; content: string }
  | { type: 'figure'; content: string }
  | { type: 'formula'; title: string; content: string }
  | { type: 'interactive'; widget: string }
  | { type: 'svg'; content: string };

/**
 * Automatically cleans stray LaTeX notation (e.g. \text{...}, \times, $...$)
 * outside code blocks so that unparsed LaTeX math renders as clean text.
 */
function sanitizeLatexArtifacts(raw: string): string {
  // Only sanitize outside of triple-backtick code fences and raw SVG blocks
  const parts = raw.split(/(```[\s\S]*?```|<svg[\s\S]*?<\/svg>)/gi);
  return parts
    .map((part, index) => {
      // Odd indices are code fences or SVGs: preserve completely as-is
      if (index % 2 === 1) return part;

      let cleaned = part;

      // 1. Convert block math $$...$$ to :::formula blocks if present
      cleaned = cleaned.replace(/\$\$\s*\r?\n?([\s\S]*?)\r?\n?\$\$/g, (_, eq) => {
        let cleanEq = eq;
        while (/\\text(?:tt)?\{([^{}]+)\}/.test(cleanEq)) {
          cleanEq = cleanEq.replace(/\\text(?:tt)?\{([^{}]+)\}/g, '$1');
        }
        cleanEq = cleanEq
          .replace(/\\times/g, '×')
          .replace(/\\le(?![a-zA-Z])/g, '≤')
          .replace(/\\ge(?![a-zA-Z])/g, '≥')
          .replace(/\\ne(?![a-zA-Z])/g, '≠')
          .replace(/\\approx/g, '≈')
          .replace(/\\dots/g, '…')
          .replace(/\\;/g, ' ')
          .replace(/\\quad/g, ' ')
          .replace(/\\qquad/g, '  ')
          .replace(/\\&/g, '&')
          .trim();
        return `\n:::formula{title="Formula"}\n${cleanEq}\n:::\n`;
      });

      // 2. Unpack \text{...} and \texttt{...}
      while (/\\text(?:tt)?\{([^{}]+)\}/.test(cleaned)) {
        cleaned = cleaned.replace(/\\text(?:tt)?\{([^{}]+)\}/g, '$1');
      }

      // 3. Replace common LaTeX math symbols
      cleaned = cleaned
        .replace(/\\times/g, '×')
        .replace(/\\le(?![a-zA-Z])/g, '≤')
        .replace(/\\ge(?![a-zA-Z])/g, '≥')
        .replace(/\\ne(?![a-zA-Z])/g, '≠')
        .replace(/\\approx/g, '≈')
        .replace(/\\dots/g, '…')
        .replace(/\\;/g, ' ')
        .replace(/\\quad/g, ' ')
        .replace(/\\qquad/g, '  ')
        .replace(/\\&/g, '&');

      // 4. Strip stray $...$ around inline expressions with units or text (e.g. $0 bytes$, $850MB$)
      cleaned = cleaned.replace(/(?<!\\)\$([^$\n\r]+?)\$/g, (match, inner) => {
        if (/[a-zA-Z×=+\-*/]/.test(inner)) {
          return inner.trim();
        }
        return match;
      });

      return cleaned;
    })
    .join('');
}

/**
 * Splits raw markdown into standard markdown chunks and custom directive blocks
 * such as :::callout{type="..." title="..."} ... :::
 */
function parseContentBlocks(raw: string): ContentBlock[] {
  const blocks: ContentBlock[] = [];
  // Match raw <svg ... </svg> OR :::directive{attrs} ... :::
  const blockRegex =
    /(<svg[\s\S]*?<\/svg>)|(?:::([a-z]+)(?:\{([^}]*)\})?\r?\n([\s\S]*?)\r?\n:::)/gi;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = blockRegex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = raw.slice(lastIndex, match.index).trim();
      if (textBefore) {
        blocks.push({ type: 'markdown', content: textBefore });
      }
    }

    // Direct SVG Block
    if (match[1]) {
      blocks.push({
        type: 'svg',
        content: match[1],
      });
      lastIndex = blockRegex.lastIndex;
      continue;
    }

    const directiveType = match[2];
    const attrsString = match[3] || '';
    const body = match[4];

    const typeMatch = attrsString.match(/type="([^"]+)"/);
    const titleMatch = attrsString.match(/title="([^"]+)"/);
    const widgetMatch = attrsString.match(/widget="([^"]+)"/);
    const calloutType = typeMatch ? typeMatch[1] : 'info';
    const title = titleMatch ? titleMatch[1] : '';
    const widget = widgetMatch ? widgetMatch[1] : (body ? body.trim() : 'pool-calculator');

    if (directiveType === 'callout') {
      blocks.push({
        type: 'callout',
        calloutType,
        title,
        content: body,
      });
    } else if (directiveType === 'figure') {
      blocks.push({
        type: 'figure',
        content: body,
      });
    } else if (directiveType === 'formula') {
      blocks.push({
        type: 'formula',
        title: title || 'Formula Heuristic',
        content: body,
      });
    } else if (directiveType === 'interactive') {
      blocks.push({
        type: 'interactive',
        widget: widget.toLowerCase(),
      });
    }

    lastIndex = blockRegex.lastIndex;
  }

  if (lastIndex < raw.length) {
    const textAfter = raw.slice(lastIndex).trim();
    if (textAfter) {
      blocks.push({ type: 'markdown', content: textAfter });
    }
  }

  // If no directives matched, return the entire content as single markdown block
  if (blocks.length === 0 && raw.trim()) {
    blocks.push({ type: 'markdown', content: raw });
  }

  return blocks;
}

function getNodeText(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(getNodeText).join('');
  if (React.isValidElement(node) && node.props && (node.props as any).children) {
    return getNodeText((node.props as any).children);
  }
  return '';
}

interface DiagramFigureProps {
  src: string;
  alt?: string;
  title?: string;
}

export const DiagramFigure: React.FC<DiagramFigureProps> = ({ src, alt, title }) => {
  const [svgContent, setSvgContent] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);
  const [isPngDownloading, setIsPngDownloading] = React.useState(false);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const isSvg = src.toLowerCase().includes('.svg');

  const diagramName = alt || title || 'architectural-diagram';
  const fileBasename =
    src.split('/').pop()?.replace(/\.svg$/i, '') ||
    diagramName.toLowerCase().replace(/[^a-z0-9]+/g, '-');

  React.useEffect(() => {
    if (!isSvg) return;
    let isMounted = true;
    fetch(src)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.text();
      })
      .then((text) => {
        if (isMounted) {
          // Normalize outer svg width and height so it responsively scales to container without distortion
          let cleaned = text;
          if (/<svg\b[^>]*\bwidth="/i.test(cleaned)) {
            cleaned = cleaned.replace(/<svg\b([^>]*)\bwidth="[^"]*"/i, '<svg$1 width="100%"');
          } else {
            cleaned = cleaned.replace(/<svg\b/i, '<svg width="100%" ');
          }
          if (/<svg\b[^>]*\bheight="/i.test(cleaned)) {
            cleaned = cleaned.replace(/<svg\b([^>]*)\bheight="[^"]*"/i, '<svg$1 height="auto"');
          } else {
            cleaned = cleaned.replace(/<svg\b/i, '<svg height="auto" ');
          }
          if (!/<svg\b[^>]*\bpreserveAspectRatio=/i.test(cleaned)) {
            cleaned = cleaned.replace(/<svg\b/i, '<svg preserveAspectRatio="xMidYMid meet" ');
          }
          setSvgContent(cleaned);
        }
      })
      .catch((err) => {
        console.warn('Diagram SVG fetch failed, falling back to <img>:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [src, isSvg]);

  React.useEffect(() => {
    if (!isFullscreen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isFullscreen]);

  const handleCopy = async () => {
    if (!svgContent) return;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(svgContent);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = svgContent;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Failed to copy SVG:', err);
    }
  };

  const handleDownloadSvg = () => {
    if (!svgContent) return;
    const blob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileBasename}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const handleDownloadPng = () => {
    if (!svgContent) return;
    setIsPngDownloading(true);

    try {
      let xml = svgContent;
      if (!xml.includes('xmlns="http://www.w3.org/2000/svg"')) {
        xml = xml.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      const viewBoxMatch = xml.match(/viewBox="([^"]+)"/);
      let naturalWidth = 960;
      let naturalHeight = 540;
      if (viewBoxMatch) {
        const parts = viewBoxMatch[1].trim().split(/\s+/).map(Number);
        if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
          naturalWidth = parts[2];
          naturalHeight = parts[3];
        }
      }

      const blob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();

      img.onload = () => {
        try {
          const scale = 2; // High-DPI 2x
          const canvas = document.createElement('canvas');
          canvas.width = naturalWidth * scale;
          canvas.height = naturalHeight * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            setIsPngDownloading(false);
            URL.revokeObjectURL(url);
            return;
          }

          const isDark = document.documentElement.classList.contains('dark');
          ctx.fillStyle = isDark ? '#12161e' : '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((pngBlob) => {
            if (pngBlob) {
              const pngUrl = URL.createObjectURL(pngBlob);
              const a = document.createElement('a');
              a.href = pngUrl;
              a.download = `${fileBasename}.png`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              setTimeout(() => URL.revokeObjectURL(pngUrl), 1000);
            }
            setIsPngDownloading(false);
            URL.revokeObjectURL(url);
          }, 'image/png');
        } catch (err) {
          console.error('PNG conversion error:', err);
          setIsPngDownloading(false);
          URL.revokeObjectURL(url);
        }
      };

      img.onerror = () => {
        setIsPngDownloading(false);
        URL.revokeObjectURL(url);
      };

      img.src = url;
    } catch (err) {
      console.error('Download PNG failed:', err);
      setIsPngDownloading(false);
    }
  };

  return (
    <>
      <figure className="my-8 rounded-[8px] overflow-hidden border border-[#232730]/30 dark:border-[#232730] bg-white dark:bg-[#12161e] shadow-catalog-edge group">
        <div className="w-full flex justify-center bg-white dark:bg-[#12161e] p-0 overflow-hidden">
          {isSvg && svgContent ? (
            <div
              className="w-full h-auto flex justify-center overflow-hidden [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-w-full [&>svg]:block"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          ) : (
            <img
              src={src}
              alt={alt || 'Technical architectural diagram'}
              className="w-full h-auto max-w-full object-contain block"
              loading="lazy"
            />
          )}
        </div>

        <figcaption className="px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 font-mono text-[11px] border-t border-[#232730]/20 dark:border-[#232730] bg-white dark:bg-[#12161e]">
          <div className="flex items-center gap-1.5 text-[#3e5199] dark:text-[#5568ad] min-w-0">
            <span className="material-symbols-outlined text-[15px] shrink-0 text-[#167e6c]">schema</span>
            <span className="font-semibold uppercase tracking-wider text-[10.5px] shrink-0 text-[#1b2d70] dark:text-[#5568ad]">
              DIAGRAM:
            </span>
            <span className="text-[#000000] dark:text-[#f8fafc] truncate font-sans text-[12px] font-medium">
              {alt || title || 'Architecture Blueprint'}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto shrink-0">
            {isSvg && svgContent && (
              <>
                {/* Copy SVG */}
                <button
                  type="button"
                  onClick={handleCopy}
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-1 rounded-[5px] text-[11px] font-mono transition-all cursor-pointer border',
                    copied
                      ? 'border-[#167e6c] bg-[#167e6c]/15 text-[#167e6c]'
                      : 'border-[#232730]/30 dark:border-[#232730] text-[#3e5199] dark:text-[#5568ad] hover:text-white hover:bg-[#3e5199] dark:hover:bg-[#1b2d70]'
                  )}
                  title="Copy raw SVG code to clipboard"
                >
                  <span className="material-symbols-outlined text-[13px]">{copied ? 'check' : 'content_copy'}</span>
                  <span>{copied ? 'Copied' : 'SVG'}</span>
                </button>

                {/* Download SVG */}
                <button
                  type="button"
                  onClick={handleDownloadSvg}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-[5px] text-[11px] font-mono border border-[#232730]/30 dark:border-[#232730] text-[#3e5199] dark:text-[#5568ad] hover:text-white hover:bg-[#3e5199] dark:hover:bg-[#1b2d70] transition-colors cursor-pointer"
                  title="Download vector SVG file"
                >
                  <span className="material-symbols-outlined text-[13px]">file_download</span>
                  <span>SVG</span>
                </button>

                {/* Download PNG */}
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  disabled={isPngDownloading}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-[5px] text-[11px] font-mono border border-[#232730]/30 dark:border-[#232730] text-[#3e5199] dark:text-[#5568ad] hover:text-white hover:bg-[#3e5199] dark:hover:bg-[#1b2d70] transition-colors cursor-pointer disabled:opacity-50"
                  title="Export 2x high-resolution PNG"
                >
                  <span className="material-symbols-outlined text-[13px]">{isPngDownloading ? 'hourglass_top' : 'image'}</span>
                  <span>{isPngDownloading ? '...' : 'PNG'}</span>
                </button>

                {/* Fullscreen Expand */}
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1);
                    setIsFullscreen(true);
                  }}
                  className="inline-flex items-center gap-1 px-1.5 py-1 rounded-[5px] text-[11px] font-mono border border-[#232730]/30 dark:border-[#232730] text-[#3e5199] dark:text-[#5568ad] hover:text-white hover:bg-[#3e5199] dark:hover:bg-[#1b2d70] transition-colors cursor-pointer"
                  title="Fullscreen zoom view"
                >
                  <span className="material-symbols-outlined text-[14px]">fullscreen</span>
                </button>
              </>
            )}
          </div>
        </figcaption>
      </figure>

      {/* Fullscreen Lightbox Modal */}
      {isFullscreen && svgContent && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-[#080b32]/95 backdrop-blur-md p-3 sm:p-6 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between pb-3 border-b border-[#232730] shrink-0">
            <div className="flex items-center gap-2 min-w-0 pr-4">
              <span className="material-symbols-outlined text-[20px] text-[#167e6c] shrink-0">schema</span>
              <h3 className="font-mono text-[13.5px] font-semibold text-white tracking-tight truncate">
                {alt || title || 'Architectural Diagram'}
              </h3>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Zoom Out */}
              <button
                type="button"
                onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.2).toFixed(1))))}
                className="p-1.5 rounded-[6px] text-[#5568ad] hover:text-white hover:bg-[#1b2d70] border border-[#232730] transition-colors"
                title="Zoom Out"
              >
                <span className="material-symbols-outlined text-[18px]">zoom_out</span>
              </button>
              <span className="font-mono text-[11px] text-[#5568ad] w-12 text-center select-none">
                {Math.round(zoom * 100)}%
              </span>
              {/* Zoom In */}
              <button
                type="button"
                onClick={() => setZoom((z) => Math.min(3, Number((z + 0.2).toFixed(1))))}
                className="p-1.5 rounded-[6px] text-[#5568ad] hover:text-white hover:bg-[#1b2d70] border border-[#232730] transition-colors"
                title="Zoom In"
              >
                <span className="material-symbols-outlined text-[18px]">zoom_in</span>
              </button>
              <button
                type="button"
                onClick={() => setZoom(1)}
                className="px-2 py-1 rounded-[6px] text-[#5568ad] hover:text-white hover:bg-[#1b2d70] border border-[#232730] transition-colors font-mono text-[11px]"
                title="Reset Zoom"
              >
                Reset
              </button>

              <div className="h-4 w-px bg-[#232730] mx-1 hidden sm:block" />

              {/* Action Buttons in Modal */}
              <button
                type="button"
                onClick={handleCopy}
                className={cn(
                  'hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] font-mono text-[11.5px] transition-colors border',
                  copied
                    ? 'border-[#167e6c] bg-[#167e6c]/20 text-[#167e6c]'
                    : 'border-[#232730] text-[#5568ad] hover:text-white hover:bg-[#3e5199]'
                )}
              >
                <span className="material-symbols-outlined text-[15px]">{copied ? 'check' : 'content_copy'}</span>
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadSvg}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] font-mono text-[11.5px] text-[#5568ad] hover:text-white hover:bg-[#3e5199] border border-[#232730] transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">file_download</span>
                <span>SVG</span>
              </button>
              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={isPngDownloading}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-[6px] font-mono text-[11.5px] text-[#5568ad] hover:text-white hover:bg-[#3e5199] border border-[#232730] transition-colors"
              >
                <span className="material-symbols-outlined text-[15px]">image</span>
                <span>PNG</span>
              </button>

              <div className="h-4 w-px bg-[#232730] mx-1" />

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsFullscreen(false)}
                className="p-1.5 rounded-[6px] text-white/70 hover:text-white hover:bg-[#111a4a] border border-[#232730] transition-colors"
                title="Close (Esc)"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="flex-1 overflow-auto flex items-center justify-center p-4 sm:p-8">
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'center center',
                transition: 'transform 0.12s ease-out',
              }}
              className="w-full max-w-5xl h-auto flex items-center justify-center [&>svg]:w-full [&>svg]:h-auto [&>svg]:max-h-[82vh] [&>svg]:block"
              dangerouslySetInnerHTML={{ __html: svgContent }}
            />
          </div>
        </div>
      )}
    </>
  );
};

const markdownComponents: Components = {
  // Headings with dynamic anchor IDs matching Table of Contents
  h1: ({ children }) => {
    const text = getNodeText(children).trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    return (
      <h1
        id={id}
        className="scroll-mt-24 mt-8 mb-4 text-[22px] sm:text-[26px] font-medium tracking-tight text-navy dark:text-white border-b border-edge pb-2"
      >
        {children}
      </h1>
    );
  },

  h2: ({ children }) => {
    const text = getNodeText(children).trim();
    const cleanTitle = text.replace(/^\d+\.\s*/, '').trim();
    const id = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const isReferenceHeading = /^(?:authoritative\s+|canonical\s+|official\s+)?references(?:\s+(?:&|and).*)?$/i.test(cleanTitle);

    if (isReferenceHeading) {
      return (
        <h2
          id={id}
          className="scroll-mt-24 mt-10 mb-3 text-[18px] sm:text-[21px] font-medium tracking-tight border-b border-[#3e5199]/40 dark:border-focus-blue/40 pb-2 flex items-center justify-between group bg-gradient-to-r from-[#3e5199]/10 via-[#5568ad]/5 to-transparent dark:from-[#3e5199]/25 dark:via-[#5568ad]/10 dark:to-transparent px-3 py-2.5 rounded-t-[8px] border-l-[3.5px] border-l-[#3e5199] dark:border-l-focus-blue transition-all"
        >
          <a
            href={`#${id}`}
            className="flex items-center gap-2 text-[#3e5199] dark:text-ice font-semibold hover:text-navy dark:hover:text-white hover:underline decoration-[#3e5199]/70 dark:decoration-focus-blue/70 underline-offset-4 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px] text-[#3e5199] dark:text-focus-blue select-none">
              menu_book
            </span>
            <span>{children}</span>
          </a>
          <a
            href={`#${id}`}
            className="opacity-0 group-hover:opacity-100 text-muted-ink hover:text-navy dark:hover:text-white transition-opacity text-[14px] font-mono"
            aria-label="Link to section"
          >
            #
          </a>
        </h2>
      );
    }

    return (
      <h2
        id={id}
        className="scroll-mt-24 mt-10 mb-3 text-[18px] sm:text-[21px] text-navy dark:text-white font-medium tracking-tight border-b border-edge pb-2 flex items-center justify-between group"
      >
        <span>{children}</span>
        <a
          href={`#${id}`}
          className="opacity-0 group-hover:opacity-100 text-muted-ink hover:text-navy dark:hover:text-white transition-opacity text-[14px] font-mono"
          aria-label="Link to section"
        >
          #
        </a>
      </h2>
    );
  },

  h3: ({ children }) => {
    const text = getNodeText(children).trim();
    const cleanTitle = text.replace(/^\d+\.\s*/, '').trim();
    const id = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
    const isReferenceHeading = /^(?:authoritative\s+|canonical\s+|official\s+)?references(?:\s+(?:&|and).*)?$/i.test(cleanTitle);

    if (isReferenceHeading) {
      return (
        <h3
          id={id}
          className="scroll-mt-24 mt-7 mb-2.5 text-[15px] sm:text-[17px] font-medium flex items-center justify-between group bg-[#3e5199]/10 dark:bg-[#3e5199]/20 px-2.5 py-1.5 rounded-[6px] border-l-[3px] border-l-[#3e5199] dark:border-l-focus-blue transition-all"
        >
          <a
            href={`#${id}`}
            className="flex items-center gap-1.5 text-[#3e5199] dark:text-ice font-semibold hover:text-navy dark:hover:text-white hover:underline decoration-[#3e5199]/70 dark:decoration-focus-blue/70 underline-offset-4 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px] text-[#3e5199] dark:text-focus-blue select-none">
              menu_book
            </span>
            <span>{children}</span>
          </a>
          <a
            href={`#${id}`}
            className="opacity-0 group-hover:opacity-100 text-muted-ink hover:text-navy dark:hover:text-white transition-opacity text-[13px] font-mono"
            aria-label="Link to subsection"
          >
            #
          </a>
        </h3>
      );
    }

    return (
      <h3
        id={id}
        className="scroll-mt-24 mt-7 mb-2.5 text-[15px] sm:text-[17px] text-navy dark:text-white font-medium flex items-center justify-between group"
      >
        <span>{children}</span>
        <a
          href={`#${id}`}
          className="opacity-0 group-hover:opacity-100 text-muted-ink hover:text-navy dark:hover:text-white transition-opacity text-[13px] font-mono"
          aria-label="Link to subsection"
        >
          #
        </a>
      </h3>
    );
  },

  h4: ({ children }) => {
    const text = getNodeText(children).trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    return (
      <h4
        id={id}
        className="scroll-mt-24 mt-5 mb-2 text-[14px] sm:text-[15px] text-navy dark:text-white font-medium"
      >
        {children}
      </h4>
    );
  },

  h5: ({ children }) => (
    <h5 className="mt-4 mb-2 text-[12.5px] sm:text-[13px] font-medium text-secondary-ink dark:text-ash uppercase tracking-wider font-mono">
      {children}
    </h5>
  ),

  h6: ({ children }) => (
    <h6 className="mt-4 mb-2 text-[12px] font-medium text-muted-ink uppercase tracking-wider font-mono">
      {children}
    </h6>
  ),

  p: ({ children }) => (
    <p className="my-4 text-body-ink leading-relaxed text-[15px] sm:text-[15.5px]">
      {children}
    </p>
  ),

  code: ({ className: codeClassName, children, node, ...props }) => {
    const match = /language-(\w+)/.exec(codeClassName || '');
    const isInline = !match && !String(children).includes('\n');

    if (isInline) {
      return (
        <code
          className="rounded-[4px] bg-canvas dark:bg-[#121620] border border-edge px-1.5 py-0.5 font-mono text-[12px] text-navy dark:text-ice"
          {...props}
        >
          {children}
        </code>
      );
    }

    const rawCode = String(children).replace(/\n$/, '');
    const isBoxArt = /[\u2500-\u257F\u2580-\u259F┌─┐│└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬]/.test(rawCode);
    const lang = match ? match[1] : (isBoxArt ? 'text' : 'bash');
    const meta = (node?.data as any)?.meta || '';
    const titleMatch = meta.match(/title="([^"]+)"/);
    const filename = titleMatch ? titleMatch[1] : undefined;

    return (
      <CodeBlock
        code={rawCode}
        language={lang}
        filename={filename}
        className="my-6 shadow-catalog-edge"
      />
    );
  },

  pre: ({ children }) => <>{children}</>,

  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-focus-blue dark:border-focus-blue pl-4 italic text-body-charcoal dark:text-body-ink text-[15px]">
      {children}
    </blockquote>
  ),

  ul: ({ children, className }) => {
    const isTaskList = className?.includes('contains-task-list');
    return (
      <ul
        className={cn(
          'my-4 space-y-2 text-body-ink text-[15px]',
          isTaskList ? 'list-none pl-0' : 'list-disc list-inside'
        )}
      >
        {children}
      </ul>
    );
  },
  ol: ({ children }) => (
    <ol className="my-4 space-y-2 list-decimal list-inside text-body-ink text-[15px]">
      {children}
    </ol>
  ),
  li: ({ children, className }) => {
    const isTaskItem = className?.includes('task-list-item');
    if (isTaskItem) {
      return (
        <li className="flex items-start gap-3 p-3.5 rounded-[8px] bg-canvas dark:bg-[#121620] border border-edge leading-relaxed my-2">
          {children}
        </li>
      );
    }
    return <li className="leading-relaxed">{children}</li>;
  },
  input: ({ type, checked, disabled, ...props }) => {
    if (type === 'checkbox') {
      return (
        <span className="material-symbols-outlined text-[18px] text-proof-green shrink-0 mt-0.5 select-none">
          {checked ? 'check_circle' : 'radio_button_unchecked'}
        </span>
      );
    }
    return <input type={type} checked={checked} disabled={disabled} {...props} />;
  },

  table: ({ children }) => (
    <div className="my-8 overflow-x-auto rounded-[8px] border border-edge bg-white dark:bg-panel shadow-catalog-edge">
      <table className="w-full text-left font-mono text-[13px]">
        {children}
      </table>
    </div>
  ),
  img: ({ src, alt, title }) => {
    const rawSrc = typeof src === 'string' ? src : '';
    const basePrefix = import.meta.env.BASE_URL.replace(/\/$/, '');
    const resolvedSrc =
      rawSrc.startsWith('/') && !rawSrc.startsWith('//') && basePrefix
        ? `${basePrefix}${rawSrc}`
        : rawSrc;

    return <DiagramFigure src={resolvedSrc} alt={alt} title={title} />;
  },
  thead: ({ children }) => (
    <thead className="bg-canvas border-b border-edge text-navy dark:text-white font-medium">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-edge text-secondary-ink dark:text-ash">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-canvas transition-colors">
      {children}
    </tr>
  ),
  th: ({ children }) => <th className="p-3 font-medium">{children}</th>,
  td: ({ children }) => <td className="p-3">{children}</td>,
};

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className,
}) => {
  const sanitizedContent = React.useMemo(() => sanitizeLatexArtifacts(content), [content]);
  const blocks = parseContentBlocks(sanitizedContent);

  return (
    <div className={cn('markdown-content prose max-w-none text-body-ink', className)}>
      {blocks.map((block, idx) => {
        if (block.type === 'markdown') {
          return (
            <ReactMarkdown
              key={idx}
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {block.content}
            </ReactMarkdown>
          );
        }

        if (block.type === 'callout') {
          let iconName = 'info';
          let borderStyle =
            'border-focus-blue/50 bg-ice/20 text-navy dark:text-ice';
          let badgeColor = 'text-navy dark:text-ice';

          if (block.calloutType === 'warning') {
            iconName = 'warning';
            borderStyle =
              'border-customer-ember/40 bg-customer-ember/10 text-body-charcoal dark:text-body-ink';
            badgeColor = 'text-customer-ember';
          } else if (block.calloutType === 'danger') {
            iconName = 'error';
            borderStyle =
              'border-red-500/40 bg-red-500/10 text-red-900 dark:text-red-300';
            badgeColor = 'text-red-600 dark:text-red-400';
          } else if (block.calloutType === 'tip') {
            iconName = 'lightbulb';
            borderStyle =
              'border-proof-green/40 bg-proof-green/10 text-body-charcoal dark:text-body-ink';
            badgeColor = 'text-proof-green';
          }

          return (
            <div
              key={idx}
              className={cn(
                'my-6 p-4 rounded-[8px] border shadow-catalog-edge',
                borderStyle
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('material-symbols-outlined text-[18px]', badgeColor)}>
                  {iconName}
                </span>
                <span className="font-mono text-[11.5px] uppercase font-semibold tracking-wide">
                  {block.title || block.calloutType}
                </span>
              </div>
              <div className="text-secondary-ink dark:text-ash text-[13.5px] leading-relaxed">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {block.content}
                </ReactMarkdown>
              </div>
            </div>
          );
        }

        if (block.type === 'figure') {
          return (
            <div
              key={idx}
              className="my-8 rounded-[8px] border border-edge bg-white dark:bg-panel p-0 text-center shadow-catalog-edge overflow-hidden"
            >
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={markdownComponents}
              >
                {block.content}
              </ReactMarkdown>
            </div>
          );
        }

        if (block.type === 'formula') {
          return (
            <div
              key={idx}
              className="my-3.5 px-4 py-2.5 rounded-[6px] border border-edge bg-canvas shadow-catalog-edge w-fit min-w-[220px] max-w-full mx-auto"
            >
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-ink mb-1 font-medium">
                {block.title}
              </div>
              <div className="text-center font-mono text-[13.5px] text-navy dark:text-white py-0.5">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={markdownComponents}
                >
                  {block.content}
                </ReactMarkdown>
              </div>
            </div>
          );
        }

        if (block.type === 'svg') {
          return (
            <div
              key={idx}
              className="my-8 rounded-[8px] border border-edge bg-white dark:bg-panel p-0 flex justify-center shadow-catalog-edge overflow-hidden [&>svg]:w-full [&>svg]:h-auto [&>svg]:block"
              dangerouslySetInnerHTML={{ __html: block.content }}
            />
          );
        }

        if (block.type === 'interactive') {
          if (block.widget === 'pool-calculator' || block.widget === 'calculator') {
            return (
              <div key={idx} className="my-8">
                <PoolCalculator />
              </div>
            );
          }
          return null;
        }

        return null;
      })}
    </div>
  );
};

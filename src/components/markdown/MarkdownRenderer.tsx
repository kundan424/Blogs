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
  | { type: 'interactive'; widget: string };

/**
 * Automatically cleans stray LaTeX notation (e.g. \text{...}, \times, $...$)
 * outside code blocks so that unparsed LaTeX math renders as clean text.
 */
function sanitizeLatexArtifacts(raw: string): string {
  // Only sanitize outside of triple-backtick code fences
  const parts = raw.split(/(```[\s\S]*?```)/g);
  return parts
    .map((part, index) => {
      // Odd indices are code fences: preserve completely as-is
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
  // Match :::directive{attrs} ... :::
  const directiveRegex = /:::(callout|figure|formula|interactive)(?:\{([^}]*)\})?\r?\n([\s\S]*?)\r?\n:::/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = directiveRegex.exec(raw)) !== null) {
    if (match.index > lastIndex) {
      const textBefore = raw.slice(lastIndex, match.index).trim();
      if (textBefore) {
        blocks.push({ type: 'markdown', content: textBefore });
      }
    }

    const directiveType = match[1];
    const attrsString = match[2] || '';
    const body = match[3];

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

    lastIndex = directiveRegex.lastIndex;
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

const markdownComponents: Components = {
  // Headings with dynamic anchor IDs matching Table of Contents
  h2: ({ children }) => {
    const text = getNodeText(children).trim();
    const cleanTitle = text.replace(/^\d+\.\s*/, '').trim();
    const id = cleanTitle
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    return (
      <h2
        id={id}
        className="scroll-mt-24 mt-12 mb-4 font-headline-md text-headline-md text-ink font-light border-b border-stone/50 dark:border-[#2e2924] pb-2 flex items-center justify-between group"
      >
        <span>{children}</span>
        <a
          href={`#${id}`}
          className="opacity-0 group-hover:opacity-100 text-smoke hover:text-ink transition-opacity text-[16px] font-mono-data"
          aria-label="Link to section"
        >
          #
        </a>
      </h2>
    );
  },

  h3: ({ children }) => {
    const text = getNodeText(children).trim();
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

    return (
      <h3
        id={id}
        className="scroll-mt-24 mt-8 mb-3 font-headline-sm text-headline-sm text-ink font-normal"
      >
        {children}
      </h3>
    );
  },

  p: ({ children }) => (
    <p className="my-4 font-body-md text-body-md text-graphite dark:text-[#d4cfc9] leading-relaxed">
      {children}
    </p>
  ),

  code: ({ className: codeClassName, children, node, ...props }) => {
    const match = /language-(\w+)/.exec(codeClassName || '');
    const isInline = !match && !String(children).includes('\n');

    if (isInline) {
      return (
        <code
          className="rounded bg-warm-taupe dark:bg-[#221f1b] border border-stone/60 dark:border-[#332e27] px-1.5 py-0.5 font-mono-data text-[12px] text-ink dark:text-[#f8efe5]"
          {...props}
        >
          {children}
        </code>
      );
    }

    const rawCode = String(children).replace(/\n$/, '');
    const lang = match ? match[1] : 'bash';
    const meta = (node?.data as any)?.meta || '';
    const titleMatch = meta.match(/title="([^"]+)"/);
    const filename = titleMatch ? titleMatch[1] : undefined;

    return (
      <CodeBlock
        code={rawCode}
        language={lang}
        filename={filename}
        className="my-6 shadow-sm"
      />
    );
  },

  pre: ({ children }) => <>{children}</>,

  blockquote: ({ children }) => (
    <blockquote className="my-6 border-l-2 border-ink dark:border-[#d4cfc9] pl-4 italic text-graphite dark:text-[#a19a91] font-body-md">
      {children}
    </blockquote>
  ),

  ul: ({ children, className }) => {
    const isTaskList = className?.includes('contains-task-list');
    return (
      <ul
        className={cn(
          'my-4 space-y-2 text-graphite dark:text-[#d4cfc9] font-body-md',
          isTaskList ? 'list-none pl-0' : 'list-disc list-inside'
        )}
      >
        {children}
      </ul>
    );
  },
  ol: ({ children }) => (
    <ol className="my-4 space-y-2 list-decimal list-inside text-graphite dark:text-[#d4cfc9] font-body-md">
      {children}
    </ol>
  ),
  li: ({ children, className }) => {
    const isTaskItem = className?.includes('task-list-item');
    if (isTaskItem) {
      return (
        <li className="flex items-start gap-3 p-3.5 rounded-xl bg-warm-taupe/60 dark:bg-[#1a1815] border border-stone/70 dark:border-[#332e27] leading-relaxed my-2">
          {children}
        </li>
      );
    }
    return <li className="leading-relaxed">{children}</li>;
  },
  input: ({ type, checked, disabled, ...props }) => {
    if (type === 'checkbox') {
      return (
        <span className="material-symbols-outlined text-[18px] text-violet-spark shrink-0 mt-0.5 select-none">
          {checked ? 'check_circle' : 'radio_button_unchecked'}
        </span>
      );
    }
    return <input type={type} checked={checked} disabled={disabled} {...props} />;
  },

  table: ({ children }) => (
    <div className="my-8 overflow-x-auto rounded-xl border border-stone/80 dark:border-[#332e27] bg-surface-container-lowest dark:bg-[#141210] shadow-sm">
      <table className="w-full text-left font-mono-data text-label-sm">
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

    return (
      <figure className="my-8 rounded-2xl overflow-hidden border border-stone/80 dark:border-[#332e27] bg-surface-container-lowest dark:bg-[#1a1815] shadow-sm">
        <div className="p-3 sm:p-6 flex justify-center bg-stone/20 dark:bg-[#141210]">
          <img
            src={resolvedSrc}
            alt={alt || 'Technical architectural diagram'}
            className="rounded-xl max-h-[520px] w-auto object-contain shadow-xs"
            loading="lazy"
          />
        </div>
        {(alt || title) && (
          <figcaption className="p-3.5 text-center font-mono-data text-label-sm text-smoke border-t border-stone/60 dark:border-[#2e2924] bg-warm-taupe/40 dark:bg-[#181614]">
            <span className="font-semibold text-ink dark:text-white mr-1.5 uppercase tracking-wider text-[11px]">
              ARCHITECTURAL DIAGRAM:
            </span>
            {alt || title}
          </figcaption>
        )}
      </figure>
    );
  },
  thead: ({ children }) => (
    <thead className="bg-warm-taupe dark:bg-[#1c1a17] border-b border-stone/80 dark:border-[#332e27] text-ink font-medium">
      {children}
    </thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-stone/50 dark:divide-[#2e2924] text-graphite dark:text-[#d4cfc9]">
      {children}
    </tbody>
  ),
  tr: ({ children }) => (
    <tr className="hover:bg-warm-taupe/40 dark:hover:bg-[#1f1c18] transition-colors">
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
    <div className={cn('markdown-content prose max-w-none text-ink', className)}>
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
            'border-violet-spark/40 dark:border-violet-spark/30 bg-violet-spark/5 dark:bg-[#141e3b]/30';
          let badgeColor = 'text-violet-spark dark:text-[#5480ff]';

          if (block.calloutType === 'warning') {
            iconName = 'warning';
            borderStyle =
              'border-ember-orange/40 dark:border-ember-orange/30 bg-ember-orange/5 dark:bg-[#36170d]/30';
            badgeColor = 'text-ember-orange dark:text-[#ff7547]';
          } else if (block.calloutType === 'danger') {
            iconName = 'error';
            borderStyle =
              'border-red-500/40 dark:border-red-500/30 bg-red-500/5 dark:bg-red-950/20';
            badgeColor = 'text-red-500';
          } else if (block.calloutType === 'tip') {
            iconName = 'lightbulb';
            borderStyle =
              'border-emerald-500/40 dark:border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/20';
            badgeColor = 'text-emerald-500';
          }

          return (
            <div
              key={idx}
              className={cn(
                'my-6 p-4 rounded-xl border text-ink shadow-sm',
                borderStyle
              )}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={cn('material-symbols-outlined text-[18px]', badgeColor)}>
                  {iconName}
                </span>
                <span className="font-mono-data text-label-sm uppercase font-semibold tracking-wide">
                  {block.title || block.calloutType}
                </span>
              </div>
              <div className="font-body-md text-graphite dark:text-[#d4cfc9] text-[13.5px] leading-relaxed">
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
              className="my-8 rounded-xl border border-stone/80 dark:border-[#332e27] bg-surface-container-lowest dark:bg-[#141210] p-4 text-center shadow-sm"
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
              className="my-6 p-5 rounded-xl border border-stone/80 dark:border-[#332e27] bg-warm-taupe/60 dark:bg-[#1a1815] shadow-sm"
            >
              <div className="font-mono-data text-label-sm uppercase text-smoke mb-3 font-medium">
                {block.title}
              </div>
              <div className="text-center font-mono-data text-[15px] text-ink py-2">
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

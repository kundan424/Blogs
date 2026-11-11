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
    const id = text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');

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

    return (
      <figure className="my-8 rounded-[8px] overflow-hidden border border-edge bg-canvas shadow-catalog-edge">
        <div className="p-3 sm:p-6 flex justify-center bg-canvas">
          <img
            src={resolvedSrc}
            alt={alt || 'Technical architectural diagram'}
            className="rounded-[6px] max-h-[520px] w-auto object-contain shadow-xs"
            loading="lazy"
          />
        </div>
        {(alt || title) && (
          <figcaption className="p-3 text-center font-mono text-[11px] text-muted-ink border-t border-edge bg-white dark:bg-panel">
            <span className="font-semibold text-navy dark:text-white mr-1.5 uppercase tracking-wider text-[11px]">
              ARCHITECTURAL DIAGRAM:
            </span>
            {alt || title}
          </figcaption>
        )}
      </figure>
    );
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
              className="my-8 rounded-[8px] border border-edge bg-canvas p-4 text-center shadow-catalog-edge"
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
              className="my-6 p-5 rounded-[8px] border border-edge bg-canvas shadow-catalog-edge"
            >
              <div className="font-mono text-[11px] uppercase tracking-wider text-muted-ink mb-3 font-medium">
                {block.title}
              </div>
              <div className="text-center font-mono text-[14px] text-navy dark:text-white py-2">
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

import React, { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

// Tokenizer for code block syntax highlighting matching the modern IDE screenshot
function highlightCode(code: string, language: string): React.ReactNode {
  const lang = (language || '').toLowerCase().trim();
  const isBoxArt = /[\u2500-\u257F\u2580-\u259F┌─┐│└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬]/.test(code);

  // If text, ascii, raw diagram, or contains box drawing characters, return plain text
  if (['text', 'txt', 'ascii', 'none', 'plain', 'diagram'].includes(lang) || isBoxArt) {
    return code;
  }

  // Token regex for Java, TypeScript, JavaScript, SQL, C++, Go
  const tokenRegex =
    /(\/\*[\s\S]*?\*\/|\/\/[^\n]*|#[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|`(?:\\.|[^`\\])*`)|(@\w+)|(\b(?:public|private|protected|static|final|abstract|class|interface|enum|record|extends|implements|return|if|else|switch|case|default|while|do|for|break|continue|throw|throws|try|catch|finally|new|this|super|instanceof|synchronized|volatile|transient|native|package|import|boolean|byte|short|int|long|float|double|char|void|null|true|false|const|let|var|function|async|await|type|export|from|as|of|in|yield)\b)|(\b[A-Z][a-zA-Z0-9_$]*\b)|(\b\d+(?:\.\d+)?[fLdF]?\b)|([a-zA-Z_$][a-zA-Z0-9_$]*(?=\s*\())/g;

  const lines = code.split('\n');

  return lines.map((line, lineIdx) => {
    let lastIndex = 0;
    const elements: React.ReactNode[] = [];
    let match: RegExpExecArray | null;

    tokenRegex.lastIndex = 0;
    while ((match = tokenRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        elements.push(
          <span key={`text-${lineIdx}-${lastIndex}`} className="text-[#e2e8f0]">
            {line.slice(lastIndex, match.index)}
          </span>
        );
      }

      const [full, comment, stringVal, annotation, keyword, typeName, numberVal, methodCall] = match;

      if (comment) {
        elements.push(
          <span key={`c-${lineIdx}-${match.index}`} className="text-[#64748b] italic font-normal">
            {comment}
          </span>
        );
      } else if (stringVal) {
        elements.push(
          <span key={`s-${lineIdx}-${match.index}`} className="text-[#86efac]">
            {stringVal}
          </span>
        );
      } else if (annotation) {
        elements.push(
          <span key={`a-${lineIdx}-${match.index}`} className="text-[#fde047] font-medium">
            {annotation}
          </span>
        );
      } else if (keyword) {
        elements.push(
          <span key={`k-${lineIdx}-${match.index}`} className="text-[#c084fc] font-normal">
            {keyword}
          </span>
        );
      } else if (typeName) {
        elements.push(
          <span key={`t-${lineIdx}-${match.index}`} className="text-[#7dd3fc] font-normal">
            {typeName}
          </span>
        );
      } else if (numberVal) {
        elements.push(
          <span key={`n-${lineIdx}-${match.index}`} className="text-[#fb923c]">
            {numberVal}
          </span>
        );
      } else if (methodCall) {
        elements.push(
          <span key={`m-${lineIdx}-${match.index}`} className="text-[#93c5fd]">
            {methodCall}
          </span>
        );
      } else {
        elements.push(
          <span key={`f-${lineIdx}-${match.index}`} className="text-[#e2e8f0]">
            {full}
          </span>
        );
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      elements.push(
        <span key={`end-${lineIdx}-${lastIndex}`} className="text-[#e2e8f0]">
          {line.slice(lastIndex)}
        </span>
      );
    }

    return (
      <div key={lineIdx} className="leading-[1.72] min-h-[22px]">
        {elements.length > 0 ? elements : <span>&nbsp;</span>}
      </div>
    );
  });
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code: rawCode,
  language = 'java',
  filename,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

  // Normalize non-breaking spaces (\u00A0) and zero-width characters to standard spaces
  const code = useMemo(() => {
    return (rawCode || '').replace(/\u00a0/g, ' ').replace(/[\u200B-\u200D\uFEFF]/g, '');
  }, [rawCode]);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    showToast('Code snippet copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const highlightedContent = useMemo(
    () => highlightCode(code, language),
    [code, language]
  );

  const isAsciiDiagram = useMemo(() => {
    const lang = (language || '').toLowerCase().trim();
    const isBoxArt = /[\u2500-\u257F\u2580-\u259F┌─┐│└┘├┤┬┴┼═║╔╗╚╝╠╣╦╩╬]/.test(code);
    const isAsciiTable =
      ['text', 'txt', 'ascii', 'diagram', 'plain'].includes(lang) &&
      /(\+[–\-=_]{2,}\+|\|[\s\S]*?\|)/.test(code);
    return isBoxArt || isAsciiTable;
  }, [code, language]);

  return (
    <div
      className={cn(
        'group relative my-6 rounded-[8px] overflow-hidden bg-[#0c0d12] border border-[#1b1c28] text-[#e2e8f0] shadow-catalog-edge',
        className
      )}
    >
      {/* Show header bar ONLY when an explicit filename is provided */}
      {filename ? (
        <div className="flex items-center justify-between px-5 py-2.5 bg-[#0e1017] border-b border-[#1b1d28] font-mono text-[12px] text-[#818cf8]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[15px] text-[#a78bfa]">
              code
            </span>
            <span className="text-[#cbd5e1] font-medium tracking-tight">{filename}</span>
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[#94a3b8] hover:text-[#f8fafc] hover:bg-[#1a1c28] transition-all"
            title="Copy code snippet"
          >
            <span className="material-symbols-outlined text-[15px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span className="text-[11px] font-mono">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      ) : (
        /* Floating hover copy button when no header bar is present (matches modern developer IDE screenshot) */
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-3 top-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#141520]/85 backdrop-blur-md border border-[#23263b] text-[#94a3b8] hover:text-white hover:bg-[#1f2235] opacity-0 group-hover:opacity-100 transition-all text-[11px] font-mono shadow-md"
          title="Copy code snippet"
        >
          <span className="material-symbols-outlined text-[14px]">
            {copied ? 'check' : 'content_copy'}
          </span>
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      )}

      {/* Code Text Area: switches to monospace box-drawing font with tight line height for ASCII art */}
      <pre
        className={cn(
          'p-5 overflow-x-auto text-[#e2e8f0] selection:bg-[#3b2d54] selection:text-[#f5f3ff]',
          isAsciiDiagram
            ? 'text-[12.5px] sm:text-[13px] leading-[1.18] tracking-normal'
            : 'text-[13.5px] font-mono leading-[1.75] tracking-[-0.01em]'
        )}
        style={
          isAsciiDiagram
            ? {
                fontFamily:
                  "'Cascadia Code', 'Consolas', 'Menlo', 'Monaco', 'Courier New', 'DejaVu Sans Mono', monospace",
                lineHeight: '1.18',
                letterSpacing: '0px',
                fontFeatureSettings: 'normal',
                fontVariantLigatures: 'none',
              }
            : {
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Geist Mono', ui-monospace, monospace",
                fontFeatureSettings: "'liga' 1, 'calt' 1",
              }
        }
      >
        <code>{highlightedContent}</code>
      </pre>
    </div>
  );
};

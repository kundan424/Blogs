import React, { useState, useMemo } from 'react';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

// Tokenizer for code block syntax highlighting
function highlightCode(code: string, language: string): React.ReactNode {
  const lang = (language || '').toLowerCase().trim();

  // If text, ascii, or unsupported raw diagram, return plain text
  if (['text', 'txt', 'ascii', 'none', 'plain'].includes(lang)) {
    return code;
  }

  // Token regex for Java, TypeScript, JavaScript, C++, C#
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
        elements.push(line.slice(lastIndex, match.index));
      }

      const [full, comment, stringVal, annotation, keyword, typeName, numberVal, methodCall] = match;

      if (comment) {
        elements.push(
          <span key={`${lineIdx}-${match.index}`} className="text-[#8b949e] italic">
            {comment}
          </span>
        );
      } else if (stringVal) {
        elements.push(
          <span key={`${lineIdx}-${match.index}`} className="text-[#7ee787]">
            {stringVal}
          </span>
        );
      } else if (annotation) {
        elements.push(
          <span key={`${lineIdx}-${match.index}`} className="text-[#e3b341] font-semibold">
            {annotation}
          </span>
        );
      } else if (keyword) {
        elements.push(
          <span key={`${lineIdx}-${match.index}`} className="text-[#ff7b72] font-medium">
            {keyword}
          </span>
        );
      } else if (typeName) {
        elements.push(
          <span key={`${lineIdx}-${match.index}`} className="text-[#79c0ff]">
            {typeName}
          </span>
        );
      } else if (numberVal) {
        elements.push(
          <span key={`${lineIdx}-${match.index}`} className="text-[#ffa657]">
            {numberVal}
          </span>
        );
      } else if (methodCall) {
        elements.push(
          <span key={`${lineIdx}-${match.index}`} className="text-[#d2a8ff]">
            {methodCall}
          </span>
        );
      } else {
        elements.push(full);
      }

      lastIndex = tokenRegex.lastIndex;
    }

    if (lastIndex < line.length) {
      elements.push(line.slice(lastIndex));
    }

    return (
      <div key={lineIdx} className="table-row">
        <span className="table-cell pr-4 select-none text-right font-mono text-[11px] text-[#484f58] w-8">
          {lineIdx + 1}
        </span>
        <span className="table-cell">{elements.length > 0 ? elements : ' '}</span>
      </div>
    );
  });
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'yaml',
  filename,
  className,
}) => {
  const [copied, setCopied] = useState(false);
  const { showToast } = useToast();

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

  return (
    <div
      className={cn(
        'relative my-6 rounded-xl overflow-hidden bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] shadow-lg',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-[#30363d] font-mono-data text-label-sm text-[#8b949e]">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          {filename && <span className="ml-2 text-[#e6edf3] font-medium">{filename}</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[#8b949e] uppercase text-[11px] font-semibold tracking-wider">
            {language}
          </span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-[#8b949e] hover:text-[#f0f6fc] transition-colors"
            title="Copy snippet"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span className="text-[11px] font-mono-data">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto text-[13px] font-mono leading-relaxed text-[#e6edf3]">
        <div className="table w-full">{highlightedContent}</div>
      </pre>
    </div>
  );
};

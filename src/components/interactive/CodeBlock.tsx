import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext';
import { cn } from '../../utils/cn';

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
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

  return (
    <div
      className={cn(
        'relative my-6 rounded-xl overflow-hidden bg-[#161616] border border-stone/20 text-[#eaeaea] shadow-md',
        className
      )}
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-[#202020] border-b border-stone/10 font-mono-data text-label-sm text-smoke">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
          {filename && <span className="ml-2 text-ash">{filename}</span>}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-ash uppercase">{language}</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 text-smoke hover:text-white transition-colors"
            title="Copy snippet"
          >
            <span className="material-symbols-outlined text-[16px]">
              {copied ? 'check' : 'content_copy'}
            </span>
            <span className="text-[11px] font-mono-data">{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
      </div>
      <pre className="p-4 overflow-x-auto text-body-sm font-mono-data leading-relaxed text-[#f0ede6]">
        <code>{code}</code>
      </pre>
    </div>
  );
};

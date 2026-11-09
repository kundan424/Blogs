import React, { useState, useMemo } from 'react';
import { getEnrichedTopics } from '../../utils/contentLoader';
import { useToast } from '../../context/ToastContext';

interface HomeSidebarProps {
  onSelectTopic?: (tag: string) => void;
  activeTopic?: string;
}

export const HomeSidebar: React.FC<HomeSidebarProps> = ({
  onSelectTopic,
  activeTopic,
}) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const { showToast } = useToast();

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    showToast('Subscribed to Sunday Zero Noise Memo');
  };

  const popularTopics = useMemo(() => {
    return getEnrichedTopics().slice(0, 8).map((t) => ({
      tag: t.slug,
      name: t.name,
      count: t.count,
    }));
  }, []);

  return (
    <aside className="space-y-6 lg:col-span-4">
      <div className="sticky top-24 space-y-6">
        {/* Popular Topics Tag Cloud with Post Counts */}
        <div className="rounded-[20px] bg-panel dark:bg-[#1f1e1a] p-6 border border-edge/80 dark:border-stone/30">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-sans text-[17px] font-medium text-strong dark:text-white">Popular Topics</h4>
            <span className="font-mono text-[11px] text-muted">Index v2.4</span>
          </div>
          <p className="text-[13px] text-muted dark:text-ash mb-4">
            Click any tag to dynamically cross-reference notes in the feed.
          </p>
          <div className="flex flex-wrap gap-2">
            {popularTopics.map((pt) => {
              const isActive = activeTopic === pt.tag;
              return (
                <button
                  key={pt.tag}
                  type="button"
                  onClick={() => onSelectTopic && onSelectTopic(pt.tag)}
                  className={`group flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-left transition-all border ${
                    isActive
                      ? 'bg-strong text-white border-strong dark:bg-white dark:text-strong'
                      : 'bg-canvas dark:bg-[#141310] border-edge dark:border-stone/30 text-footer-text dark:text-ash hover:border-filter-edge hover:text-strong dark:hover:text-white'
                  }`}
                >
                  <span className="font-mono text-[12px] font-medium">
                    #{pt.name}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.5 font-mono text-[10px] ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-strong'
                        : 'bg-stone/40 dark:bg-stone/20 text-muted'
                    }`}
                  >
                    {pt.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Weekly Technical Newsletter Box */}
        <div className="rounded-[20px] bg-panel dark:bg-[#1f1e1a] p-6 border border-edge/80 dark:border-stone/30">
          <span className="font-mono text-[12px] font-medium text-muted uppercase tracking-wider block mb-1">
            WEEKLY SYNTHESIS
          </span>
          <h4 className="text-[17px] font-medium text-strong dark:text-white">
            Zero Noise Engineering Memo
          </h4>
          <p className="mt-1 text-[13px] text-muted dark:text-ash leading-relaxed">
            Condensed architectural learnings, concurrency post-mortems, and performance profiling tools delivered each Sunday morning.
          </p>

          <form onSubmit={handleSubscribe} className="mt-4 space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="engineer@domain.com"
              required
              className="w-full rounded-[8px] bg-canvas dark:bg-[#141310] px-3.5 py-2.5 font-mono text-[13px] text-strong dark:text-white placeholder:text-muted/70 focus:outline-none focus:border-accent border border-edge dark:border-stone/30 shadow-2xs"
            />
            <button
              type="submit"
              style={{ backgroundColor: '#ff3c00', color: '#ffffff' }}
              className="btn-primary-accent w-full rounded-[8px] bg-[#ff3c00] h-[40px] font-sans text-[14px] font-medium text-white hover:bg-[#e03500] hover:opacity-95 transition-all cursor-pointer shadow-xs"
            >
              Subscribe to Digest
            </button>
            {subscribed && (
              <div className="mt-2 font-mono text-[12px] text-accent flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check</span>
                Dispatch added to delivery registry.
              </div>
            )}
          </form>
        </div>
      </div>
    </aside>
  );
};

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
    <aside className="space-y-space-lg lg:col-span-4">
      <div className="sticky top-20 space-y-space-lg">
        {/* Popular Topics Tag Cloud with Post Counts */}
        <div className="rounded-xl bg-warm-taupe dark:bg-[#1a1815] p-space-lg shadow-sm border border-stone/80 dark:border-[#332e27]">
          <div className="flex items-center justify-between mb-space-sm">
            <h4 className="font-title-md text-title-md text-ink">Popular Topics</h4>
            <span className="font-mono-data text-label-sm text-smoke">Index v2.4</span>
          </div>
          <p className="font-body-sm text-body-sm text-smoke mb-space-md">
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
                  className={`group flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-left transition-all border border-stone/60 dark:border-[#332e27] ${
                    isActive
                      ? 'bg-ink text-on-primary'
                      : 'bg-surface-container-lowest dark:bg-[#201d19] hover:bg-ink hover:text-on-primary'
                  }`}
                >
                  <span className="font-mono-data text-label-sm font-medium">
                    {pt.name}
                  </span>
                  <span
                    className={`rounded px-1.5 py-0.2 font-mono-data text-label-sm ${
                      isActive
                        ? 'bg-graphite text-on-primary'
                        : 'bg-warm-taupe dark:bg-[#151311] text-smoke group-hover:bg-graphite group-hover:text-on-primary'
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
        <div className="rounded-xl bg-surface-container-lowest dark:bg-[#1a1815] p-space-lg shadow-sm border border-stone/80 dark:border-[#332e27]">
          <span className="font-mono-data text-label-sm text-smoke uppercase tracking-wider">
            WEEKLY SYNTHESIS
          </span>
          <h4 className="mt-space-xs font-title-md text-title-md text-ink">
            Zero Noise Engineering Memo
          </h4>
          <p className="mt-space-xs font-body-sm text-body-sm text-smoke leading-relaxed">
            Condensed architectural learnings, concurrency post-mortems, and performance profiling tools delivered each Sunday morning.
          </p>

          <form onSubmit={handleSubscribe} className="mt-space-md space-y-space-xs">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="engineer@domain.com"
              required
              className="w-full rounded-lg bg-warm-taupe dark:bg-[#2c2927] px-3 py-2 font-mono-data text-label-md text-ink placeholder:text-smoke focus:outline-none focus:bg-surface-container-lowest border border-stone/60 dark:border-[#332e27] shadow-sm"
            />
            <button
              type="submit"
              className="w-full rounded-full bg-ink py-2 font-label-md text-label-md text-on-primary hover:bg-graphite transition-colors shadow-sm"
            >
              Subscribe to Digest
            </button>
            {subscribed && (
              <div className="mt-2 font-mono-data text-label-sm text-violet-spark flex items-center gap-1">
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

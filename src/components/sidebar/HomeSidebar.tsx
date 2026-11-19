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
        <div className="rounded-[8px] bg-white dark:bg-panel p-6 border border-edge shadow-catalog-edge">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-[16px] font-medium text-navy dark:text-white">Popular Topics</h4>
            <span className="font-mono text-[11px] text-muted-ink">Index v2.4</span>
          </div>
          <p className="text-[13px] text-secondary-ink mb-4">
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
                  className={`group flex items-center gap-1.5 rounded-[8px] px-3 py-1.5 text-left transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-navy text-white border-navy dark:bg-white dark:text-navy shadow-primary-btn'
                      : 'bg-canvas dark:bg-[#121620] border-edge text-secondary-ink hover:border-navy hover:text-navy dark:hover:text-white shadow-secondary-btn'
                  }`}
                >
                  <span className="font-mono text-[12px] font-medium">
                    #{pt.name}
                  </span>
                  <span
                    className={`rounded-[4px] px-1.5 py-0.5 font-mono text-[10px] ${
                      isActive
                        ? 'bg-white/20 text-white dark:bg-black/20 dark:text-navy'
                        : 'bg-edge text-muted-ink'
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
        <div className="rounded-[8px] bg-white dark:bg-panel p-6 border border-edge shadow-catalog-edge">
          <span className="font-mono text-[11px] font-medium text-muted-ink uppercase tracking-wider block mb-1">
            WEEKLY SYNTHESIS
          </span>
          <h4 className="text-[16px] font-medium text-navy dark:text-white">
            Zero Noise Engineering Memo
          </h4>
          <p className="mt-1 text-[13px] text-secondary-ink leading-relaxed">
            Condensed architectural learnings, concurrency post-mortems, and performance profiling tools delivered each Sunday morning.
          </p>

          <form onSubmit={handleSubscribe} className="mt-4 space-y-2.5">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="engineer@domain.com"
              required
              className="h-[36px] w-full rounded-[8px] bg-canvas dark:bg-[#121620] px-3.5 font-mono text-[13px] text-body-ink placeholder:text-muted-ink focus:outline-none focus:border-navy border border-edge"
            />
            <button
              type="submit"
              className="btn-primary w-full h-[36px] rounded-[8px] text-[14px] font-medium cursor-pointer shadow-primary-btn inline-flex items-center justify-center"
            >
              Subscribe to Digest
            </button>
            {subscribed && (
              <div className="mt-2 font-mono text-[12px] text-proof-green flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">check_circle</span>
                Dispatch added to delivery registry.
              </div>
            )}
          </form>
        </div>
      </div>
    </aside>
  );
};

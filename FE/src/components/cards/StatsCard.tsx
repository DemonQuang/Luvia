import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: string;
  trend?: string;
  color?: string;
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  color = 'text-primary'
}) => {
  return (
    <div className="glass-panel p-6 rounded-3xl dreamy-shadow flex items-center justify-between">
      <div className="space-y-2">
        <span className="font-label-caps text-label-caps text-on-surface-variant block uppercase tracking-wider">
          {title}
        </span>
        <h2 className="font-h2 text-h2 text-on-surface font-bold tracking-tight">
          {value}
        </h2>
        {trend && (
          <p className="text-xs text-on-surface-variant flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px] text-green-500">trending_up</span>
            {trend}
          </p>
        )}
      </div>

      <div className={`w-12 h-12 rounded-2xl bg-surface-container-high flex items-center justify-center ${color}`}>
        <span className="material-symbols-outlined text-2xl">{icon}</span>
      </div>
    </div>
  );
};
export default StatsCard;

import { Icon } from "../icon/icon";

export function SettledBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-pill bg-ink px-3 py-1.5 text-sm font-semibold text-surface">
      <Icon name="check" size={14} stroke={2.5} />
      Ustalone
    </span>
  );
}

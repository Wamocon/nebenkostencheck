import type { AmpelStatus } from '@/types';

type Props = {
  status: AmpelStatus;
  label: string;
};

const config = {
  gruen: {
    bg: 'bg-green-100 dark:bg-green-950',
    ring: 'ring-green-200 dark:ring-green-800',
    dot: 'bg-green-500',
    text: 'text-green-700 dark:text-green-300',
  },
  gelb: {
    bg: 'bg-yellow-100 dark:bg-yellow-950',
    ring: 'ring-yellow-200 dark:ring-yellow-800',
    dot: 'bg-yellow-500',
    text: 'text-yellow-700 dark:text-yellow-300',
  },
  rot: {
    bg: 'bg-red-100 dark:bg-red-950',
    ring: 'ring-red-200 dark:ring-red-800',
    dot: 'bg-red-500',
    text: 'text-red-700 dark:text-red-300',
  },
};

export function Ampel({ status, label }: Props) {
  const c = config[status];
  return (
    <div className={`inline-flex items-center gap-3 rounded-2xl ${c.bg} ring-1 ${c.ring} px-5 py-3`}>
      <span className={`w-4 h-4 rounded-full ${c.dot} animate-pulse`} />
      <span className={`font-semibold text-base ${c.text}`}>{label}</span>
    </div>
  );
}

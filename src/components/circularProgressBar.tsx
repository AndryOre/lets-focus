import { cn } from '@/lib/utils';

import { cva, type VariantProps } from 'class-variance-authority';

const circularProgressBarVariants = cva('stroke-[12px] [stroke-linecap:round] fill-none', {
  variants: {
    variant: {
      focus: 'stroke-blue-800',
      shortBreak: 'stroke-yellow-800 dark:stroke-yellow-200',
      longBreak: 'stroke-violet-800 dark:stroke-violet-200',
    },
  },
});

const emptyVariants = cva('stroke-[12px] fill-none', {
  variants: {
    variant: {
      focus: 'stroke-blue-800/30',
      shortBreak: 'stroke-yellow-500/30',
      longBreak: 'stroke-violet-500/30',
    },
  },
});

export interface CircularProgressBarProps
  extends React.HTMLAttributes<SVGElement>,
    VariantProps<typeof circularProgressBarVariants> {
  value: number;
  max: number;
  text: string;
}

export const CircularProgressBar = ({
  value,
  max,
  text,
  variant,
  className,
  ...props
}: CircularProgressBarProps): JSX.Element => {
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const percentage = (value / max) * 100;
  const strokeDashoffset = (percentage / 100) * circumference;

  return (
    <svg viewBox="0 0 128 128" className={cn('h-32 w-32', className)} {...props}>
      <circle cx="64" cy="64" r={radius} className={emptyVariants({ variant })} />
      <circle
        cx="64"
        cy="64"
        r={radius}
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        transform="rotate(-90 64 64)"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        className={circularProgressBarVariants({ variant })}
      />
      <text
        x="64"
        y="74"
        className="fill-neutral-950 text-3xl font-bold [text-anchor:middle] dark:fill-neutral-50"
      >
        {text}
      </text>
    </svg>
  );
};

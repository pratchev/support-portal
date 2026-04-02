'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, X } from 'lucide-react';

interface DateRangeFilterProps {
  onRangeChange: (
    startDate: string | undefined,
    endDate: string | undefined
  ) => void;
}

const PRESETS = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: '1y', days: 365 },
];

export function DateRangeFilter({ onRangeChange }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [activePreset, setActivePreset] = useState<string | null>(null);

  const applyPreset = (days: number, label: string) => {
    const end = new Date();
    const start = new Date(end.getTime() - days * 24 * 60 * 60 * 1000);
    const s = start.toISOString().split('T')[0];
    const e = end.toISOString().split('T')[0];
    setStartDate(s);
    setEndDate(e);
    setActivePreset(label);
    onRangeChange(s, e);
  };

  const applyCustom = () => {
    setActivePreset(null);
    if (startDate && endDate) {
      onRangeChange(startDate, endDate);
    }
  };

  const clearFilter = () => {
    setStartDate('');
    setEndDate('');
    setActivePreset(null);
    onRangeChange(undefined, undefined);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Calendar className="h-4 w-4 text-muted-foreground" />
      {PRESETS.map((p) => (
        <Button
          key={p.label}
          variant={activePreset === p.label ? 'default' : 'outline'}
          size="sm"
          className="h-8 text-xs"
          onClick={() => applyPreset(p.days, p.label)}
        >
          {p.label}
        </Button>
      ))}
      <div className="flex items-center gap-1.5">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="h-8 w-[130px] text-xs"
        />
        <span className="text-xs text-muted-foreground">to</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="h-8 w-[130px] text-xs"
        />
        <Button
          variant="outline"
          size="sm"
          className="h-8 text-xs"
          onClick={applyCustom}
          disabled={!startDate || !endDate}
        >
          Apply
        </Button>
      </div>
      {(startDate || endDate) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-8 text-xs"
          onClick={clearFilter}
        >
          <X className="h-3 w-3 mr-1" /> Clear
        </Button>
      )}
    </div>
  );
}

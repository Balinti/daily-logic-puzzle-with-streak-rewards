'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CompletionModalProps {
  open: boolean;
  onClose: () => void;
  stats: {
    duration_ms: number;
    mistakes: number;
    difficulty: number;
  };
  shareText?: string;
  onShare?: () => void;
  onPlayAgain?: () => void;
}

export function CompletionModal({
  open,
  onClose,
  stats,
  shareText,
  onShare,
  onPlayAgain,
}: CompletionModalProps) {
  const formatDuration = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl">Puzzle Complete!</DialogTitle>
          <DialogDescription>Great job solving the puzzle</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold">{formatDuration(stats.duration_ms)}</p>
              <p className="text-sm text-muted-foreground">Time</p>
            </div>
            <div>
              <p className="text-3xl font-bold">{stats.mistakes}</p>
              <p className="text-sm text-muted-foreground">Mistakes</p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Difficulty: {stats.difficulty}/5
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {onShare && shareText && (
            <Button onClick={onShare} variant="default">
              Share Result
            </Button>
          )}
          {onPlayAgain && (
            <Button onClick={onPlayAgain} variant="outline">
              Play Practice
            </Button>
          )}
          <Button onClick={onClose} variant="ghost">
            Close
            </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

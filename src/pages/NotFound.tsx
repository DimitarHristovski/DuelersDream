import { Button } from '@/components/ui/button';
import { Swords } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-duel-void p-6 text-center relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-30 bg-[radial-gradient(ellipse_at_center,rgba(201,162,39,0.08),transparent_60%)]"
        aria-hidden
      />
      <div className="space-y-6 max-w-md relative z-10">
        <div className="flex justify-center">
          <div className="rounded-2xl border border-duel-brass/30 bg-duel-ink/80 p-4">
            <Swords className="h-10 w-10 text-duel-brass" />
          </div>
        </div>
        <div className="space-y-3">
          <h1 className="text-7xl font-display font-bold text-duel-brass">404</h1>
          <h2 className="text-2xl font-display font-semibold text-duel-parchment">Nothing here, duelist</h2>
          <p className="text-duel-mist">That page does not exist or was moved.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="bg-duel-brass text-duel-void hover:bg-amber-400 font-display">
            <a href="/">Return to arena</a>
          </Button>
          <Button variant="outline" className="border-duel-brass/40 text-duel-parchment hover:bg-duel-brass/10" onClick={() => window.history.back()}>
            Go back
          </Button>
        </div>
      </div>
    </div>
  );
}

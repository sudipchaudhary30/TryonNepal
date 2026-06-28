import CameraView from '@/components/ar/CameraView';
import ErrorBoundary from '@/components/ui/ErrorBoundary';

export default function Showroom() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-4 rounded-full border border-accent/30 bg-accent/10 px-4 py-2 text-center text-sm font-semibold uppercase tracking-[0.25em] text-accent">
        Showroom Mode
      </div>
      <ErrorBoundary>
        <CameraView showSkeleton />
      </ErrorBoundary>
    </div>
  );
}

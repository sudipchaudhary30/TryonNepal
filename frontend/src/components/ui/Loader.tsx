interface LoaderProps {
  message?: string;
}

export default function Loader({ message = 'Loading...' }: LoaderProps) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center gap-4 text-white/70">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      <p className="text-sm font-medium uppercase tracking-[0.2em]">{message}</p>
    </div>
  );
}

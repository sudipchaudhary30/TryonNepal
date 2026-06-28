import Button from '@/components/ui/Button';
import Loader from '@/components/ui/Loader';
import { useUserStore } from '@/store/useUserStore';

export default function Profile() {
  const { user, isLoading, isAuthenticated, signOut } = useUserStore();

  if (isLoading && !user) {
    return <Loader message="Loading profile" />;
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl border border-white/10 bg-card p-6">
        <h1 className="font-display text-4xl font-bold text-white">Profile</h1>
        {isAuthenticated && user ? (
          <div className="mt-6 space-y-3 text-white/80">
            <p>Name: {user.name}</p>
            <p>Email: {user.email}</p>
            <p>Height: {user.heightCm ?? 'Not set'} cm</p>
            <Button variant="ghost" onClick={() => void signOut()}>
              Sign Out
            </Button>
          </div>
        ) : (
          <p className="mt-4 text-white/70">Sign in to manage your wardrobe and saved outfits.</p>
        )}
      </div>
    </div>
  );
}

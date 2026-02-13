import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useUserProfile';
import LoginButton from './components/LoginButton';
import ProfileSetupModal from './components/ProfileSetupModal';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UpcomingDashboard from './components/UpcomingDashboard';
import ContactsManager from './components/ContactsManager';
import GiftsManager from './components/GiftsManager';
import { Cake, Users, Heart, Gift } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Cake className="w-16 h-16 mx-auto text-orange-500 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <header className="border-b border-orange-200/50 dark:border-orange-900/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
                <Cake className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Birthday Buddy
              </h1>
            </div>
            <LoginButton />
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center space-y-8">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
                Never Miss a Birthday Again
              </h2>
              <p className="text-xl text-gray-600 dark:text-gray-300">
                Keep track of all your loved ones' birthdays and get timely reminders
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-orange-200/50 dark:border-orange-900/30">
                <Users className="w-12 h-12 mx-auto mb-4 text-orange-500" />
                <h3 className="font-semibold text-lg mb-2">Manage Contacts</h3>
                <p className="text-sm text-muted-foreground">
                  Add and organize all your friends and family
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-pink-200/50 dark:border-pink-900/30">
                <Cake className="w-12 h-12 mx-auto mb-4 text-pink-500" />
                <h3 className="font-semibold text-lg mb-2">Track Birthdays</h3>
                <p className="text-sm text-muted-foreground">
                  See upcoming birthdays at a glance
                </p>
              </div>
              <div className="p-6 rounded-2xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border border-yellow-200/50 dark:border-yellow-900/30">
                <Heart className="w-12 h-12 mx-auto mb-4 text-yellow-600" />
                <h3 className="font-semibold text-lg mb-2">Stay Connected</h3>
                <p className="text-sm text-muted-foreground">
                  Never forget to celebrate special moments
                </p>
              </div>
            </div>

            <div className="pt-8">
              <LoginButton />
            </div>
          </div>
        </main>

        <footer className="border-t border-orange-200/50 dark:border-orange-900/30 mt-16 py-8 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>
              © {new Date().getFullYear()} Birthday Buddy · Built with{' '}
              <Heart className="inline w-4 h-4 text-pink-500" /> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
              >
                caffeine.ai
              </a>
            </p>
          </div>
        </footer>
      </div>
    );
  }

  if (showProfileSetup) {
    return <ProfileSetupModal />;
  }

  if (profileLoading || !isFetched) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <header className="border-b border-orange-200/50 dark:border-orange-900/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Skeleton className="h-10 w-48" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <Skeleton className="h-64 w-full" />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-yellow-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <header className="border-b border-orange-200/50 dark:border-orange-900/30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center">
              <Cake className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                Birthday Buddy
              </h1>
              {userProfile && (
                <p className="text-sm text-muted-foreground">Welcome, {userProfile.name}</p>
              )}
            </div>
          </div>
          <LoginButton />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="upcoming" className="w-full">
          <TabsList className="grid w-full max-w-2xl mx-auto grid-cols-3 mb-8">
            <TabsTrigger value="upcoming" className="gap-2">
              <Cake className="w-4 h-4" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2">
              <Users className="w-4 h-4" />
              Contacts
            </TabsTrigger>
            <TabsTrigger value="gifts" className="gap-2">
              <Gift className="w-4 h-4" />
              Gifts
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming" className="mt-0">
            <UpcomingDashboard />
          </TabsContent>

          <TabsContent value="contacts" className="mt-0">
            <ContactsManager />
          </TabsContent>

          <TabsContent value="gifts" className="mt-0">
            <GiftsManager />
          </TabsContent>
        </Tabs>
      </main>

      <footer className="border-t border-orange-200/50 dark:border-orange-900/30 mt-16 py-8 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Birthday Buddy · Built with{' '}
            <Heart className="inline w-4 h-4 text-pink-500" /> using{' '}
            <a
              href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 font-medium"
            >
              caffeine.ai
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

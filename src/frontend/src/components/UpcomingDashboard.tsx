import { useState } from 'react';
import { useGetUpcomingBirthdays } from '../hooks/useUpcomingBirthdays';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Cake, Calendar, AlertCircle, PartyPopper, StickyNote } from 'lucide-react';
import { formatBirthday, getDaysUntilBirthday, getNextOccurrence, calculateAgeAtNextBirthday } from '../lib/dateUtils';

type TimeWindow = 7 | 30 | 90;

export default function UpcomingDashboard() {
  const [timeWindow, setTimeWindow] = useState<TimeWindow>(30);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: birthdays, isLoading, error, refetch } = useGetUpcomingBirthdays(timeWindow);

  const filteredBirthdays = birthdays?.filter((contact) =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const today = filteredBirthdays?.filter((contact) => getDaysUntilBirthday(contact) === 0);
  const upcoming = filteredBirthdays?.filter((contact) => getDaysUntilBirthday(contact) > 0);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Failed to load birthdays: {error.message}</span>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              Retry
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <Tabs value={timeWindow.toString()} onValueChange={(v) => setTimeWindow(parseInt(v) as TimeWindow)} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="7">Next 7 Days</TabsTrigger>
            <TabsTrigger value="30">Next 30 Days</TabsTrigger>
            <TabsTrigger value="90">Next 90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder="Search birthdays..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {today && today.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <PartyPopper className="w-5 h-5 text-pink-500" />
            <h2 className="text-xl font-semibold">Today's Birthdays</h2>
          </div>
          <div className="grid gap-3">
            {today.map((contact) => {
              const age = calculateAgeAtNextBirthday(contact);
              return (
                <Card key={contact.id} className="border-pink-200 dark:border-pink-900 bg-gradient-to-r from-pink-50 to-orange-50 dark:from-pink-950/20 dark:to-orange-950/20">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Cake className="w-5 h-5 text-pink-500" />
                      {contact.name}
                    </CardTitle>
                    <CardDescription className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {formatBirthday(contact.birthMonth, contact.birthDay, contact.birthYear)}
                      </span>
                      {age !== null && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-pink-200 dark:bg-pink-900 text-pink-800 dark:text-pink-200">
                          Turning {age} today!
                        </span>
                      )}
                    </CardDescription>
                    {contact.notes && (
                      <>
                        <Separator className="my-2" />
                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                          <StickyNote className="w-4 h-4 flex-shrink-0 mt-0.5" />
                          <p className="line-clamp-2">{contact.notes}</p>
                        </div>
                      </>
                    )}
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {upcoming && upcoming.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-orange-500" />
            <h2 className="text-xl font-semibold">Upcoming Birthdays</h2>
          </div>
          <div className="grid gap-3">
            {upcoming.map((contact) => {
              const daysUntil = getDaysUntilBirthday(contact);
              const age = calculateAgeAtNextBirthday(contact);
              return (
                <Card key={contact.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg">{contact.name}</CardTitle>
                        <CardDescription className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="flex items-center gap-1">
                            <Cake className="w-4 h-4" />
                            {getNextOccurrence(contact)}
                          </span>
                          {age !== null && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300">
                              Turning {age}
                            </span>
                          )}
                        </CardDescription>
                        {contact.notes && (
                          <>
                            <Separator className="my-2" />
                            <div className="flex items-start gap-2 text-sm text-muted-foreground">
                              <StickyNote className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <p className="line-clamp-2">{contact.notes}</p>
                            </div>
                          </>
                        )}
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <div className="text-right">
                          <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                            {daysUntil}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {daysUntil === 1 ? 'day' : 'days'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {(!filteredBirthdays || filteredBirthdays.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/20 flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-orange-500" />
            </div>
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No birthdays found' : 'No upcoming birthdays'}
            </h3>
            <p className="text-muted-foreground">
              {searchTerm
                ? 'Try adjusting your search'
                : `No birthdays in the next ${timeWindow} days`}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

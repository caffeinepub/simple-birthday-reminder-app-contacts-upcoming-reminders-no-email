import { useQuery } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Contact } from '../backend';

export function useGetUpcomingBirthdays(daysAhead: number) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Contact[]>({
    queryKey: ['upcomingBirthdays', daysAhead],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getUpcomingBirthdays(BigInt(daysAhead));
    },
    enabled: !!actor && !actorFetching,
  });
}

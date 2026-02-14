import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { BirthdayGiftPlan } from '../backend';

export function useListGiftPlans() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<BirthdayGiftPlan[]>({
    queryKey: ['giftPlans'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.listBirthdayGiftPlans();
    },
    enabled: !!actor && !actorFetching,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry on authorization errors
      if (error instanceof Error && error.message.includes('Unauthorized')) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useCreateGiftPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      contactId: string;
      giftIdea: string;
      plannedDate: bigint;
      budget: bigint | null;
      notes: string | null;
      status: string;
      isYearlyRecurring: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addBirthdayGiftPlan(
        params.contactId,
        params.giftIdea,
        params.plannedDate,
        params.budget,
        params.notes,
        params.status,
        params.isYearlyRecurring
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftPlans'] });
    },
  });
}

export function useUpdateGiftPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      giftIdea: string;
      plannedDate: bigint;
      budget: bigint | null;
      notes: string | null;
      status: string;
      isYearlyRecurring: boolean;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateBirthdayGiftPlan(
        params.id,
        params.giftIdea,
        params.plannedDate,
        params.budget,
        params.notes,
        params.status,
        params.isYearlyRecurring
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftPlans'] });
    },
  });
}

export function useDeleteGiftPlan() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteBirthdayGiftPlan(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['giftPlans'] });
    },
  });
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type { Contact } from '../backend';

export function useListContacts() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Contact[]>({
    queryKey: ['contacts'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.listContacts();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      birthMonth: number;
      birthDay: number;
      birthYear: bigint | null;
      notes: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createContact(
        params.id,
        params.name,
        params.birthMonth,
        params.birthDay,
        params.birthYear,
        params.notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingBirthdays'] });
    },
  });
}

export function useUpdateContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      id: string;
      name: string;
      birthMonth: number;
      birthDay: number;
      birthYear: bigint | null;
      notes: string | null;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateContact(
        params.id,
        params.name,
        params.birthMonth,
        params.birthDay,
        params.birthYear,
        params.notes
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingBirthdays'] });
    },
  });
}

export function useDeleteContact() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteContact(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['upcomingBirthdays'] });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  DriverProfile,
  Message,
  Notification,
  Rating,
  Trip,
  UserProfile,
} from "../backend.d";
import { useActor } from "./useActor";
import { useInternetIdentity } from "./useInternetIdentity";

export function useCallerProfile() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile | null>({
    queryKey: ["callerProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllDriverProfiles() {
  const { actor, isFetching } = useActor();
  return useQuery<DriverProfile[]>({
    queryKey: ["driverProfiles"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDriverProfiles();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 10000,
  });
}

export function useAllTrips() {
  const { actor, isFetching } = useActor();
  return useQuery<Trip[]>({
    queryKey: ["allTrips"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTrips();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useClientTrips() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Trip[]>({
    queryKey: ["clientTrips"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getClientTrips(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useDriverTrips() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Trip[]>({
    queryKey: ["driverTrips"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getDriverTrips(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useNotifications() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();
  return useQuery<Notification[]>({
    queryKey: ["notifications"],
    queryFn: async () => {
      if (!actor || !identity) return [];
      return actor.getUserNotifications(identity.getPrincipal());
    },
    enabled: !!actor && !isFetching && !!identity,
    refetchInterval: 15000,
  });
}

export function useAllUsers() {
  const { actor, isFetching } = useActor();
  return useQuery<UserProfile[]>({
    queryKey: ["allUsers"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllUsers();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useAllRatings() {
  const { actor, isFetching } = useActor();
  return useQuery<Rating[]>({
    queryKey: ["allRatings"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRatings();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRevenueSummary() {
  const { actor, isFetching } = useActor();
  return useQuery<number>({
    queryKey: ["revenue"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getRevenueSummary();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTripMessages(tripId: bigint | null) {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["tripMessages", tripId?.toString()],
    queryFn: async () => {
      if (!actor || tripId === null) return [];
      return actor.getTripMessages(tripId);
    },
    enabled: !!actor && !isFetching && tripId !== null,
    refetchInterval: 5000,
  });
}

export function useRequestTrip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      destination,
      price,
    }: { destination: string; price: number }) => {
      if (!actor) throw new Error("No actor");
      return actor.requestTrip(destination, price);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["clientTrips"] }),
  });
}

export function useAcceptTrip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tripId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.acceptTrip(tripId);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allTrips"] }),
  });
}

export function useCancelTrip() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (tripId: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.cancelTrip(tripId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["clientTrips"] });
      qc.invalidateQueries({ queryKey: ["allTrips"] });
    },
  });
}

export function useSubmitRating() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tripId,
      driverId,
      score,
      comment,
    }: { tripId: bigint; driverId: any; score: number; comment: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.submitRating(tripId, driverId, BigInt(score), comment);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["allRatings"] }),
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      tripId,
      message,
    }: { tripId: bigint; message: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.sendMessage(tripId, message);
    },
    onSuccess: (_, { tripId }) =>
      qc.invalidateQueries({ queryKey: ["tripMessages", tripId.toString()] }),
  });
}

export function useMarkNotificationRead() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.markNotificationRead(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["callerProfile"] }),
  });
}

export function useUpdateDriverProfile() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (profile: DriverProfile) => {
      if (!actor) throw new Error("No actor");
      return actor.updateDriverProfile(profile);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["driverProfiles"] }),
  });
}

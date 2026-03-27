import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DriverProfile {
    lat: number;
    lng: number;
    totalTrips: bigint;
    tricyclePlate: string;
    userId: Principal;
    isAvailable: boolean;
    tricycleModel: string;
    earnings: number;
    licenseNumber: string;
    rating: number;
    photoBlobId?: string;
    documentBlobId?: string;
}
export interface Trip {
    id: bigint;
    status: TripStatus;
    client: Principal;
    destination: string;
    createdAt: bigint;
    origin: string;
    price: number;
    driver: Principal;
}
export interface Rating {
    id: bigint;
    driverId: Principal;
    clientId: Principal;
    createdAt: bigint;
    tripId: bigint;
    score: bigint;
    comment: string;
}
export interface Notification {
    id: bigint;
    createdAt: bigint;
    read: boolean;
    user: Principal;
    message: string;
}
export interface Message {
    id: bigint;
    createdAt: bigint;
    tripId: bigint;
    sender: Principal;
    message: string;
}
export interface UserProfile {
    userId: Principal;
    name: string;
    createdAt: bigint;
    role: string;
    email: string;
    loyaltyPoints: bigint;
    phone: string;
}
export enum TripStatus {
    cancelled = "cancelled",
    pending = "pending",
    completed = "completed",
    accepted = "accepted",
    inProgress = "inProgress"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    acceptTrip(tripId: bigint): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    cancelTrip(tripId: bigint): Promise<void>;
    completeTrip(tripId: bigint): Promise<void>;
    createNotification(user: Principal, message: string): Promise<bigint>;
    getAllDriverProfiles(): Promise<Array<DriverProfile>>;
    getAllRatings(): Promise<Array<Rating>>;
    getAllTrips(): Promise<Array<Trip>>;
    getAllUsers(): Promise<Array<UserProfile>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getClientTrips(clientId: Principal): Promise<Array<Trip>>;
    getCurrentUserRole(): Promise<UserRole>;
    getDriverProfile(driverId: Principal): Promise<DriverProfile | null>;
    getDriverRatings(driverId: Principal): Promise<Array<Rating>>;
    getDriverTrips(driverId: Principal): Promise<Array<Trip>>;
    getRevenueSummary(): Promise<number>;
    getTripMessages(tripId: bigint): Promise<Array<Message>>;
    getUserNotifications(user: Principal): Promise<Array<Notification>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    markNotificationRead(notificationId: bigint): Promise<void>;
    requestTrip(destination: string, price: number): Promise<bigint>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    sendMessage(tripId: bigint, message: string): Promise<bigint>;
    startTrip(tripId: bigint): Promise<void>;
    submitRating(tripId: bigint, driverId: Principal, score: bigint, comment: string): Promise<bigint>;
    updateDriverProfile(profile: DriverProfile): Promise<void>;
}

import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export type Time = bigint;
export interface Contact {
    id: string;
    birthYear?: bigint;
    name: string;
    createdAt: Time;
    updatedAt: Time;
    birthDay: number;
    notes?: string;
    birthMonth: number;
}
export interface UserProfile {
    name: string;
}
export interface BirthdayGiftPlan {
    plannedDate: Time;
    status: string;
    createdAt: Time;
    updatedAt: Time;
    notes?: string;
    contactId: string;
    budget?: bigint;
    giftIdea: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addBirthdayGiftPlan(contactId: string, giftIdea: string, plannedDate: Time, budget: bigint | null, notes: string | null, status: string): Promise<string>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createContact(id: string, name: string, birthMonth: number, birthDay: number, birthYear: bigint | null, notes: string | null): Promise<void>;
    deleteBirthdayGiftPlan(id: string): Promise<void>;
    deleteContact(id: string): Promise<void>;
    getBirthdayGiftPlan(id: string): Promise<BirthdayGiftPlan | null>;
    getBirthdayGiftPlansForContact(contactId: string): Promise<Array<BirthdayGiftPlan>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getUpcomingBirthdays(daysAhead: bigint): Promise<Array<Contact>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    listBirthdayGiftPlans(): Promise<Array<BirthdayGiftPlan>>;
    listContacts(): Promise<Array<Contact>>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateBirthdayGiftPlan(id: string, giftIdea: string, plannedDate: Time, budget: bigint | null, notes: string | null, status: string): Promise<void>;
    updateContact(id: string, name: string, birthMonth: number, birthDay: number, birthYear: bigint | null, notes: string | null): Promise<void>;
}

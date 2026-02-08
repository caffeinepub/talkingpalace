import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export class ExternalBlob {
    getBytes(): Promise<Uint8Array<ArrayBuffer>>;
    getDirectURL(): string;
    static fromURL(url: string): ExternalBlob;
    static fromBytes(blob: Uint8Array<ArrayBuffer>): ExternalBlob;
    withUploadProgress(onProgress: (percentage: number) => void): ExternalBlob;
}
export interface Friend {
    principal: Principal;
    isBestFriend: boolean;
}
export interface SearchResult {
    principal: Principal;
    username: string;
    displayName: string;
    profilePicture?: ExternalBlob;
}
export type Time = bigint;
export interface Message {
    id: bigint;
    content: string;
    video?: ExternalBlob;
    sender: Principal;
    timestamp: Time;
    replyTo?: bigint;
    receiver: Principal;
}
export interface UserProfile {
    principal: Principal;
    username: string;
    displayName: string;
    themeColor: string;
    darkMode: boolean;
    profilePicture?: ExternalBlob;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addFriend(friend: Principal): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createOrUpdateProfile(username: string, displayName: string, themeColor: string, darkMode: boolean): Promise<void>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFriendsList(): Promise<Array<Friend>>;
    getMessagesWithUser(other: Principal): Promise<Array<Message>>;
    getProfile(user: Principal): Promise<UserProfile | null>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    removeFriend(friend: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUsers(term: string): Promise<Array<SearchResult>>;
    sendMessage(receiver: Principal, content: string, replyTo: bigint | null, video: ExternalBlob | null): Promise<void>;
    toggleBestFriend(friend: Principal): Promise<void>;
    updateProfilePicture(picture: ExternalBlob): Promise<void>;
}

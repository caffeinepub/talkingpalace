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
export interface SearchResult {
    principal: Principal;
    username: string;
    displayName: string;
    profilePicture?: ExternalBlob;
}
export type Time = bigint;
export interface RoomMessage {
    id: bigint;
    content: string;
    video?: ExternalBlob;
    sender: string;
    timestamp: Time;
    replyTo?: bigint;
    roomId: string;
}
export interface Room {
    id: string;
    creator: Principal;
    participants: Array<string>;
    joinCode: string;
    isGroup: boolean;
}
export interface SystemMessage {
    id: bigint;
    content: string;
    messageType: string;
    timestamp: Time;
    roomId: string;
}
export interface Friend {
    principal: Principal;
    isBestFriend: boolean;
}
export interface GuestProfile {
    displayName: string;
    profilePicture?: ExternalBlob;
    guestId: string;
}
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
    createOrUpdateGuestProfile(guestId: string, displayName: string, profilePicture: ExternalBlob | null): Promise<void>;
    createOrUpdateProfile(username: string, displayName: string, themeColor: string, darkMode: boolean): Promise<void>;
    createRoom(joinCode: string, isGroup: boolean): Promise<string>;
    getAllRooms(participantId: string, filterParticipant: string | null): Promise<Array<Room>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getFriendsList(): Promise<Array<Friend>>;
    getGuestProfile(guestId: string): Promise<GuestProfile | null>;
    getMessagesWithUser(other: Principal): Promise<Array<Message>>;
    getProfile(user: Principal): Promise<UserProfile | null>;
    getRoom(roomId: string, participantId: string): Promise<Room>;
    getRoomMessages(roomId: string, participantId: string, sinceTimestamp: Time | null): Promise<Array<RoomMessage>>;
    getRoomParticipants(roomId: string, participantId: string): Promise<Array<string>>;
    getSystemMessages(roomId: string, participantId: string, sinceTimestamp: Time | null): Promise<Array<SystemMessage>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    joinRoom(roomId: string, participantId: string): Promise<void>;
    joinRoomWithCode(joinCode: string, participantId: string): Promise<string>;
    leaveRoom(roomId: string, participantId: string): Promise<void>;
    removeFriend(friend: Principal): Promise<void>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    searchUsers(term: string): Promise<Array<SearchResult>>;
    sendMessage(receiver: Principal, content: string, replyTo: bigint | null, video: ExternalBlob | null): Promise<void>;
    sendRoomMessage(roomId: string, participantId: string, content: string, replyTo: bigint | null, video: ExternalBlob | null): Promise<void>;
    setRoomParticipants(roomId: string, participants: Array<string>): Promise<void>;
    setSystemMessage(roomId: string, participantId: string, content: string, messageType: string): Promise<void>;
    toggleBestFriend(friend: Principal): Promise<void>;
    updateProfilePicture(picture: ExternalBlob): Promise<void>;
}

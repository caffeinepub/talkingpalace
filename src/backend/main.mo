import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import List "mo:core/List";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Map "mo:core/Map";
import Time "mo:core/Time";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";
import Storage "blob-storage/Storage";
import MixinStorage "blob-storage/Mixin";

actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

  // Constants
  let roomMaxParticipants = 50;

  // Types
  public type UserProfile = {
    principal : Principal;
    username : Text;
    displayName : Text;
    profilePicture : ?Storage.ExternalBlob;
    themeColor : Text;
    darkMode : Bool;
  };

  public type SearchResult = {
    principal : Principal;
    username : Text;
    displayName : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  public type Friend = {
    principal : Principal;
    isBestFriend : Bool;
  };

  public type FriendList = {
    friends : [Friend];
  };

  public type Message = {
    id : Nat;
    sender : Principal;
    receiver : Principal;
    timestamp : Time.Time;
    content : Text;
    replyTo : ?Nat;
    video : ?Storage.ExternalBlob;
  };

  public type GuestProfile = {
    guestId : Text;
    displayName : Text;
    profilePicture : ?Storage.ExternalBlob;
  };

  public type Room = {
    id : Text;
    creator : Principal;
    joinCode : Text;
    participants : [Text]; // Mix of Principals (as Text) and GuestIds
    isGroup : Bool;
  };

  public type RoomMessage = {
    id : Nat;
    roomId : Text;
    sender : Text; // Either Principal or GuestId as Text
    content : Text;
    timestamp : Time.Time;
    replyTo : ?Nat;
    video : ?Storage.ExternalBlob;
  };

  public type SystemMessage = {
    id : Nat;
    roomId : Text;
    content : Text;
    timestamp : Time.Time;
    messageType : Text; // "JOIN" | "PARTICIPANT" | "LEAVE" | "RENAME_PARTICIPANT" | "PARTICIPANT_UPDATE"
  };

  // State
  let profiles = Map.empty<Principal, UserProfile>();
  let friendLists = Map.empty<Principal, FriendList>();

  let guestProfiles = Map.empty<Text, GuestProfile>();
  let rooms = Map.empty<Text, Room>();
  let messages = Map.empty<Nat, Message>();
  let roomMessages = Map.empty<Nat, RoomMessage>();
  let systemMessages = Map.empty<Nat, SystemMessage>();

  var nextMessageId = 0;
  var nextSystemMessageId = 0;
  var nextRoomId = 0;

  // Helper Functions
  func compareMessagesByTime(m1 : Message, m2 : Message) : Order.Order {
    Int.compare(m1.timestamp, m2.timestamp);
  };

  func compareRoomMessagesByTime(m1 : RoomMessage, m2 : RoomMessage) : Order.Order {
    Int.compare(m1.timestamp, m2.timestamp);
  };

  func compareBestFriends(friend1 : Friend, friend2 : Friend) : Order.Order {
    switch (friend1.isBestFriend, friend2.isBestFriend) {
      case (true, false) { #less };
      case (false, true) { #greater };
      case (_, _) { friend1.principal.toText().compare(friend2.principal.toText()) };
    };
  };

  func isParticipantInRoom(room : Room, participantId : Text) : Bool {
    switch (room.participants.find(func(p) { p == participantId })) {
      case (null) { false };
      case (?_) { true };
    };
  };

  func getParticipantId(caller : Principal) : Text {
    caller.toText();
  };

  // General Messaging Functions
  public shared ({ caller }) func sendMessage(receiver : Principal, content : Text, replyTo : ?Nat, video : ?Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };

    let message = {
      id = nextMessageId;
      sender = caller;
      receiver;
      timestamp = Time.now();
      content;
      replyTo;
      video;
    };

    messages.add(nextMessageId, message);
    nextMessageId += 1;
  };

  public query ({ caller }) func getMessagesWithUser(other : Principal) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };

    messages.values().toArray().filter(
      func(msg) {
        (msg.sender == caller and msg.receiver == other) or (msg.sender == other and msg.receiver == caller);
      }
    ).sort(compareMessagesByTime);
  };

  // User Profiles
  public shared ({ caller }) func createOrUpdateProfile(username : Text, displayName : Text, themeColor : Text, darkMode : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update the profile");
    };

    let profile = {
      principal = caller;
      username;
      displayName;
      profilePicture = null;
      themeColor;
      darkMode;
    };

    profiles.add(caller, profile);
  };

  public query ({ caller }) func getProfile(user : Principal) : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func updateProfilePicture(picture : Storage.ExternalBlob) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update profile picture");
    };

    let profile = switch (profiles.get(caller)) {
      case (null) { Runtime.trap("User not found.") };
      case (?profile) { profile };
    };

    let updatedProfile = {
      principal = caller;
      username = profile.username;
      displayName = profile.displayName;
      profilePicture = ?picture;
      themeColor = profile.themeColor;
      darkMode = profile.darkMode;
    };

    profiles.add(caller, updatedProfile);
  };

  // Guest Profile Management
  public shared ({ caller }) func createOrUpdateGuestProfile(guestId : Text, displayName : Text, profilePicture : ?Storage.ExternalBlob) : async () {
    // Any caller (including guests) can create/update guest profiles
    let guestProfile : GuestProfile = {
      guestId;
      displayName;
      profilePicture;
    };
    guestProfiles.add(guestId, guestProfile);
  };

  public query ({ caller }) func getGuestProfile(guestId : Text) : async ?GuestProfile {
    // Any caller can view guest profiles
    guestProfiles.get(guestId);
  };

  // Room Messaging
  public shared ({ caller }) func createRoom(joinCode : Text, isGroup : Bool) : async Text {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create rooms");
    };

    let roomId = nextRoomId.toText();
    nextRoomId += 1;

    let newRoom : Room = {
      id = roomId;
      creator = caller;
      joinCode;
      participants = [caller.toText()];
      isGroup;
    };

    rooms.add(roomId, newRoom);
    roomId;
  };

  public shared ({ caller }) func joinRoomWithCode(joinCode : Text, participantId : Text) : async Text {
    // Any caller (including guests) can join a room with valid join code
    // Find room by join code
    let roomEntry = rooms.toArray().find(
      func((id, room)) { Text.equal(room.joinCode, joinCode) }
    );

    let (roomId, room) = switch (roomEntry) {
      case (null) { Runtime.trap("Invalid join code") };
      case (?(id, r)) { (id, r) };
    };

    if (room.participants.size() >= roomMaxParticipants) {
      Runtime.trap("Room is full. Maximum number of participants has been reached");
    };

    switch (room.participants.find(func(p) { p == participantId })) {
      case (?_) { return roomId };
      case (null) {};
    };


    let updatedParticipants = room.participants.concat([participantId]);
    let updatedRoom = { room with participants = updatedParticipants };
    rooms.add(roomId, updatedRoom);

    roomId;
  };

  public shared ({ caller }) func joinRoom(roomId : Text, participantId : Text) : async () {
    // Any caller (including guests) can join if they know the room ID
    // This is used for re-joining or direct invites
    let room = switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) { room };
    };

    if (room.participants.size() >= roomMaxParticipants) {
      Runtime.trap("Room is full. Maximum number of participants has been reached");
    };

    switch (room.participants.find(func(p) { p == participantId })) {
      case (?_) { return };
      case (null) {};
    };

    let updatedParticipants = room.participants.concat([participantId]);
    let updatedRoom = { room with participants = updatedParticipants };
    rooms.add(roomId, updatedRoom);
  };

  public shared ({ caller }) func sendRoomMessage(roomId : Text, content : Text, replyTo : ?Nat, video : ?Storage.ExternalBlob) : async () {
    // Any caller (including guests) can send messages if they are a participant
    let room = switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) { room };
    };

    // Determine sender ID based on caller
    let senderId = getParticipantId(caller);

    if (not isParticipantInRoom(room, senderId)) {
      Runtime.trap("Unauthorized: You are not a participant in this room");
    };

    let roomMessage : RoomMessage = {
      id = nextMessageId;
      roomId;
      sender = senderId;
      content;
      timestamp = Time.now();
      replyTo;
      video;
    };

    roomMessages.add(nextMessageId, roomMessage);
    nextMessageId += 1;
  };

  public query ({ caller }) func getRoomMessages(roomId : Text, sinceTimestamp : ?Time.Time) : async [RoomMessage] {
    // Any caller (including guests) can view messages if they are a participant
    let room = switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) { room };
    };

    let participantId = getParticipantId(caller);
    if (not isParticipantInRoom(room, participantId)) {
      Runtime.trap("Unauthorized: You are not a participant in this room");
    };

    let filteredMessages = switch (sinceTimestamp) {
      case (null) {
        roomMessages.values().toArray().filter(
          func(msg) {
            Text.equal(msg.roomId, roomId);
          }
        ).sort(compareRoomMessagesByTime);
      };
      case (?timestamp) {
        roomMessages.values().toArray().filter(
          func(msg) {
            Text.equal(msg.roomId, roomId) and msg.timestamp > timestamp
          }
        ).sort(compareRoomMessagesByTime);
      };
    };
    filteredMessages;
  };

  public query ({ caller }) func getSystemMessages(roomId : Text, sinceTimestamp : ?Time.Time) : async [SystemMessage] {
    // Any caller (including guests) can view system messages if they are a participant
    let room = switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) { room };
    };

    let participantId = getParticipantId(caller);
    if (not isParticipantInRoom(room, participantId)) {
      Runtime.trap("Unauthorized: You are not a participant in this room");
    };

    let filteredMessages = switch (sinceTimestamp) {
      case (null) {
        systemMessages.values().toArray().filter(
          func(msg) {
            Text.equal(msg.roomId, roomId);
          }
        );
      };
      case (?timestamp) {
        systemMessages.values().toArray().filter(
          func(msg) {
            Text.equal(msg.roomId, roomId) and msg.timestamp > timestamp
          }
        );
      };
    };
    filteredMessages;
  };

  public shared ({ caller }) func setRoomParticipants(roomId : Text, participants : [Text]) : async () {
    // Only room creator can modify participants directly
    let room = switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) { room };
    };

    if (caller != room.creator) {
      Runtime.trap("Unauthorized: Only the room creator can modify participants");
    };

    if (participants.size() > roomMaxParticipants) {
      Runtime.trap("Room is full. Maximum number of participants has been reached");
    };

    let updatedRoom = { room with participants };
    rooms.add(roomId, updatedRoom);
  };

  public shared ({ caller }) func setSystemMessage(roomId : Text, content : Text, messageType : Text) : async () {
    // Any participant can create system messages (for join/leave notifications)
    let room = switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) { room };
    };

    let participantId = getParticipantId(caller);
    if (not isParticipantInRoom(room, participantId)) {
      Runtime.trap("Unauthorized: You are not a participant in this room");
    };

    let newSystemMessage : SystemMessage = {
      id = nextSystemMessageId;
      roomId;
      content;
      timestamp = Time.now();
      messageType;
    };
    systemMessages.add(nextSystemMessageId, newSystemMessage);
    nextSystemMessageId += 1;
  };

  public query ({ caller }) func getRoomParticipants(roomId : Text) : async [Text] {
    // Any caller (including guests) can view participants if they are in the room
    let room = switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) { room };
    };

    let participantId = getParticipantId(caller);
    if (not isParticipantInRoom(room, participantId)) {
      Runtime.trap("Unauthorized: You are not a participant in this room");
    };

    room.participants;
  };

  public shared ({ caller }) func leaveRoom(roomId : Text, participantId : Text) : async () {
    // Caller can only remove themselves, or room creator can remove anyone
    let room = switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) { room };
    };

    let callerParticipantId = getParticipantId(caller);

    // Check authorization: caller must be removing themselves OR be the room creator
    if (callerParticipantId != participantId and caller != room.creator) {
      Runtime.trap("Unauthorized: You can only remove yourself from the room");
    };

    let updatedParticipants = room.participants.filter(
      func(id) { id != participantId }
    );
    let updatedRoom = { room with participants = updatedParticipants };
    rooms.add(roomId, updatedRoom);
  };

  public query ({ caller }) func getRoom(roomId : Text) : async Room {
    // Any caller (including guests) can view room details if they are a participant
    let room = switch (rooms.get(roomId)) {
      case (null) { Runtime.trap("Room not found") };
      case (?room) { room };
    };

    let participantId = getParticipantId(caller);
    if (not isParticipantInRoom(room, participantId)) {
      Runtime.trap("Unauthorized: You are not a participant in this room");
    };

    room;
  };

  public query ({ caller }) func getAllRooms(filterParticipant : ?Text) : async [Room] {
    // Returns only rooms where the caller is a participant
    let callerParticipantId = getParticipantId(caller);

    let allRooms = rooms.values().toArray();

    let filteredByParticipant = switch (filterParticipant) {
      case (null) {
        // Return rooms where caller is a participant
        allRooms.filter(func(room) { isParticipantInRoom(room, callerParticipantId) });
      };
      case (?participant) {
        // Return rooms where both caller and specified participant are members
        allRooms.filter(func(room) {
          isParticipantInRoom(room, callerParticipantId) and isParticipantInRoom(room, participant)
        });
      };
    };

    filteredByParticipant;
  };

  // Friends Management Functions
  public shared ({ caller }) func addFriend(friend : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add friends");
    };

    if (not profiles.containsKey(friend)) {
      Runtime.trap("Friend profile does not exist");
    };

    let friends = switch (friendLists.get(caller)) {
      case (null) { [] };
      case (?list) { list.friends };
    };

    // Check if already friends
    let alreadyFriends = friends.any(
      func(f) {
        Text.equal(f.principal.toText(), friend.toText());
      }
    );

    if (alreadyFriends) { return () };

    let newFriend : Friend = {
      principal = friend;
      isBestFriend = false;
    };

    let updatedFriends = friends.concat([newFriend]);

    friendLists.add(caller, { friends = updatedFriends });
  };

  public shared ({ caller }) func removeFriend(friend : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can remove friends");
    };

    let friends = switch (friendLists.get(caller)) {
      case (null) { [] };
      case (?list) { list.friends };
    };

    let updatedFriends = friends.filter(
      func(f) { not Text.equal(f.principal.toText(), friend.toText()) }
    );

    friendLists.add(caller, { friends = updatedFriends });
  };

  public shared ({ caller }) func toggleBestFriend(friend : Principal) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can toggle best friend status");
    };

    let friends = switch (friendLists.get(caller)) {
      case (null) { [] };
      case (?list) { list.friends };
    };

    let updatedFriends = friends.map(
      func(f) {
        if (Text.equal(f.principal.toText(), friend.toText())) {
          {
            principal = f.principal;
            isBestFriend = not f.isBestFriend;
          };
        } else {
          f;
        };
      }
    );

    friendLists.add(caller, { friends = updatedFriends });
  };

  public query ({ caller }) func getFriendsList() : async [Friend] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view friends list");
    };

    switch (friendLists.get(caller)) {
      case (null) { [] };
      case (?list) { list.friends.sort(compareBestFriends) };
    };
  };

  // New search query method for searching users
  public query ({ caller }) func searchUsers(term : Text) : async [SearchResult] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can search for users");
    };

    let lowerTerm = term.toLower();
    profiles.toArray().map(
      func((principal, profile)) {
        {
          principal;
          username = profile.username;
          displayName = profile.displayName;
          profilePicture = profile.profilePicture;
        };
      }
    ).filter(
      func(result) {
        result.username.toLower().contains(#text lowerTerm) or result.displayName.toLower().contains(#text lowerTerm)
      }
    );
  };

  // Profile Functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view their profile");
    };
    profiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    profiles.add(caller, profile);
  };
};

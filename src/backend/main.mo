import Array "mo:core/Array";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
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
import Migration "migration";

(with migration = Migration.run)
actor {
  // Authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  include MixinStorage();

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

  public type Message = {
    id : Nat;
    sender : Principal;
    receiver : Principal;
    timestamp : Time.Time;
    content : Text;
    replyTo : ?Nat;
    video : ?Storage.ExternalBlob;
  };

  public type Friend = {
    principal : Principal;
    isBestFriend : Bool;
  };

  public type FriendList = {
    friends : [Friend];
  };

  // State
  let profiles = Map.empty<Principal, UserProfile>();
  let messages = Map.empty<Nat, Message>();
  let friendLists = Map.empty<Principal, FriendList>();
  var nextMessageId = 0;

  // Helper Functions
  func compareMessagesByTime(m1 : Message, m2 : Message) : Order.Order {
    Int.compare(m1.timestamp, m2.timestamp);
  };

  func compareBestFriends(friend1 : Friend, friend2 : Friend) : Order.Order {
    switch (friend1.isBestFriend, friend2.isBestFriend) {
      case (true, false) { #less };
      case (false, true) { #greater };
      case (_, _) { friend1.principal.toText().compare(friend2.principal.toText()) };
    };
  };

  // User Profile Functions
  public shared ({ caller }) func createOrUpdateProfile(username : Text, displayName : Text, themeColor : Text, darkMode : Bool) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    profiles.get(user);
  };

  public shared ({ caller }) func updateProfilePicture(picture : Storage.ExternalBlob) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
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

  // Messaging Functions
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

  // Required profile functions for frontend
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

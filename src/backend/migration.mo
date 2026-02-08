import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import Storage "blob-storage/Storage";
import Time "mo:core/Time";

module {
  //------------------------
  // Old types (with Call stuff)
  //------------------------
  type OldUserProfile = {
    principal : Principal;
    username : Text;
    displayName : Text;
    profilePicture : ?Storage.ExternalBlob;
    themeColor : Text;
    darkMode : Bool;
  };

  type OldMessage = {
    id : Nat;
    sender : Principal;
    receiver : Principal;
    timestamp : Time.Time;
    content : Text;
    replyTo : ?Nat;
    video : ?Storage.ExternalBlob;
  };

  type OldCall = {
    id : Nat;
    caller : Principal;
    receiver : Principal;
    startTime : Time.Time;
    endTime : ?Time.Time;
    status : {
      #pending;
      #accepted;
      #declined;
      #missed;
      #ended;
    };
  };

  type OldFriend = {
    principal : Principal;
    isBestFriend : Bool;
  };

  type OldFriendList = {
    friends : [OldFriend];
  };

  type OldActor = {
    profiles : Map.Map<Principal, OldUserProfile>;
    messages : Map.Map<Nat, OldMessage>;
    calls : Map.Map<Nat, OldCall>;
    friendLists : Map.Map<Principal, OldFriendList>;
    nextMessageId : Nat;
    nextCallId : Nat;
  };

  //------------------------
  // New types (without Call stuff)
  //------------------------
  type NewUserProfile = {
    principal : Principal;
    username : Text;
    displayName : Text;
    profilePicture : ?Storage.ExternalBlob;
    themeColor : Text;
    darkMode : Bool;
  };

  type NewMessage = {
    id : Nat;
    sender : Principal;
    receiver : Principal;
    timestamp : Time.Time;
    content : Text;
    replyTo : ?Nat;
    video : ?Storage.ExternalBlob;
  };

  type NewFriend = {
    principal : Principal;
    isBestFriend : Bool;
  };

  type NewFriendList = {
    friends : [NewFriend];
  };

  type NewActor = {
    profiles : Map.Map<Principal, NewUserProfile>;
    messages : Map.Map<Nat, NewMessage>;
    friendLists : Map.Map<Principal, NewFriendList>;
    nextMessageId : Nat;
  };

  //------------------------
  // Migration function
  //------------------------
  public func run(old : OldActor) : NewActor {
    {
      profiles = old.profiles;
      messages = old.messages;
      friendLists = old.friendLists;
      nextMessageId = old.nextMessageId;
    };
  };
};

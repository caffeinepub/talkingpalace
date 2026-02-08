import Map "mo:core/Map";
import Text "mo:core/Text";
import Principal "mo:core/Principal";

module {
  type OldRoom = {
    id : Text;
    creator : Principal;
    joinCode : Text;
    participants : [Text];
    isGroup : Bool;
  };

  type OldActor = {
    rooms : Map.Map<Text, OldRoom>;
  };

  type NewRoom = {
    id : Text;
    creator : Principal;
    joinCode : Text;
    participants : [Text];
    isGroup : Bool;
  };

  type NewActor = {
    rooms : Map.Map<Text, NewRoom>;
  };

  // Data migration function, called via with migration = Migration.run in main actor.
  public func run(old : OldActor) : NewActor {
    let newRooms = old.rooms.map<Text, OldRoom, NewRoom>(
      func(_id, oldRoom) {
        { oldRoom with joinCode = oldRoom.joinCode.trim(#char ' ').toLower() };
      }
    );
    { rooms = newRooms };
  };
};

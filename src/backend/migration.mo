import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Text "mo:core/Text";
import Time "mo:core/Time";

module {
  // Gift Plan Type
  type BirthdayGiftPlan = {
    contactId : Text;
    giftIdea : Text;
    plannedDate : Time.Time;
    budget : ?Nat;
    notes : ?Text;
    status : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    contactsByPrincipal : Map.Map<Principal, List.List<{ id : Text; name : Text; birthMonth : Nat8; birthDay : Nat8; birthYear : ?Nat; notes : ?Text; createdAt : Time.Time; updatedAt : Time.Time }>>;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text }>;
    contactsByPrincipal : Map.Map<Principal, List.List<{ id : Text; name : Text; birthMonth : Nat8; birthDay : Nat8; birthYear : ?Nat; notes : ?Text; createdAt : Time.Time; updatedAt : Time.Time }>>;
    giftPlansByPrincipal : Map.Map<Principal, Map.Map<Text, BirthdayGiftPlan>>;
  };

  public func run(old : OldActor) : NewActor {
    { old with giftPlansByPrincipal = Map.empty() };
  };
};

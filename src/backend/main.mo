import Map "mo:core/Map";
import Time "mo:core/Time";
import List "mo:core/List";
import Nat8 "mo:core/Nat8";
import Text "mo:core/Text";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Access control system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type
  public type UserProfile = { name : Text };
  var userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // Contact Type
  public type Contact = {
    id : Text;
    name : Text;
    birthMonth : Nat8;
    birthDay : Nat8;
    birthYear : ?Nat;
    notes : ?Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
  };

  // Birthday Range Helper
  public type BirthdayRange = {
    startDate : Time.Time;
    durationDays : Nat;
  };

  func hasBirthdayInRange(contact : Contact, _currentTime : Time.Time, searchRange : BirthdayRange) : Bool {
    let currentMonth = 5 : Nat8;
    let currentDay = 28 : Nat8;

    if (
      (contact.birthMonth > currentMonth) or
      (
        contact.birthMonth == currentMonth and
        contact.birthDay >= currentDay and
        contact.birthDay - currentDay < Nat8.fromNat(searchRange.durationDays)
      )
    ) {
      return true;
    };

    let daysUntilYearEnd = (12 - currentMonth.toNat()) * 30 + (30 - currentDay.toNat());
    let remainingDays = searchRange.durationDays - daysUntilYearEnd.toNat();

    (remainingDays > 0 and
    (
      contact.birthMonth <= 12 and
      contact.birthDay <= 30 and
      ((contact.birthMonth.toNat() - 1) * 30 + contact.birthDay.toNat() <= remainingDays)
    ));
  };

  // Birthday Gift Plan Type
  public type BirthdayGiftPlan = {
    contactId : Text;
    giftIdea : Text;
    plannedDate : Time.Time;
    budget : ?Nat;
    notes : ?Text;
    status : Text;
    createdAt : Time.Time;
    updatedAt : Time.Time;
    isYearlyRecurring : Bool;
  };

  // Storage
  var contactsByPrincipal = Map.empty<Principal, List.List<Contact>>();
  var giftPlansByPrincipal : Map.Map<Principal, Map.Map<Text, BirthdayGiftPlan>> = Map.empty();

  // Domain configuration storage
  var configuredDomain : ?Text = null;

  // CRUD Contacts
  public query ({ caller }) func listContacts() : async [Contact] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list contacts");
    };
    switch (contactsByPrincipal.get(caller)) {
      case (null) { [] };
      case (?contacts) { contacts.toArray() };
    };
  };

  public shared ({ caller }) func createContact(
    id : Text, name : Text, birthMonth : Nat8, birthDay : Nat8,
    birthYear : ?Nat, notes : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create contacts");
    };
    let newContact : Contact = {
      id; name; birthMonth; birthDay; birthYear; notes;
      createdAt = Time.now(); updatedAt = Time.now();
    };

    let currentContacts = switch (contactsByPrincipal.get(caller)) {
      case (null) { List.empty<Contact>() };
      case (?contacts) { contacts };
    };

    currentContacts.add(newContact);
    contactsByPrincipal.add(caller, currentContacts);
  };

  public shared ({ caller }) func updateContact(
    id : Text, name : Text, birthMonth : Nat8, birthDay : Nat8,
    birthYear : ?Nat, notes : ?Text,
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update contacts");
    };
    switch (contactsByPrincipal.get(caller)) {
      case (null) {};
      case (?contacts) {
        let updatedContacts = contacts.map<Contact, Contact>(
          func(contact) {
            if (contact.id == id) {
              { id; name; birthMonth; birthDay; birthYear; notes; createdAt = contact.createdAt; updatedAt = Time.now() };
            } else { contact };
          }
        );
        contactsByPrincipal.add(caller, updatedContacts);
      };
    };
  };

  public shared ({ caller }) func deleteContact(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete contacts");
    };
    switch (contactsByPrincipal.get(caller)) {
      case (null) {};
      case (?contacts) {
        let filteredContacts = contacts.filter(
          func(contact) { contact.id != id }
        );
        contactsByPrincipal.add(caller, filteredContacts);
      };
    };
  };

  public query ({ caller }) func getUpcomingBirthdays(daysAhead : Nat) : async [Contact] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view upcoming birthdays");
    };
    switch (contactsByPrincipal.get(caller)) {
      case (null) { [] };
      case (?contacts) {
        let currentTime = Time.now();
        let searchRange : BirthdayRange = { startDate = currentTime; durationDays = daysAhead };
        let filteredContacts = contacts.filter(
          func(contact) { hasBirthdayInRange(contact, currentTime, searchRange) }
        );
        filteredContacts.toArray();
      };
    };
  };

  // CRUD Gift Plans
  public shared ({ caller }) func addBirthdayGiftPlan(
    contactId : Text, giftIdea : Text, plannedDate : Time.Time,
    budget : ?Nat, notes : ?Text, status : Text, isYearlyRecurring : Bool
  ) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can add gift plans");
    };
    let id = contactId;
    let newGiftPlan : BirthdayGiftPlan = {
      contactId; giftIdea; plannedDate; budget; notes; status;
      createdAt = Time.now(); updatedAt = Time.now();
      isYearlyRecurring;
    };

    let currentPlans = switch (giftPlansByPrincipal.get(caller)) {
      case (null) { Map.empty<Text, BirthdayGiftPlan>() };
      case (?plans) { plans };
    };

    currentPlans.add(id, newGiftPlan);
    giftPlansByPrincipal.add(caller, currentPlans);
    id;
  };

  public query ({ caller }) func getBirthdayGiftPlansForContact(contactId : Text) : async [BirthdayGiftPlan] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view gift plans");
    };
    switch (giftPlansByPrincipal.get(caller)) {
      case (null) { [] };
      case (?plans) {
        plans.values().toArray().filter(
          func(plan) { plan.contactId == contactId }
        );
      };
    };
  };

  public query ({ caller }) func getBirthdayGiftPlan(id : Text) : async ?BirthdayGiftPlan {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view gift plans");
    };
    switch (giftPlansByPrincipal.get(caller)) {
      case (null) { null };
      case (?plans) { plans.get(id) };
    };
  };

  public query ({ caller }) func listBirthdayGiftPlans() : async [BirthdayGiftPlan] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can list gift plans");
    };
    switch (giftPlansByPrincipal.get(caller)) {
      case (null) { [] };
      case (?plans) { plans.values().toArray() };
    };
  };

  public shared ({ caller }) func updateBirthdayGiftPlan(
    id : Text, giftIdea : Text, plannedDate : Time.Time,
    budget : ?Nat, notes : ?Text, status : Text, isYearlyRecurring : Bool
  ) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update gift plans");
    };
    switch (giftPlansByPrincipal.get(caller)) {
      case (null) {};
      case (?plans) {
        let existingPlan = plans.get(id);
        switch (existingPlan) {
          case (null) {};
          case (?plan) {
            let updatedPlan : BirthdayGiftPlan = {
              contactId = plan.contactId;
              giftIdea; plannedDate; budget; notes; status;
              createdAt = plan.createdAt; updatedAt = Time.now();
              isYearlyRecurring;
            };
            plans.add(id, updatedPlan);
          };
        };
      };
    };
  };

  public shared ({ caller }) func deleteBirthdayGiftPlan(id : Text) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete gift plans");
    };
    switch (giftPlansByPrincipal.get(caller)) {
      case (null) {};
      case (?plans) {
        plans.remove(id);
      };
    };
  };

  public shared ({ caller }) func suggestDomainSlugs(_ : Nat) : async [Text] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can generate domain slugs");
    };
    ["birthday-buddy-0", "birthday-buddy-1", "birthday-buddy-2", "birthday-buddy-3", "birthday-buddy-4"];
  };

  public shared ({ caller }) func configureDomain(slug : Text) : async Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can configure domains");
    };
    configuredDomain := ?slug;
    "https://" # slug # ".ic0.app";
  };

  public query ({ caller }) func getConfiguredDomain() : async ?Text {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view configured domain");
    };
    configuredDomain;
  };
};

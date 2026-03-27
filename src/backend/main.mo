import Array "mo:core/Array";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Order "mo:core/Order";
import Text "mo:core/Text";

import MixinStorage "blob-storage/Mixin";
import Storage "blob-storage/Storage";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  include MixinStorage();

  // Actor state and types
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // User Profile Type (required by frontend)
  public type UserProfile = {
    userId : Principal;
    name : Text;
    email : Text;
    phone : Text;
    role : Text; // "client", "driver", "admin"
    createdAt : Int;
    loyaltyPoints : Nat;
  };

  type DriverProfile = {
    userId : Principal;
    licenseNumber : Text;
    tricycleModel : Text;
    tricyclePlate : Text;
    isAvailable : Bool;
    rating : Float;
    totalTrips : Nat;
    earnings : Float;
    lat : Float;
    lng : Float;
    documentBlobId : ?Text;
    photoBlobId : ?Text;
  };

  type Rating = {
    id : Nat;
    tripId : Nat;
    clientId : Principal;
    driverId : Principal;
    score : Nat;
    comment : Text;
    createdAt : Int;
  };

  type Message = {
    id : Nat;
    tripId : Nat;
    sender : Principal;
    message : Text;
    createdAt : Int;
  };

  type Notification = {
    id : Nat;
    user : Principal;
    message : Text;
    createdAt : Int;
    read : Bool;
  };

  type TripStatus = {
    #pending;
    #accepted;
    #inProgress;
    #completed;
    #cancelled;
  };

  type Trip = {
    id : Nat;
    client : Principal;
    driver : Principal;
    status : TripStatus;
    origin : Text;
    destination : Text;
    price : Float;
    createdAt : Int;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();
  let driverProfiles = Map.empty<Principal, DriverProfile>();
  let ratings = Map.empty<Nat, Rating>();
  let messages = Map.empty<Nat, Message>();
  let notifications = Map.empty<Nat, Notification>();
  let trips = Map.empty<Nat, Trip>();

  var nextRatingId = 0;
  var nextMessageId = 0;
  var nextNotificationId = 0;
  var nextTripId = 0;

  // Required profile management functions
  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
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

  public query ({ caller }) func getCurrentUserRole() : async AccessControl.UserRole {
    AccessControl.getUserRole(accessControlState, caller);
  };

  module Rating {
    public func compare(rating1 : Rating, rating2 : Rating) : Order.Order {
      Nat.compare(rating1.id, rating2.id);
    };
    public func compareByDriverId(rating1 : Rating, rating2 : Rating) : Order.Order {
      switch (Principal.compare(rating1.driverId, rating2.driverId)) {
        case (#equal) { Nat.compare(rating1.id, rating2.id) };
        case (order) { order };
      };
    };
    public func compareByTripId(rating1 : Rating, rating2 : Rating) : Order.Order {
      switch (Nat.compare(rating1.tripId, rating2.tripId)) {
        case (#equal) { Nat.compare(rating1.id, rating2.id) };
        case (order) { order };
      };
    };
  };

  module Message {
    public func compare(message1 : Message, message2 : Message) : Order.Order {
      Nat.compare(message1.id, message2.id);
    };
    public func compareByTripId(message1 : Message, message2 : Message) : Order.Order {
      switch (Nat.compare(message1.tripId, message2.tripId)) {
        case (#equal) { Nat.compare(message1.id, message2.id) };
        case (order) { order };
      };
    };
  };

  module Notification {
    public func compare(notification1 : Notification, notification2 : Notification) : Order.Order {
      Nat.compare(notification1.id, notification2.id);
    };
    public func compareByUserId(notification1 : Notification, notification2 : Notification) : Order.Order {
      switch (Principal.compare(notification1.user, notification2.user)) {
        case (#equal) { Nat.compare(notification1.id, notification2.id) };
        case (order) { order };
      };
    };
  };

  module Trip {
    public func compare(trip1 : Trip, trip2 : Trip) : Order.Order {
      Nat.compare(trip1.id, trip2.id);
    };
    public func compareByDriverId(trip1 : Trip, trip2 : Trip) : Order.Order {
      switch (Principal.compare(trip1.driver, trip2.driver)) {
        case (#equal) { Nat.compare(trip1.id, trip2.id) };
        case (order) { order };
      };
    };
    public func compareByClientId(trip1 : Trip, trip2 : Trip) : Order.Order {
      switch (Principal.compare(trip1.client, trip2.client)) {
        case (#equal) { Nat.compare(trip1.id, trip2.id) };
        case (order) { order };
      };
    };
  };

  // Helper function to check if user is involved in a trip
  func isUserInvolvedInTrip(trip : Trip, user : Principal) : Bool {
    trip.client == user or trip.driver == user;
  };

  // Rating Functions
  public shared ({ caller }) func submitRating(tripId : Nat, driverId : Principal, score : Nat, comment : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can submit ratings");
    };
    
    if (score < 1 or score > 5) {
      Runtime.trap("Score must be between 1 and 5");
    };
    
    // Verify the caller is the client of the trip
    switch (trips.get(tripId)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trip) {
        if (trip.client != caller) {
          Runtime.trap("Unauthorized: Only the trip client can submit a rating");
        };
        if (trip.driver != driverId) {
          Runtime.trap("Driver mismatch for this trip");
        };
        if (trip.status != #completed) {
          Runtime.trap("Can only rate completed trips");
        };
      };
    };
    
    let id = nextRatingId;
    nextRatingId += 1;
    let rating : Rating = {
      id;
      tripId;
      clientId = caller;
      driverId;
      score;
      comment;
      createdAt = Time.now();
    };
    ratings.add(id, rating);
    id;
  };

  public query ({ caller }) func getDriverRatings(driverId : Principal) : async [Rating] {
    // Anyone can view driver ratings (public information)
    let allRatings = ratings.values().toArray();
    allRatings.filter<Rating>(func(r) { r.driverId == driverId });
  };

  public query ({ caller }) func getAllRatings() : async [Rating] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all ratings");
    };
    ratings.values().toArray().sort();
  };

  // Message Functions
  public shared ({ caller }) func sendMessage(tripId : Nat, message : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can send messages");
    };
    
    // Verify the caller is involved in the trip
    switch (trips.get(tripId)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trip) {
        if (not isUserInvolvedInTrip(trip, caller)) {
          Runtime.trap("Unauthorized: Only trip participants can send messages");
        };
      };
    };
    
    let id = nextMessageId;
    nextMessageId += 1;
    let msg : Message = {
      id;
      tripId;
      sender = caller;
      message;
      createdAt = Time.now();
    };
    messages.add(id, msg);
    id;
  };

  public query ({ caller }) func getTripMessages(tripId : Nat) : async [Message] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view messages");
    };
    
    // Verify the caller is involved in the trip or is an admin
    switch (trips.get(tripId)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trip) {
        if (not isUserInvolvedInTrip(trip, caller) and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only trip participants can view messages");
        };
      };
    };
    
    let allMessages = messages.values().toArray();
    allMessages.filter<Message>(func(m) { m.tripId == tripId }).sort();
  };

  // Notification Functions
  public shared ({ caller }) func createNotification(user : Principal, message : Text) : async Nat {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can create notifications");
    };
    
    let id = nextNotificationId;
    nextNotificationId += 1;
    let notification : Notification = {
      id;
      user;
      message;
      createdAt = Time.now();
      read = false;
    };
    notifications.add(id, notification);
    id;
  };

  public query ({ caller }) func getUserNotifications(user : Principal) : async [Notification] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view notifications");
    };
    
    // Users can only view their own notifications, admins can view any
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own notifications");
    };
    
    let allNotifications = notifications.values().toArray();
    allNotifications.filter<Notification>(func(n) { n.user == user }).sort();
  };

  public shared ({ caller }) func markNotificationRead(notificationId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark notifications as read");
    };
    
    switch (notifications.get(notificationId)) {
      case (null) { Runtime.trap("Notification not found") };
      case (?notification) {
        // Users can only mark their own notifications as read
        if (notification.user != caller) {
          Runtime.trap("Unauthorized: Can only mark your own notifications as read");
        };
        
        let updatedNotification = {
          id = notification.id;
          user = notification.user;
          message = notification.message;
          createdAt = notification.createdAt;
          read = true;
        };
        notifications.add(notificationId, updatedNotification);
      };
    };
  };

  // Trip Functions
  public shared ({ caller }) func requestTrip(destination : Text, price : Float) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can request trips");
    };
    
    if (price <= 0) {
      Runtime.trap("Price must be greater than 0");
    };
    
    let id = nextTripId;
    nextTripId += 1;
    let trip : Trip = {
      id;
      client = caller;
      driver = Principal.fromText("aaaaa-aa"); // Placeholder for unassigned
      status = #pending;
      origin = "origin";
      destination;
      price;
      createdAt = Time.now();
    };
    trips.add(id, trip);
    id;
  };

  public shared ({ caller }) func acceptTrip(tripId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can accept trips");
    };
    
    switch (trips.get(tripId)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trip) {
        if (trip.status != #pending) {
          Runtime.trap("Trip is not available for acceptance");
        };
        
        let updatedTrip : Trip = {
          id = trip.id;
          client = trip.client;
          driver = caller;
          status = #accepted;
          origin = trip.origin;
          destination = trip.destination;
          price = trip.price;
          createdAt = trip.createdAt;
        };
        trips.add(tripId, updatedTrip);
      };
    };
  };

  public shared ({ caller }) func startTrip(tripId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can start trips");
    };
    
    switch (trips.get(tripId)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trip) {
        if (trip.driver != caller) {
          Runtime.trap("Unauthorized: Only the assigned driver can start this trip");
        };
        if (trip.status != #accepted) {
          Runtime.trap("Trip must be accepted before starting");
        };
        
        let updatedTrip : Trip = {
          id = trip.id;
          client = trip.client;
          driver = trip.driver;
          status = #inProgress;
          origin = trip.origin;
          destination = trip.destination;
          price = trip.price;
          createdAt = trip.createdAt;
        };
        trips.add(tripId, updatedTrip);
      };
    };
  };

  public shared ({ caller }) func completeTrip(tripId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can complete trips");
    };
    
    switch (trips.get(tripId)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trip) {
        if (trip.driver != caller) {
          Runtime.trap("Unauthorized: Only the assigned driver can complete this trip");
        };
        if (trip.status != #inProgress) {
          Runtime.trap("Trip must be in progress to complete");
        };
        
        let updatedTrip : Trip = {
          id = trip.id;
          client = trip.client;
          driver = trip.driver;
          status = #completed;
          origin = trip.origin;
          destination = trip.destination;
          price = trip.price;
          createdAt = trip.createdAt;
        };
        trips.add(tripId, updatedTrip);
      };
    };
  };

  public shared ({ caller }) func cancelTrip(tripId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can cancel trips");
    };
    
    switch (trips.get(tripId)) {
      case (null) { Runtime.trap("Trip not found") };
      case (?trip) {
        // Client or driver can cancel, but not after completion
        if (not isUserInvolvedInTrip(trip, caller)) {
          Runtime.trap("Unauthorized: Only trip participants can cancel");
        };
        if (trip.status == #completed) {
          Runtime.trap("Cannot cancel completed trips");
        };
        
        let updatedTrip : Trip = {
          id = trip.id;
          client = trip.client;
          driver = trip.driver;
          status = #cancelled;
          origin = trip.origin;
          destination = trip.destination;
          price = trip.price;
          createdAt = trip.createdAt;
        };
        trips.add(tripId, updatedTrip);
      };
    };
  };

  public query ({ caller }) func getDriverTrips(driverId : Principal) : async [Trip] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trips");
    };
    
    // Drivers can view their own trips, admins can view any driver's trips
    if (caller != driverId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own trips");
    };
    
    let allTrips = trips.values().toArray();
    allTrips.filter<Trip>(func(t) { t.driver == driverId }).sort();
  };

  public query ({ caller }) func getClientTrips(clientId : Principal) : async [Trip] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view trips");
    };
    
    // Clients can view their own trips, admins can view any client's trips
    if (caller != clientId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own trips");
    };
    
    let allTrips = trips.values().toArray();
    allTrips.filter<Trip>(func(t) { t.client == clientId }).sort();
  };

  public query ({ caller }) func getAllTrips() : async [Trip] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all trips");
    };
    trips.values().toArray().sort();
  };

  // Driver Profile Functions
  public shared ({ caller }) func updateDriverProfile(profile : DriverProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update driver profiles");
    };
    
    // Drivers can only update their own profile
    if (profile.userId != caller) {
      Runtime.trap("Unauthorized: Can only update your own driver profile");
    };
    
    driverProfiles.add(caller, profile);
  };

  public query ({ caller }) func getDriverProfile(driverId : Principal) : async ?DriverProfile {
    // Anyone can view driver profiles (public information for marketplace)
    driverProfiles.get(driverId);
  };

  public query ({ caller }) func getAllDriverProfiles() : async [DriverProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all driver profiles");
    };
    driverProfiles.values().toArray();
  };

  // Admin Functions
  public query ({ caller }) func getAllUsers() : async [UserProfile] {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view all users");
    };
    userProfiles.values().toArray();
  };

  public query ({ caller }) func getRevenueSummary() : async Float {
    if (not (AccessControl.isAdmin(accessControlState, caller))) {
      Runtime.trap("Unauthorized: Only admins can view revenue summary");
    };
    
    var totalRevenue : Float = 0.0;
    for (trip in trips.values()) {
      if (trip.status == #completed) {
        totalRevenue += trip.price;
      };
    };
    totalRevenue;
  };
};

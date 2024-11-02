import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Vec "mo:vector";
import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Nat "mo:base/Nat";
import D "mo:base/Debug";
import CertifiedData "mo:base/CertifiedData";
import Result "mo:base/Result";
import Nat64 "mo:base/Nat64";
import Blob "mo:base/Blob";
import Error "mo:base/Error";
import Debug "mo:base/Debug";
import HashMap "mo:base/HashMap";
import Hash "mo:base/Hash";
import Iter "mo:base/Iter";
import Option "mo:base/Option";
import Types "types";

import CertTree "mo:cert/CertTree";

import ICRC7 "mo:icrc7-mo";
import ICRC37 "mo:icrc37-mo";
import ICRC3 "mo:icrc3-mo";

import ICRC7Default "./initial_state/icrc7";
import ICRC37Default "./initial_state/icrc37";
import ICRC3Default "./initial_state/icrc3";

shared (_init_msg) actor class LCT(
  _args : {
    icrc7_args : ?ICRC7.InitArgs;
    icrc37_args : ?ICRC37.InitArgs;
    icrc3_args : ICRC3.InitArgs;
  }
) = this {

  // Use a simple array for controllers instead of TrieSet
  private stable var controllers : [Principal] = [_init_msg.caller];

  // Function to check if a principal is a controller
  private func isController(principal : Principal) : Bool {
    for (controller in controllers.vals()) {
      if (Principal.equal(controller, principal)) {
        return true;
      };
    };
    false;
  };

  // Add a public version that uses msg.caller
  public shared (msg) func checkIsController() : async Bool {
    isController(msg.caller);
  };

  // Function to add a controller
  public shared ({ caller }) func addController(newController : Principal) : async Result.Result<(), Text> {
    if (not isController(caller)) {
      return D.trap("Unauthorized: Only controllers can add new controllers");
    };

    if (Principal.isAnonymous(newController)) {
      return D.trap("Cannot add anonymous principal as controller");
    };

    // Check if already a controller
    if (isController(newController)) {
      return D.trap("Principal is already a controller");
    };

    // Add new controller
    controllers := Array.append(controllers, [newController]);
    #ok();
  };

  // Function to remove a controller
  public shared ({ caller }) func removeController(controllerToRemove : Principal) : async Result.Result<(), Text> {
    if (not isController(caller)) {
      return D.trap("Unauthorized: Only controllers can remove controllers");
    };

    if (controllers.size() <= 1) {
      return D.trap("Cannot remove the last controller");
    };

    // Create new array without the controller to remove
    let tempBuffer = Buffer.Buffer<Principal>(controllers.size());
    for (controller in controllers.vals()) {
      if (not Principal.equal(controller, controllerToRemove)) {
        tempBuffer.add(controller);
      };
    };

    if (tempBuffer.size() == controllers.size()) {
      return D.trap("Controller not found");
    };

    controllers := Buffer.toArray(tempBuffer);
    #ok();
  };

  // Function to list all controllers
  public query func listControllers() : async [Principal] {
    controllers;
  };

  // ================================================================

  public shared (msg) func whoami() : async Principal {
    msg.caller;
  };

  type Account = ICRC7.Account;
  type Environment = ICRC7.Environment;
  type Value = ICRC7.Value;
  type NFT = ICRC7.NFT;
  type NFTShared = ICRC7.NFTShared;
  type NFTMap = ICRC7.NFTMap;
  type OwnerOfResponse = ICRC7.Service.OwnerOfResponse;
  type OwnerOfRequest = ICRC7.Service.OwnerOfRequest;
  type TransferArgs = ICRC7.Service.TransferArg;
  type TransferResult = ICRC7.Service.TransferResult;
  type TransferError = ICRC7.Service.TransferError;
  type BalanceOfRequest = ICRC7.Service.BalanceOfRequest;
  type BalanceOfResponse = ICRC7.Service.BalanceOfResponse;
  type TokenApproval = ICRC37.Service.TokenApproval;
  type CollectionApproval = ICRC37.Service.CollectionApproval;
  type ApprovalInfo = ICRC37.Service.ApprovalInfo;
  type ApproveTokenResult = ICRC37.Service.ApproveTokenResult;
  type ApproveTokenArg = ICRC37.Service.ApproveTokenArg;
  type ApproveCollectionArg = ICRC37.Service.ApproveCollectionArg;
  type IsApprovedArg = ICRC37.Service.IsApprovedArg;

  type ApproveCollectionResult = ICRC37.Service.ApproveCollectionResult;
  type RevokeTokenApprovalArg = ICRC37.Service.RevokeTokenApprovalArg;

  type RevokeCollectionApprovalArg = ICRC37.Service.RevokeCollectionApprovalArg;

  type TransferFromArg = ICRC37.Service.TransferFromArg;
  type TransferFromResult = ICRC37.Service.TransferFromResult;
  type RevokeTokenApprovalResult = ICRC37.Service.RevokeTokenApprovalResult;
  type RevokeCollectionApprovalResult = ICRC37.Service.RevokeCollectionApprovalResult;

  stable var init_msg = _init_msg; //preserves original initialization;

  stable var icrc7_migration_state = ICRC7.init(
    ICRC7.initialState(),
    #v0_1_0(#id),
    switch (_args.icrc7_args) {
      case (null) ICRC7Default.defaultConfig(init_msg.caller);
      case (?val) val;
    },
    init_msg.caller,
  );

  let #v0_1_0(#data(icrc7_state_current)) = icrc7_migration_state;

  stable var icrc37_migration_state = ICRC37.init(
    ICRC37.initialState(),
    #v0_1_0(#id),
    switch (_args.icrc37_args) {
      case (null) ICRC37Default.defaultConfig(init_msg.caller);
      case (?val) val;
    },
    init_msg.caller,
  );

  let #v0_1_0(#data(icrc37_state_current)) = icrc37_migration_state;

  stable var icrc3_migration_state = ICRC3.init(
    ICRC3.initialState(),
    #v0_1_0(#id),
    switch (_args.icrc3_args) {
      case (null) ICRC3Default.defaultConfig(init_msg.caller);
      case (?val) ?val : ICRC3.InitArgs;
    },
    init_msg.caller,
  );

  let #v0_1_0(#data(icrc3_state_current)) = icrc3_migration_state;

  private var _icrc7 : ?ICRC7.ICRC7 = null;
  private var _icrc37 : ?ICRC37.ICRC37 = null;
  private var _icrc3 : ?ICRC3.ICRC3 = null;

  private func get_icrc7_state() : ICRC7.CurrentState {
    return icrc7_state_current;
  };

  private func get_icrc37_state() : ICRC37.CurrentState {
    return icrc37_state_current;
  };

  // private func get_icrc3_state() : ICRC3.CurrentState {
  //   return icrc3_state_current;
  // };

  stable let cert_store : CertTree.Store = CertTree.newStore();
  let ct = CertTree.Ops(cert_store);

  private func get_certificate_store() : CertTree.Store {
    D.print("returning cert store " # debug_show (cert_store));
    return cert_store;
  };

  private func updated_certification(_cert : Blob, _lastIndex : Nat) : Bool {

    D.print("updating the certification " # debug_show (CertifiedData.getCertificate(), ct.treeHash()));
    ct.setCertifiedData();
    D.print("did the certification " # debug_show (CertifiedData.getCertificate()));
    return true;
  };

  private func get_icrc3_environment() : ICRC3.Environment {
    ?{
      updated_certification = ?updated_certification;
      get_certificate_store = ?get_certificate_store;
    };
  };

  D.print("Initargs: " # debug_show (_args));

  func ensure_block_types(icrc3Class : ICRC3.ICRC3) : () {
    D.print("in ensure_block_types: ");
    let supportedBlocks = Buffer.fromIter<ICRC3.BlockType>(icrc3Class.supported_block_types().vals());

    let blockequal = func(a : { block_type : Text }, b : { block_type : Text }) : Bool {
      a.block_type == b.block_type;
    };

    for (thisItem in icrc7().supported_blocktypes().vals()) {
      if (Buffer.indexOf<ICRC3.BlockType>({ block_type = thisItem.0; url = thisItem.1 }, supportedBlocks, blockequal) == null) {
        supportedBlocks.add({ block_type = thisItem.0; url = thisItem.1 });
      };
    };

    for (thisItem in icrc37().supported_blocktypes().vals()) {
      if (Buffer.indexOf<ICRC3.BlockType>({ block_type = thisItem.0; url = thisItem.1 }, supportedBlocks, blockequal) == null) {
        supportedBlocks.add({ block_type = thisItem.0; url = thisItem.1 });
      };
    };

    icrc3Class.update_supported_blocks(Buffer.toArray(supportedBlocks));
  };

  func icrc3() : ICRC3.ICRC3 {
    switch (_icrc3) {
      case (null) {
        let initclass : ICRC3.ICRC3 = ICRC3.ICRC3(?icrc3_migration_state, Principal.fromActor(this), get_icrc3_environment());

        D.print("ensure should be done: " # debug_show (initclass.supported_block_types()));
        _icrc3 := ?initclass;
        ensure_block_types(initclass);

        initclass;
      };
      case (?val) val;
    };
  };

  private func get_icrc7_environment() : ICRC7.Environment {
    {
      canister = get_canister;
      get_time = get_time;
      refresh_state = get_icrc7_state;
      add_ledger_transaction = ?icrc3().add_record;
      can_mint = null;
      can_burn = null;
      can_transfer = null;
      can_update = null;
    };
  };

  private func get_icrc37_environment() : ICRC37.Environment {
    {
      canister = get_canister;
      get_time = get_time;
      refresh_state = get_icrc37_state;
      icrc7 = icrc7();
      can_transfer_from = null;
      can_approve_token = null;
      can_approve_collection = null;
      can_revoke_token_approval = null;
      can_revoke_collection_approval = null;
    };
  };

  func icrc7() : ICRC7.ICRC7 {
    switch (_icrc7) {
      case (null) {
        let initclass : ICRC7.ICRC7 = ICRC7.ICRC7(?icrc7_migration_state, Principal.fromActor(this), get_icrc7_environment());
        _icrc7 := ?initclass;
        initclass;
      };
      case (?val) val;
    };
  };

  func icrc37() : ICRC37.ICRC37 {
    switch (_icrc37) {
      case (null) {
        let initclass : ICRC37.ICRC37 = ICRC37.ICRC37(?icrc37_migration_state, Principal.fromActor(this), get_icrc37_environment());
        _icrc37 := ?initclass;
        initclass;
      };
      case (?val) val;
    };
  };

  private var canister_principal : ?Principal = null;

  private func get_canister() : Principal {
    switch (canister_principal) {
      case (null) {
        canister_principal := ?Principal.fromActor(this);
        Principal.fromActor(this);
      };
      case (?val) {
        val;
      };
    };
  };

  private func get_time() : Int {
    //note: you may want to implement a testing framework where you can set this time manually
    /* switch(state_current.testing.time_mode){
          case(#test){
              state_current.testing.test_time;
          };
          case(#standard){
               Time.now();
          };
      }; */
    Time.now();
  };

  public query func icrc7_symbol() : async Text {
    return switch (icrc7().get_ledger_info().symbol) {
      case (?val) val;
      case (null) "";
    };
  };

  public query func icrc7_name() : async Text {
    return switch (icrc7().get_ledger_info().name) {
      case (?val) val;
      case (null) "";
    };
  };

  public query func icrc7_description() : async ?Text {
    return icrc7().get_ledger_info().description;
  };

  public query func icrc7_logo() : async ?Text {
    return icrc7().get_ledger_info().logo;
  };

  public query func icrc7_max_memo_size() : async ?Nat {
    return ?icrc7().get_ledger_info().max_memo_size;
  };

  public query func icrc7_tx_window() : async ?Nat {
    return ?icrc7().get_ledger_info().tx_window;
  };

  public query func icrc7_permitted_drift() : async ?Nat {
    return ?icrc7().get_ledger_info().permitted_drift;
  };

  public query func icrc7_total_supply() : async Nat {
    return icrc7().get_stats().nft_count;
  };

  public query func icrc7_supply_cap() : async ?Nat {
    return icrc7().get_ledger_info().supply_cap;
  };

  public query func icrc37_max_approvals_per_token_or_collection() : async ?Nat {
    return icrc37().max_approvals_per_token_or_collection();
  };

  public query func icrc7_max_query_batch_size() : async ?Nat {
    return icrc7().max_query_batch_size();
  };

  public query func icrc7_max_update_batch_size() : async ?Nat {
    return icrc7().max_update_batch_size();
  };

  public query func icrc7_default_take_value() : async ?Nat {
    return icrc7().default_take_value();
  };

  public query func icrc7_max_take_value() : async ?Nat {
    return icrc7().max_take_value();
  };

  public query func icrc7_atomic_batch_transfers() : async ?Bool {
    return icrc7().atomic_batch_transfers();
  };

  public query func icrc37_max_revoke_approvals() : async ?Nat {
    return ?icrc37().get_ledger_info().max_revoke_approvals;
  };

  public query func icrc7_collection_metadata() : async [(Text, Value)] {

    let ledger_info = icrc7().collection_metadata();
    let ledger_info37 = icrc37().metadata();
    let results = Vec.new<(Text, Value)>();

    Vec.addFromIter(results, ledger_info.vals());
    Vec.addFromIter(results, ledger_info37.vals());

    ///add any addtional metadata here
    //Vec.addFromIter(results, [
    //  ("ICRC-7", #Text("your value"))
    //].vals());

    return Vec.toArray(results);
  };

  public query func icrc7_token_metadata(token_ids : [Nat]) : async [?[(Text, Value)]] {
    return icrc7().token_metadata(token_ids);
  };

  public query func icrc7_owner_of(token_ids : OwnerOfRequest) : async OwnerOfResponse {

    switch (icrc7().get_token_owners(token_ids)) {
      case (#ok(val)) val;
      case (#err(err)) D.trap(err);
    };
  };

  public query func icrc7_balance_of(accounts : BalanceOfRequest) : async BalanceOfResponse {
    return icrc7().balance_of(accounts);
  };

  public query func icrc7_tokens(prev : ?Nat, take : ?Nat) : async [Nat] {
    return icrc7().get_tokens_paginated(prev, take);
  };

  public query func icrc7_tokens_of(account : Account, prev : ?Nat, take : ?Nat) : async [Nat] {
    return icrc7().get_tokens_of_paginated(account, prev, take);
  };

  public query func icrc37_is_approved(args : [IsApprovedArg]) : async [Bool] {
    return icrc37().is_approved(args);
  };

  public query func icrc37_get_token_approvals(token_ids : [Nat], prev : ?TokenApproval, take : ?Nat) : async [TokenApproval] {

    return icrc37().get_token_approvals(token_ids, prev, take);
  };

  public query func icrc37_get_collection_approvals(owner : Account, prev : ?CollectionApproval, take : ?Nat) : async [CollectionApproval] {

    return icrc37().get_collection_approvals(owner, prev, take);
  };

  public query func icrc10_supported_standards() : async ICRC7.SupportedStandards {
    //todo: figure this out
    return [
      { name = "ICRC-7"; url = "https://github.com/dfinity/ICRC/ICRCs/ICRC-7" },
      {
        name = "ICRC-37";
        url = "https://github.com/dfinity/ICRC/ICRCs/ICRC-37";
      },
    ];
  };

  //Update calls

  public shared (msg) func icrc37_approve_tokens(args : [ApproveTokenArg]) : async [?ApproveTokenResult] {

    switch (icrc37().approve_transfers<system>(msg.caller, args)) {
      case (#ok(val)) val;
      case (#err(err)) D.trap(err);
    };
  };

  public shared (msg) func icrc37_approve_collection(approvals : [ApproveCollectionArg]) : async [?ApproveCollectionResult] {
    icrc37().approve_collection<system>(msg.caller, approvals);
  };

  public shared (msg) func icrc7_transfer<system>(args : [TransferArgs]) : async [?TransferResult] {
    icrc7().transfer(msg.caller, args);
  };

  public shared (msg) func icrc37_transfer_from<system>(args : [TransferFromArg]) : async [?TransferFromResult] {
    icrc37().transfer_from(msg.caller, args);
  };

  public shared (msg) func icrc37_revoke_token_approvals<system>(args : [RevokeTokenApprovalArg]) : async [?RevokeTokenApprovalResult] {
    icrc37().revoke_token_approvals(msg.caller, args);
  };

  public shared (msg) func icrc37_revoke_collection_approvals(args : [RevokeCollectionApprovalArg]) : async [?RevokeCollectionApprovalResult] {
    icrc37().revoke_collection_approvals(msg.caller, args);
  };

  /////////
  // ICRC3 endpoints
  /////////

  public query func icrc3_get_blocks(args : [ICRC3.TransactionRange]) : async ICRC3.GetTransactionsResult {
    return icrc3().get_blocks(args);
  };

  public query func icrc3_get_archives(args : ICRC3.GetArchivesArgs) : async ICRC3.GetArchivesResult {
    return icrc3().get_archives(args);
  };

  public query func icrc3_supported_block_types() : async [ICRC3.BlockType] {
    return icrc3().supported_block_types();
  };

  public query func icrc3_get_tip_certificate() : async ?ICRC3.DataCertificate {
    return icrc3().get_tip_certificate();
  };

  public query func get_tip() : async ICRC3.Tip {
    return icrc3().get_tip();
  };

  /////////
  // The following functions are not part of ICRC7 or ICRC37. They are provided as examples of how
  // one might deploy an NFT.
  /////////

  public shared (msg) func icrcX_mint(tokens : ICRC7.SetNFTRequest) : async [ICRC7.SetNFTResult] {
    if (not isController(msg.caller)) {
      D.trap("Unauthorized: Only controllers can mint tokens");
    };
    //for now we require an owner to mint.
    switch (icrc7().set_nfts<system>(msg.caller, tokens, true)) {
      case (#ok(val)) val;
      case (#err(err)) D.trap(err);
    };
  };

  public shared (msg) func icrcX_burn(tokens : ICRC7.BurnNFTRequest) : async ICRC7.BurnNFTBatchResponse {
    switch (icrc7().burn_nfts<system>(msg.caller, tokens)) {
      case (#ok(val)) val;
      case (#err(err)) D.trap(err);
    };
  };

  private stable var _init = false;
  public shared (_msg) func init() : async () {
    //can only be called once

    //Warning:  This is a test scenario and should not be used in production.  This creates an approval for the owner of the canister and this can be garbage collected if the max_approvals is hit.  We advise minting with the target owner in the metadata or creating an assign function (see assign)
    if (_init == false) {
      //approve the deployer as a spender on all tokens...
      let current_val = icrc37().get_state().ledger_info.collection_approval_requires_token;
      let _update = icrc37().update_ledger_info([#CollectionApprovalRequiresToken(false)]);
      let result = icrc37().approve_collection<system>(Principal.fromActor(this), [{ approval_info = { from_subaccount = null; spender = { owner = icrc7().get_state().owner; subaccount = null }; memo = null; expires_at = null; created_at_time = null } }]);
      let _update2 = icrc37().update_ledger_info([#CollectionApprovalRequiresToken(current_val)]);

      D.print(
        "initialized" # debug_show (
          result,
          {
            from_subaccount = null;
            spender = { owner = icrc7().get_state().owner; subaccount = null };
            memo = null;
            expires_at = null;
            created_at_time = null;
          },
        )
      );
    };
    _init := true;
  };

  //this lets an admin assign a token to an account
  public shared (_msg) func assign(token_id : Nat, account : Account) : async Nat {
    // if (msg.caller != icrc7().get_state().owner) D.trap("Unauthorized");

    switch (icrc7().transfer<system>(Principal.fromActor(this), [{ from_subaccount = null; to = account; token_id = token_id; memo = null; created_at_time = null }])[0]) {

      case (? #Ok(val)) val;
      case (? #Err(err)) D.trap(debug_show (err));
      case (_) D.trap("unknown");

    };
  };

  // Improved claimNFT function with better error handling and validation
  public shared (msg) func claimNFT(token_ids : [Nat]) : async Result.Result<Nat, Text> {
    // Validate input
    if (token_ids.size() == 0) {
      return #err("No token ID provided");
    };

    let token_id = token_ids[0];

    // Get caller principal
    let caller = msg.caller;

    // Return error if caller is anonymous
    if (Principal.isAnonymous(caller)) {
      return #err("Anonymous users cannot claim NFTs. Please login first.");
    };

    // Check if the NFT exists and get current owner
    let ownerResult = switch (icrc7().get_token_owners(token_ids)) {
      case (#ok(owners)) {
        if (owners.size() == 0) {
          return #err("Token does not exist");
        };
        owners[0];
      };
      case (#err(error)) {
        return #err("Error checking token ownership: " # debug_show (error));
      };
    };

    // Verify the NFT is owned by this canister
    let canister_principal = Principal.fromActor(this);
    if (ownerResult != ?{ owner = canister_principal; subaccount = null }) {
      return #err("NFT is not available for claiming");
    };

    // Prepare transfer arguments with explicit caller as destination
    let transferArgs : TransferArgs = {
      to = {
        owner = caller; // Using the caller's principal directly
        subaccount = null;
      };
      token_id = token_id;
      memo = null;
      from_subaccount = null;
      created_at_time = null;
    };

    // Execute transfer
    let transferResult = icrc7().transfer(canister_principal, [transferArgs]);

    // Handle transfer result
    switch (transferResult[0]) {
      case (null) {
        #err("Transfer failed: Unexpected null result");
      };
      case (? #Ok(val)) {
        #ok(val);
      };
      case (? #Err(error)) {
        #err("Transfer failed: " # debug_show (error));
      };
    };
  };

  // =================================================================================================================================================================================================

  // Add NFT type definitions
  public type NFTInfo = {
    tokenId : Nat;
    nftType : Text; // "normal" or "fractional"
    owner : ?Account;
    shareholders : ?[ShareHolder];
    metadata : ?[(Text, Value)];
  };

  private type ShareHolder = {
    owner : Account;
    shares : Nat;
  };

  private type FractionalNFTData = {
    tokenId : Nat;
    shareholders : [ShareHolder];
    totalShares : Nat;
  };

  // Store fractional ownership data
  private var fractionalNFTs = HashMap.HashMap<Nat, FractionalNFTData>(0, Nat.equal, Hash.hash);

  // Query Functions

  // Get NFT type and details
  public query func getNFTType(tokenId : Nat) : async {
    nftType : Text;
    owner : ?Account;
    shareholders : ?[ShareHolder];
  } {
    switch (fractionalNFTs.get(tokenId)) {
      case (?fractionalData) {
        {
          nftType = "fractional";
          owner = null;
          shareholders = ?fractionalData.shareholders;
        };
      };
      case (null) {
        switch (icrc7().get_token_owners([tokenId])) {
          case (#ok(owners)) {
            {
              nftType = "normal";
              owner = owners[0];
              shareholders = null;
            };
          };
          case (#err(_)) {
            {
              nftType = "not_found";
              owner = null;
              shareholders = null;
            };
          };
        };
      };
    };
  };

  // Check if NFT can be made fractional
  public query func canMakeFractional(tokenId : Nat) : async Bool {
    switch (icrc7().get_token_owners([tokenId])) {
      case (#ok(owners)) {
        switch (owners[0]) {
          case (?owner) {
            Principal.equal(owner.owner, Principal.fromActor(this));
          };
          case (null) { false };
        };
      };
      case (#err(_)) { false };
    };
  };

  // Get all NFTs with pagination
  public query func getAllNFTs(start : ?Nat, limit : ?Nat) : async {
    total : Nat;
    items : [NFTInfo];
  } {
    let tokens = icrc7().get_tokens_paginated(start, limit);
    let results = Buffer.Buffer<NFTInfo>(tokens.size());

    for (tokenId in tokens.vals()) {
      let metadata = icrc7().token_metadata([tokenId])[0];

      switch (fractionalNFTs.get(tokenId)) {
        case (?fractionalData) {
          results.add({
            tokenId = tokenId;
            nftType = "fractional";
            owner = null;
            shareholders = ?fractionalData.shareholders;
            metadata = metadata;
          });
        };
        case (null) {
          let ownerResult = icrc7().get_token_owners([tokenId]);
          switch (ownerResult) {
            case (#ok(owners)) {
              results.add({
                tokenId = tokenId;
                nftType = "normal";
                owner = owners[0];
                shareholders = null;
                metadata = metadata;
              });
            };
            case (#err(_)) {};
          };
        };
      };
    };

    {
      total = icrc7().get_stats().nft_count;
      items = Buffer.toArray(results);
    };
  };

  // Get all fractional NFTs
  public query func getAllFractionalNFTs() : async [NFTInfo] {
    let results = Buffer.Buffer<NFTInfo>(0);

    let entries = Iter.toArray(fractionalNFTs.entries());
    for ((tokenId, fractionalData) in entries.vals()) {
      let metadata = icrc7().token_metadata([tokenId])[0];
      results.add({
        tokenId = tokenId;
        nftType = "fractional";
        owner = null;
        shareholders = ?fractionalData.shareholders;
        metadata = metadata;
      });
    };

    Buffer.toArray(results);
  };

  // Get all normal NFTs with pagination
  public query func getAllNormalNFTs(start : ?Nat, limit : ?Nat) : async [NFTInfo] {
    let tokens = icrc7().get_tokens_paginated(start, limit);
    let results = Buffer.Buffer<NFTInfo>(tokens.size());

    for (tokenId in tokens.vals()) {
      switch (fractionalNFTs.get(tokenId)) {
        case (?_) {};
        case (null) {
          let metadata = icrc7().token_metadata([tokenId])[0];
          let ownerResult = icrc7().get_token_owners([tokenId]);
          switch (ownerResult) {
            case (#ok(owners)) {
              results.add({
                tokenId = tokenId;
                nftType = "normal";
                owner = owners[0];
                shareholders = null;
                metadata = metadata;
              });
            };
            case (#err(_)) {};
          };
        };
      };
    };

    Buffer.toArray(results);
  };

  // Get NFTs owned by an account
  public query func getAccountNFTs(account : Account) : async {
    normal : [NFTInfo];
    fractional : [NFTInfo];
  } {
    let normalNFTs = Buffer.Buffer<NFTInfo>(0);
    let fractionalNFTs_buf = Buffer.Buffer<NFTInfo>(0);

    // Get normal NFTs
    let tokens = icrc7().get_tokens_of_paginated(account, null, null);
    for (tokenId in tokens.vals()) {
      let metadata = icrc7().token_metadata([tokenId])[0];
      normalNFTs.add({
        tokenId = tokenId;
        nftType = "normal";
        owner = ?account;
        shareholders = null;
        metadata = metadata;
      });
    };

    // Get fractional NFTs
    let entries = Iter.toArray(fractionalNFTs.entries());
    for ((tokenId, data) in entries.vals()) {
      for (shareholder in data.shareholders.vals()) {
        if (accountsEqual(shareholder.owner, account)) {
          let metadata = icrc7().token_metadata([tokenId])[0];
          fractionalNFTs_buf.add({
            tokenId = tokenId;
            nftType = "fractional";
            owner = null;
            shareholders = ?data.shareholders;
            metadata = metadata;
          });
        };
      };
    };

    {
      normal = Buffer.toArray(normalNFTs);
      fractional = Buffer.toArray(fractionalNFTs_buf);
    };
  };

  // Get specific NFT details
  public query func getNFTDetails(tokenId : Nat) : async Result.Result<NFTInfo, Text> {
    let metadata = icrc7().token_metadata([tokenId])[0];

    switch (metadata) {
      case (null) { #err("NFT not found") };
      case (?_) {
        switch (fractionalNFTs.get(tokenId)) {
          case (?data) {
            #ok({
              tokenId = tokenId;
              nftType = "fractional";
              owner = null;
              shareholders = ?data.shareholders;
              metadata = metadata;
            });
          };
          case (null) {
            switch (icrc7().get_token_owners([tokenId])) {
              case (#ok(owners)) {
                #ok({
                  tokenId = tokenId;
                  nftType = "normal";
                  owner = owners[0];
                  shareholders = null;
                  metadata = metadata;
                });
              };
              case (#err(err)) {
                #err("Error getting owner: " # debug_show (err));
              };
            };
          };
        };
      };
    };
  };

  // Get shareholder details
  public query func getShareholderDetails(tokenId : Nat) : async Result.Result<{ totalShares : Nat; shareholders : [ShareHolder] }, Text> {
    switch (fractionalNFTs.get(tokenId)) {
      case (null) { #err("Not a fractional NFT") };
      case (?data) {
        #ok({
          totalShares = data.totalShares;
          shareholders = data.shareholders;
        });
      };
    };
  };

  // Make NFT fractional
  public shared (msg) func makeFractional(
    tokenId : Nat,
    owners : [Account],
    shares : [Nat],
    totalShares : Nat,
  ) : async Result.Result<(), Text> {
    // Check if already fractional
    switch (fractionalNFTs.get(tokenId)) {
      case (?_) { return #err("NFT is already fractional") };
      case (null) {
        // Check authorization
        if (not isController(msg.caller)) {
          return #err("Unauthorized: Only controllers can make NFT fractional");
        };

        // Verify NFT exists and is owned by canister
        let ownerResult = switch (icrc7().get_token_owners([tokenId])) {
          case (#ok(owners)) {
            if (owners.size() == 0) {
              return #err("Token does not exist");
            };
            owners[0];
          };
          case (#err(error)) {
            return #err("Error checking token ownership: " # debug_show (error));
          };
        };

        if (ownerResult != ?{ owner = Principal.fromActor(this); subaccount = null }) {
          return #err("NFT must be owned by the canister to make it fractional");
        };

        // Validate shares
        if (owners.size() != shares.size()) {
          return #err("Number of owners must match number of shares");
        };

        var actualTotalShares = 0;
        for (share in shares.vals()) {
          actualTotalShares += share;
        };

        if (actualTotalShares != totalShares) {
          return #err("Sum of shares must equal total shares: " # Nat.toText(totalShares));
        };

        // Create shareholders
        let shareholders = Buffer.Buffer<ShareHolder>(owners.size());
        for (i in Iter.range(0, owners.size() - 1)) {
          shareholders.add({
            owner = owners[i];
            shares = shares[i];
          });
        };

        // Store fractional data
        fractionalNFTs.put(
          tokenId,
          {
            tokenId = tokenId;
            shareholders = Buffer.toArray(shareholders);
            totalShares = totalShares;
          },
        );

        #ok();
      };
    };
  };

  // Transfer shares
  public shared (msg) func transferShares(
    tokenId : Nat,
    to : Account,
    shares : Nat,
  ) : async Result.Result<(), Text> {
    switch (fractionalNFTs.get(tokenId)) {
      case (null) {
        return #err("Not a fractional NFT");
      };
      case (?data) {
        let shareholders = Buffer.Buffer<ShareHolder>(data.shareholders.size());
        var senderShares : ?Nat = null;

        for (holder in data.shareholders.vals()) {
          if (accountsEqual(holder.owner, { owner = msg.caller; subaccount = null })) {
            senderShares := ?holder.shares;
          };
        };

        switch (senderShares) {
          case (null) {
            return #err("You don't own any shares");
          };
          case (?currentShares) {
            if (currentShares < shares) {
              return #err("Insufficient shares");
            };

            let newShareholders = Buffer.Buffer<ShareHolder>(0);
            for (holder in data.shareholders.vals()) {
              if (accountsEqual(holder.owner, { owner = msg.caller; subaccount = null })) {
                if (holder.shares > shares) {
                  newShareholders.add({
                    owner = holder.owner;
                    shares = holder.shares - shares;
                  });
                };
              } else if (accountsEqual(holder.owner, to)) {
                newShareholders.add({
                  owner = holder.owner;
                  shares = holder.shares + shares;
                });
              } else {
                newShareholders.add(holder);
              };
            };

            if (not hasAccount(to, Buffer.toArray(newShareholders))) {
              newShareholders.add({
                owner = to;
                shares = shares;
              });
            };

            fractionalNFTs.put(
              tokenId,
              {
                tokenId = data.tokenId;
                shareholders = Buffer.toArray(newShareholders);
                totalShares = data.totalShares;
              },
            );
          };
        };
        #ok();
      };
    };
  };

  // Helper functions
  private func hasAccount(account : Account, shareholders : [ShareHolder]) : Bool {
    for (holder in shareholders.vals()) {
      if (accountsEqual(holder.owner, account)) return true;
    };
    false;
  };

  private func accountsEqual(a : Account, b : Account) : Bool {
    Principal.equal(a.owner, b.owner) and Option.equal(a.subaccount, b.subaccount, Blob.equal);
  };

  // ================================================================================================================================================================================================================================================

  let ICP_FEE : Nat64 = 10_000;

  let ledger : actor {
    transfer : shared (
      args : {
        memo : Nat64;
        amount : { e8s : Nat64 };
        fee : { e8s : Nat64 };
        from_subaccount : ?[Nat8];
        to : [Nat8];
        created_at_time : ?{ timestamp_nanos : Nat64 };
      }
    ) -> async {
      #Ok : Nat64;
      #Err : {
        #InsufficientFunds : { balance : { e8s : Nat64 } };
        #TxTooOld : { allowed_window_nanos : Nat64 };
        #TxCreatedInFuture;
        #TxDuplicate : { duplicate_of : Nat64 };
      };
    };
    account_balance : shared query { account : [Nat8] } -> async { e8s : Nat64 };
    transfer_from : shared (
      args : {
        spender_subaccount : ?[Nat8];
        from : { owner : Principal; subaccount : ?[Nat8] };
        to : { owner : Principal; subaccount : ?[Nat8] };
        amount : { e8s : Nat64 };
        fee : { e8s : Nat64 };
        memo : ?[Nat8];
        created_at_time : ?{ timestamp_nanos : Nat64 };
      }
    ) -> async {
      #Ok : Nat64;
      #Err : {
        #InsufficientFunds : { balance : { e8s : Nat64 } };
        #TxTooOld : { allowed_window_nanos : Nat64 };
        #TxCreatedInFuture;
        #TxDuplicate : { duplicate_of : Nat64 };
      };
    };
  } = actor ("ryjl3-tyaaa-aaaaa-aaaba-cai");

  // Get ICP balance
  public shared func getICPBalance(principal : Principal) : async Result.Result<Nat64, Text> {
    try {
      let accountId = Principal.toLedgerAccount(principal, null);
      let balance = await ledger.account_balance({
        account = Blob.toArray(accountId);
      });
      #ok(balance.e8s);
    } catch (err) {
      #err("Failed to get balance: " # Error.message(err));
    };
  };

  // Transfer ICP from user's balance
  public shared (msg) func transfer_icp(to : Principal, amount : Nat64) : async Result.Result<Nat64, Text> {
    if (amount < ICP_FEE) {
      return #err("Amount must be greater than fee: " # debug_show (ICP_FEE));
    };

    try {
      let transferResult = await ledger.transfer_from({
        spender_subaccount = null;
        from = {
          owner = msg.caller;
          subaccount = null;
        };
        to = {
          owner = to;
          subaccount = null;
        };
        amount = { e8s = amount };
        fee = { e8s = ICP_FEE };
        memo = null;
        created_at_time = null;
      });

      switch (transferResult) {
        case (#Ok(blockIndex)) { #ok(blockIndex) };
        case (#Err(#InsufficientFunds { balance })) {
          #err("Insufficient funds. Balance: " # debug_show (balance));
        };
        case (#Err(#TxTooOld { allowed_window_nanos })) {
          #err("Transaction too old");
        };
        case (#Err(#TxCreatedInFuture)) {
          #err("Transaction created in future");
        };
        case (#Err(#TxDuplicate { duplicate_of })) {
          #err("Duplicate transaction");
        };
      };
    } catch (error) {
      #err("Failed to transfer: " # Error.message(error));
    };
  };
};

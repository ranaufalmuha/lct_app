import ICRC7 "mo:icrc7-mo";

module {
  public let defaultConfig = func(caller : Principal) : ICRC7.InitArgs {
    ?{
      symbol = ?"LCT";
      name = ?"Lost Club Toys";
      description = ?"Dive into the world of the Lost Club Toys. A fluffy collection of 3D cuteness. Made for good vibes and real world surprises!";
      logo = ?"http://bd3sg-teaaa-aaaaa-qaaba-cai.localhost:8000/images/FinalLogo.jpeg";
      supply_cap = null;
      allow_transfers = null;
      max_query_batch_size = ?100;
      max_update_batch_size = ?100;
      default_take_value = ?1000;
      max_take_value = ?10000;
      max_memo_size = ?512;
      permitted_drift = null;
      tx_window = null;
      burn_account = null; //burned nfts are deleted
      deployer = caller;
      supported_standards = null;
    };
  };
};

import ICRC7 "mo:icrc7-mo";

module {
  public let defaultConfig = func(caller : Principal) : ICRC7.InitArgs {
    ?{
      symbol = ?"LCT";
      name = ?"Lost Club Toys";
      description = ?"The Lost Club Toys NFT represents the genesis of an exclusive digital collectible series designed to celebrate the convergence of art, identity and decentralized technology. As the foundational piece in the Lost Club Toys ecosystem, this NFT serves as a symbol of access to a special circle of digital innovation, combining unique visual art with blockchain-driven utility. It’s a testament to the pioneering spirit of its holders, each contributing to a legacy of digital collectibles that bridge the physical and digital realms.";

      logo = ?"https://lrpon-yyaaa-aaaao-qeuda-cai.raw.icp0.io/images/FinalLogo.png";
      
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

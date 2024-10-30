import Principal "mo:base/Principal";

module {
    public type Tokens = {
        e8s : Nat64;
    };

    public type ICPTransferArgs = {
        amount : Tokens;
        toPrincipal : Principal;
        toSubaccount : ?Blob;
    };
};

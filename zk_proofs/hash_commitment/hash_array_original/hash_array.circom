pragma circom 2.0.0;
include "../../exp_elliptic/circom-ecdsa/node_modules/circomlib/circuits/comparators.circom";
include "../../exp_elliptic/circom-ecdsa/node_modules/circomlib/circuits/poseidon.circom";
/*This circuit template checks that commitment of array X is valid, i.e. hash(X) = comm

Public: comm
Private: X
*/  


template Commitment(N) {  
    signal input inputs[N];  
    signal input comm;

    component poseidon = Poseidon(N);

    for (var i=0; i<N; i++) {
        poseidon.inputs[i] <== inputs[i];
    }

    comm === poseidon.out;  
}

// component main {public [comm]} = Commitment(2);
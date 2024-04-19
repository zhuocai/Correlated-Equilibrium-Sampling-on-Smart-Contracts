pragma circom 2.0.0;
include "../permutation/permutation.circom";
include "../hash_commitment/hash_array_original/hash_array.circom";
include "../exp_elliptic/circom-ecdsa/circuits/secp256k1.circom";
// include "../hash_commitment/hash_array_long_inputs/hash_array.circom";

template protocol(N, logN, n, k) {  
    signal input comm_X;
    signal input comm_X_;

    signal input X[N];
    signal input X_[N];

    signal input P[N][N]; 
    signal input PA[N][N];

    signal input c_OT[2][k];
    signal input pk1[logN][2][k];
    signal input pk2[logN][2][k];

    component add_two_points[logN];

    for (var i=0; i<logN; i++) {
        add_two_points[i] = Secp256k1AddUnequal(n, k);

        for (var j=0; j<k; j++) {
            add_two_points[i].a[0][j] <== pk1[i][0][j];
            add_two_points[i].a[1][j] <== pk1[i][1][j];

            add_two_points[i].b[0][j] <== pk2[i][0][j];
            add_two_points[i].b[1][j] <== pk2[i][1][j];
        }

        for (var j=0; j<k; j++) {
            log(add_two_points[i].out[0][j]);
            log(add_two_points[i].out[1][j]);

            add_two_points[i].out[0][j] === c_OT[0][j];
            add_two_points[i].out[1][j] === c_OT[1][j];

            
        }

        // pk1[i] + pk2[i] === c_OT;
    }

    component perm = Permutation(N);
    
    for (var i=0; i<N; i++) {
        perm.A[i] <== X[i];
    }

    for (var i=0; i<N; i++) {
        perm.B[i] <== X_[i];
    }

    for (var i=0; i<N; i++) {
        for (var j=0; j<N; j++) {
            perm.P[i][j] <== P[i][j];
        }
    }

    for (var i=0; i<N; i++) {
        for (var j=0; j<N; j++) {
            perm.PA[i][j] <== PA[i][j];
        }
    }

    component hash_X = Commitment(N);

    for (var i=0; i<N; i++) {
        hash_X.inputs[i] <== X[i];
    }
    hash_X.comm <== comm_X;

    component hash_X_ = Commitment(N);

    for (var i=0; i<N; i++) {
        hash_X_.inputs[i] <== X_[i];
    }
    hash_X_.comm <== comm_X_;

}

component main {public [comm_X, comm_X_, c_OT]} = protocol(2, 1, 64, 4);
// component main {public [comm_X, comm_X_]} = protocol(2, 1, 64, 4);
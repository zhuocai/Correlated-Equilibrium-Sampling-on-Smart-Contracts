import path = require("path");
import buildPoseidon from './poseidon';
import { expect, assert } from 'chai';
import { getPublicKey, sign, Point, utils } from '@noble/secp256k1';
// import { getCurveFromName }  from "ffjavascript";
const circom_tester = require('circom_tester');
const wasm_tester = circom_tester.wasm;
// exports.wasm = require("../node_modules/circom_tester/wasm/tester");
// const wasm_tester = require("./../index").wasm;
// const wasm_tester = require("../node_modules/circom_tester/index").wasm;
const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;

exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

function bigint_to_tuple(x: bigint) {
    let mod: bigint = 2n ** 64n;
    let ret: [bigint, bigint, bigint, bigint] = [0n, 0n, 0n, 0n];

    var x_temp: bigint = x;
    for (var idx = 0; idx < ret.length; idx++) {
        ret[idx] = x_temp % mod;
        x_temp = x_temp / mod;
    }
    return ret;
}

function bigint_to_array(n: number, k: number, x: bigint) {
    let mod: bigint = 1n;
    for (var idx = 0; idx < n; idx++) {
        mod = mod * 2n;
    }

    let ret: bigint[] = [];
    var x_temp: bigint = x;
    for (var idx = 0; idx < k; idx++) {
        ret.push(x_temp % mod);
        x_temp = x_temp / mod;
    }
    return ret;
}

// converts x = sum of a[i] * 2 ** (small_stride * i) for 0 <= 2 ** small_stride - 1
//      to:     sum of a[i] * 2 ** (stride * i)
function get_strided_bigint(stride: bigint, small_stride: bigint, x: bigint) {
    var ret: bigint = 0n;
    var exp: bigint = 0n;
    while (x > 0) {
        var mod: bigint = x % (2n ** small_stride);
        ret = ret + mod * (2n ** (stride * exp));
        x = x / (2n ** small_stride);
        exp = exp + 1n;
    }
    return ret;
}

describe("ECDSAPrivToPub", async function () {
    this.timeout(1000 * 1000);

    // runs circom compilation
    let circuit: any;
    // circuit = await wasm_tester(path.join(__dirname, "circuits", "test_ecdsa.circom"));
    // console.log(circuit);
    before(async function () {
        circuit = await wasm_tester(path.join(__dirname, "circuits", "test_ecdsa.circom"));
    });
    // console.log(circuit);
    // return;

    // it("Checking the compilation of a simple circuit generating wasm", async function () {
    //     const circuit = await wasm_tester(path.join(__dirname, "circuits", "test_ecdsa.circom"));
    //     assert(circuit != undefined);
    //     // const w = await circuit.calculateWitness({a: 2, b: 4});
    //     // await circuit.checkConstraints(w);
        
    // });
    // return;
    // privkey, pub0, pub1
    var test_cases: Array<[bigint, bigint, bigint]> = [];

    // 4 randomly generated privkeys
    var privkeys: Array<bigint> = [88549154299169935420064281163296845505587953610183896504176354567359434168161n,
                                   37706893564732085918706190942542566344879680306879183356840008504374628845468n,
                                   90388020393783788847120091912026443124559466591761394939671630294477859800601n,
                                   110977009687373213104962226057480551605828725303063265716157300460694423838923n];

    // var tuple_privkey: [bigint, bigint, bigint, bigint] = [0n, 7n, 6n, 2n];
    // var test_privkey: bigint = tuple_privkey[1]+ 2n**86n*tuple_privkey[2] + 2n**172n*tuple_privkey[3];

    // console.log("tuple to bigint:", test_privkey);
    // console.log("bigint to tuple:", bigint_to_tuple(test_privkey))
    // 16 more keys
    for (var cnt = 1n; cnt < 2n ** 4n; cnt++) {
        var privkey: bigint = get_strided_bigint(10n, 1n, cnt);
        privkeys.push(privkey);
    }

    for (var idx = 0; idx < 2; idx++) {
        var pubkey: Point = Point.fromPrivateKey(privkeys[idx]);
        test_cases.push([privkeys[idx], pubkey.x, pubkey.y]);
    }

    var pk1s: Array<[[bigint, bigint], [bigint, bigint], [bigint, bigint], [bigint, bigint]]> = []
    var pk2s: Array<[[bigint, bigint], [bigint, bigint], [bigint, bigint], [bigint, bigint]]> = []

    var pk1s_points: Array<Point> = [];
    var pk2s_points: Array<Point> = [];

    // couldn't find a function that gets a random group element, so just getting random private key and its public key
    // var rand_privkey = utils.randomPrivateKey();
    // var c_ot: Point = Point.fromPrivateKey(rand_privkey);

    var c_ot: Point = new Point(60648280771547347683737942528643462893155849572804530653174358582867201385663n, 
    66992160239909488212415516843911575490755865199627500285074518790214167839474n);
    // c_ot.x = 60648280771547347683737942528643462893155849572804530653174358582867201385663n;
    // c_ot.y = 66992160239909488212415516843911575490755865199627500285074518790214167839474n;

    
    // var pk1: Point = Point.fromPrivateKey(privkeys[0]);
    // var pk2: Point = c_ot.subtract(pk1);

    

    for (var idx = 0; idx < 2; idx++) {
        var pk1: Point = Point.fromPrivateKey(privkeys[idx]);
        pk1s_points.push(pk1);

        var pk1_x = bigint_to_tuple(pk1.x);
        var pk1_y = bigint_to_tuple(pk1.y);
        pk1s.push([[pk1_x[0], pk1_x[1]], [pk1_x[2], pk1_x[3]], [pk1_y[0], pk1_y[1]], [pk1_y[2], pk1_y[3]]]);

        var pk2: Point = c_ot.subtract(pk1);
        pk2s_points.push(pk2);

        var pk2_x = bigint_to_tuple(pk2.x);
        var pk2_y = bigint_to_tuple(pk2.y);
        pk2s.push([[pk2_x[0], pk2_x[1]], [pk2_x[2], pk2_x[3]], [pk2_y[0], pk2_y[1]], [pk2_y[2], pk2_y[3]]]);
    }

    // console.log(pk1.add(pk2).equals(c_ot));
    // console.log("rand_privkey", rand_privkey);

    // console.log("c_ot", c_ot);
    console.log("c_ot X tuple ", bigint_to_tuple(c_ot.x));
    console.log("c_ot Y tuple ", bigint_to_tuple(c_ot.y));
    console.log("\n");

    // console.log("pk1", pk1);
    // console.log("pk1 X tuple ", bigint_to_tuple(pk1.x));
    // console.log("pk1 Y tuple ", bigint_to_tuple(pk1.y));
    // console.log("\n");

    // console.log("pk2", pk2);
    // console.log("pk2 X tuple ", bigint_to_tuple(pk2.x));
    // console.log("pk2 Y tuple ", bigint_to_tuple(pk2.y));
    // console.log("\n");
    for (var idx = 0; idx < 2; idx++) {
        console.log("PK1s:", idx, " ", pk1s[idx]);

        console.log("PK2s:", idx, " ", pk2s[idx])
    }

    var rand: Array<bigint> = [110977009687373213104962226057480551605828725303063265716157300460694423838923n,
        110977009687373213104962226057480551605828725303063265716157300460694423838923n];
    console.log("RAND", bigint_to_tuple(rand[0]))
    var pk1_test: Point = Point.fromPrivateKey(privkeys[0]);

    var res = pk1_test.multiply(rand[0]);
    console.log("mult res", res);
    console.log("mult_res X tuple ", bigint_to_tuple(res.x));
    console.log("mult_res Y tuple ", bigint_to_tuple(res.y));


    let poseidon = await buildPoseidon();
    // const res2 = poseidon([1,2]);
    // console.log(poseidon.F.toString(res2, 16));

    // const res3 = poseidon([1n,2n]);
    // console.log(poseidon.F.toString(res3, 16));

    // var idx = 1;
    // var bin = idx.toString(2);
    // console.log("dec to bin:", bin);
    // var j_k =  bin.charAt(idx-1);
    // console.log("i_th bin bit", j_k);
    var y_k_j_k;
    
    var X_: Array<any> = [1,2,3,4];
    for (var i=0; i<X_.length; i++) {
        var sum: any = 0;
        var bin = i.toString(2).padStart(2, '0');

        for (var k = 1; k < 3; k++) {
            // var bin = k.toString(2).padStart(2, '0');;
            var j_k =  parseInt(bin.charAt(k-1));
            // console.log(bin);
            // console.log(j_k);

            if (j_k==1) {
                y_k_j_k = pk2s_points[k-1];
            }
            else {
                y_k_j_k = pk1s_points[k-1];
            }
            var res_exp = y_k_j_k.multiply(rand[k-1]);
            var res_exp_x = bigint_to_tuple(res_exp.x);
            var res_exp_y = bigint_to_tuple(res_exp.y);
            var res_exp_to_arr = [res_exp_x[0], res_exp_x[1],res_exp_x[2],res_exp_x[3],
                                res_exp_y[0],res_exp_y[1],res_exp_y[2],res_exp_y[3], bin[0], bin[1]];
            var res_hash = poseidon(res_exp_to_arr);


            // console.log("res hash", poseidon.F.toString(res_hash, 16));
            // console.log("sum", poseidon.F.toString(poseidon.F.e(sum), 16));

            sum = poseidon.F.add(res_hash, poseidon.F.e(sum));
            // console.log("temp sum", poseidon.F.toString(poseidon.F.e(sum), 16));
        }
        // console.log("SUM for", X[i], "total:", poseidon.F.toString(sum, 16));
        var res_sum = poseidon.F.add(poseidon.F.e(X_[i]), sum);
        console.log("res sum enc: ", poseidon.F.toString(res_sum, 16));
    }

    // console.log(sum);

    
    // var test_ecdsa_instance = function (keys: [bigint, bigint, bigint]) {
    //     let privkey = keys[0];
    //     let pub0 = keys[1];
    //     let pub1 = keys[2];

    //     var priv_tuple: [bigint, bigint, bigint, bigint] = bigint_to_tuple(privkey);
    //     var pub0_tuple: [bigint, bigint, bigint, bigint] = bigint_to_tuple(pub0);
    //     var pub1_tuple: [bigint, bigint, bigint, bigint] = bigint_to_tuple(pub1);

    //     console.log("PRIV KEY", priv_tuple);
    //     console.log("PUB KEY X", pub0_tuple);
    //     console.log("PUB KEY Y", pub1_tuple);


        
    //     // return;

    //     // it('Testing privkey: ' + privkey + ' pubkey.x: ' + pub0 + ' pubkey.y: ' + pub1, async function() {
    //     //     let witness = await circuit.calculateWitness({"privkey": priv_tuple});
    //     //     expect(witness[1]).to.equal(pub0_tuple[0]);
    //     //     expect(witness[2]).to.equal(pub0_tuple[1]);
    //     //     expect(witness[3]).to.equal(pub0_tuple[2]);
    //     //     expect(witness[4]).to.equal(pub0_tuple[3]);
    //     //     expect(witness[5]).to.equal(pub1_tuple[0]);
    //     //     expect(witness[6]).to.equal(pub1_tuple[1]);
    //     //     expect(witness[7]).to.equal(pub1_tuple[2]);
    //     //     expect(witness[8]).to.equal(pub1_tuple[3]);
    //     //     await circuit.checkConstraints(witness);
    //     // });
    // }

    // test_cases.forEach(test_ecdsa_instance);
});

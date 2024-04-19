import path = require("path");

import { expect, assert } from 'chai';
import { getPublicKey, sign, Point, utils } from '@noble/secp256k1';
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

describe("ECDSAPrivToPub", function () {
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

    for (var idx = 0; idx < 1; idx++) {
        var pubkey: Point = Point.fromPrivateKey(privkeys[idx]);
        test_cases.push([privkeys[idx], pubkey.x, pubkey.y]);
    }

    // couldn't find a function that gets a random group element, so just getting random private key and its public key
    var rand_privkey = utils.randomPrivateKey();
    var c_ot: Point = Point.fromPrivateKey(rand_privkey);
    var pk1: Point = Point.fromPrivateKey(privkeys[0]);
    var pk2: Point = c_ot.subtract(pk1);

    console.log(pk1.add(pk2).equals(c_ot));
    // console.log("rand_privkey", rand_privkey);

    console.log("c_ot", c_ot);
    console.log("c_ot X tuple ", bigint_to_tuple(c_ot.x));
    console.log("c_ot Y tuple ", bigint_to_tuple(c_ot.y));
    console.log("\n");

    console.log("pk1", pk1);
    console.log("pk1 X tuple ", bigint_to_tuple(pk1.x));
    console.log("pk1 Y tuple ", bigint_to_tuple(pk1.y));
    console.log("\n");

    console.log("pk2", pk2);
    console.log("pk2 X tuple ", bigint_to_tuple(pk2.x));
    console.log("pk2 Y tuple ", bigint_to_tuple(pk2.y));
    console.log("\n");

    
    var test_ecdsa_instance = function (keys: [bigint, bigint, bigint]) {
        let privkey = keys[0];
        let pub0 = keys[1];
        let pub1 = keys[2];

        var priv_tuple: [bigint, bigint, bigint, bigint] = bigint_to_tuple(privkey);
        var pub0_tuple: [bigint, bigint, bigint, bigint] = bigint_to_tuple(pub0);
        var pub1_tuple: [bigint, bigint, bigint, bigint] = bigint_to_tuple(pub1);

        console.log("PRIV KEY", priv_tuple);
        console.log("PUB KEY X", pub0_tuple);
        console.log("PUB KEY Y", pub1_tuple);


        
        return;

        it('Testing privkey: ' + privkey + ' pubkey.x: ' + pub0 + ' pubkey.y: ' + pub1, async function() {
            let witness = await circuit.calculateWitness({"privkey": priv_tuple});
            expect(witness[1]).to.equal(pub0_tuple[0]);
            expect(witness[2]).to.equal(pub0_tuple[1]);
            expect(witness[3]).to.equal(pub0_tuple[2]);
            expect(witness[4]).to.equal(pub0_tuple[3]);
            expect(witness[5]).to.equal(pub1_tuple[0]);
            expect(witness[6]).to.equal(pub1_tuple[1]);
            expect(witness[7]).to.equal(pub1_tuple[2]);
            expect(witness[8]).to.equal(pub1_tuple[3]);
            await circuit.checkConstraints(witness);
        });
    }

    test_cases.forEach(test_ecdsa_instance);
});

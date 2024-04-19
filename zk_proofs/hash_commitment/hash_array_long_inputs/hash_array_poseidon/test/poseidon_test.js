import { assert } from "chai";
// const assert = chai.assert;

// import buildPoseidon from "../poseidon.js";
import buildPoseidon_ex from "../poseidon.js";

describe("Poseidon test", function () {
    // let poseidon;
    let poseidon_ex;
    this.timeout(10000000);

    before(async () => {
        // poseidon = await buildPoseidon();
        poseidon_ex = await buildPoseidon_ex();
    });

    it("Should check constrain reference implementation poseidonperm_x5_254_3", async () => {
        const res1 = poseidon_ex([1, 2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]);
        // const res1 = poseidon_ex([1,2]);
        console.log(res1);
        console.log(poseidon_ex.F.toString(res1, 16));
        assert(poseidon_ex.F.eq(poseidon_ex.F.e("0x3049adcf4e032266b43632de3568e7c4b4e5a51414813d5c64fb32aa6783f12b"), res1));
        // assert(poseidon_ex.F.eq(poseidon_ex.F.e("0x115cc0f5e7d690413df64c6b9662e9cf2a3617f2743245519e19607a4417189a"), res1));
    });
    // it("Should check constrain reference implementation poseidonperm_x5_254_5", async () => {
    //     const res1 = poseidon([1,2,3,4]);
    //     assert(poseidon.F.eq(poseidon.F.e("0x299c867db6c1fdd79dcefa40e4510b9837e60ebb1ce0663dbaa525df65250465"), res1));
    // });
});
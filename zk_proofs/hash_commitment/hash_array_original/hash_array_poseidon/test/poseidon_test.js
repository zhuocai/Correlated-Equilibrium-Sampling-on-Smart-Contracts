import { assert } from "chai";
// const assert = chai.assert;

import buildPoseidon from "../poseidon.js";

describe("Poseidon test", function () {
    let poseidon;
    this.timeout(10000000);

    before(async () => {
        poseidon = await buildPoseidon();
    });

    it("Should check constrain reference implementation poseidonperm_x5_254_3", async () => {
        const res1 = poseidon([1, 2]);
        assert(poseidon.F.eq(poseidon.F.e("0x115cc0f5e7d690413df64c6b9662e9cf2a3617f2743245519e19607a4417189a"), res1));
    });
    it("Should check constrain reference implementation poseidonperm_x5_254_5", async () => {
        const res1 = poseidon([1,2,3,4]);
        assert(poseidon.F.eq(poseidon.F.e("0x299c867db6c1fdd79dcefa40e4510b9837e60ebb1ce0663dbaa525df65250465"), res1));
    });
});
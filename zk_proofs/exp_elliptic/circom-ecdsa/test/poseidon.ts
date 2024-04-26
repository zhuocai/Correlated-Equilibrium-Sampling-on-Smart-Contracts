
import assert from "assert";
// import { getCurveFromName }  from "ffjavascript";
const getCurveFromName = require("ffjavascript").getCurveFromName;

import poseidonConstants from "./poseidon_constants";

function unsringifyConstants(Fr: any, o: any):any {
    if ((typeof(o) == "string") && (/^[0-9]+$/.test(o) ))  {
        return Fr.e(o);
    } else if ((typeof(o) == "string") && (/^0x[0-9a-fA-F]+$/.test(o) ))  {
        return Fr.e(o);
    } else if (Array.isArray(o)) {
        return o.map(unsringifyConstants.bind(null, Fr));
    } else if (typeof o == "object") {
        if (o===null) return null;
        const res: any = {};
        const keys = Object.keys(o);
        keys.forEach( (k) => {
            res[k] = unsringifyConstants(Fr, o[k]);
        });
        return res;
    } else {
        return o;
    }
}

export default async function buildPoseidon() {
    const bn128 = await getCurveFromName("bn128", true);

    const F = bn128.Fr;

    // Parameters are generated by a reference script https://extgit.iaik.tugraz.at/krypto/hadeshash/-/blob/master/code/generate_parameters_grain.sage
    // Used like so: sage generate_parameters_grain.sage 1 0 254 2 8 56 0x30644e72e131a029b85045b68181585d2833e84879b9709143e1f593f0000001
    const {C, M} = unsringifyConstants(F, poseidonConstants);

    // Using recommended parameters from whitepaper https://eprint.iacr.org/2019/458.pdf (table 2, table 8)
    // Generated by https://extgit.iaik.tugraz.at/krypto/hadeshash/-/blob/master/code/calc_round_numbers.py
    // And rounded up to nearest integer that divides by t
    const N_ROUNDS_F = 8;
    const N_ROUNDS_P = [56, 57, 56, 60, 60, 63, 64, 63, 60, 66, 60, 65, 70, 60, 64, 68];

    const pow5 = (a:any) => F.mul(a, F.square(F.square(a, a)));

    function poseidon(inputs: any[], initState=false, nOut=1) {
        assert(inputs.length > 0);
        assert(inputs.length <= N_ROUNDS_P.length);

        const t = inputs.length + 1;
        const nRoundsF = N_ROUNDS_F;
        const nRoundsP = N_ROUNDS_P[t - 2];

        if (initState) {
            initState = F.e(initState);
        } else {
            initState = F.zero;
        }
        nOut = nOut || 1;

        let state = [initState, ...inputs.map(a => F.e(a))];
        for (let r = 0; r < nRoundsF + nRoundsP; r++) {
            state = state.map((a, i) => F.add(a, C[t - 2][r * t + i]));

            if (r < nRoundsF / 2 || r >= nRoundsF / 2 + nRoundsP) {
                state = state.map(a => pow5(a));
            } else {
                state[0] = pow5(state[0]);
            }

            state = state.map((_, i) =>
                state.reduce((acc, a, j) => F.add(acc, F.mul(M[t - 2][i][j], a)), F.zero)
            );
        }
        if (nOut == 1) {
            return state[0]
        } else {
            return state.slice(0, nOut);
        }
    }

    poseidon.F = F;
    return poseidon;
}

// let poseidon = await buildPoseidon();
// const res1 = poseidon([1, 2]);
// console.log(poseidon.F.toString(res1, 16));

// let poseidon = await buildPoseidon();
// const res2 = poseidon([2, 2, 1, 2]);
// console.log(poseidon.F.toString(res2, 16));

// let poseidon = await buildPoseidon();
// const res3 = poseidon(["21353905736832881724403434788717165287411869115262791897948629296309025827272"]);
// console.log(res3);
// console.log(poseidon.F.toString(res3, 16));

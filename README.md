## Correlated Equilibrium Sampling on Smart Contracts

This repository implements the generation of zk-SNARKs proofs for Oblivious Transfer, which is the main technique to make non-cooperative games on smart contracts affordable. 

## Description

The project consists of the following components:

`exp_elliptic`: Given private and public key pairs, proves that public key corresponds to the private key. 

`hash_commitment`: Given an input array and its commitment, proves that the poseidon hash of the array equals the commitment. 

`permutation`: Given an array $`X`$ and $`\tilde{X}`$, proves that $`\tilde{X}`$ is the permutation of $`X`$.

`select_array`: Given the set of aligned arrays $`\{X_a\}_{a\in A_1}`$, proves that the array is chosen correctly $`X = X_{x_r}`$. 

`protocol`: Combines several proof components to produce a single proof.

## Working with circom
Generating a zk-SNARK proof consists of several steps. 

1. Compiling the circuit
2. Computing the witness
3. Generating a proof 
4. Verifying a proof

All instructions and commands can be found in [circom](https://docs.circom.io/getting-started/installation/) documentation.

## External resources

This is the list of external libraries used in the project:
* [circomlib](https://github.com/iden3/circomlib): Library of circom templates.

* [circom-ecdsa](https://github.com/agnxsh/circom-ecdsa): Implementation of ECDSA operations in circom.

* [maci](https://github.com/privacy-scaling-explorations/maci): Minimal anti-collusion infrastructure. 

### Notes
This is a Proof-of-Concept implementation of zk-SNARK proofs mentioned in the paper. It is not intended to be used in production. 

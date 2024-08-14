## Correlated Equilibrium Sampling on Smart Contracts

This repository implements the generation of zk-SNARKs proofs for Oblivious Transfer, which is the main technique to make non-cooperative games on smart contracts affordable. 

## Description

The project consists of the following components:

`encryption`: Given an array $`\tilde{X}`$ and its encryption $`e`$, public keys $`y`$ and random numbers $`\gamma`$, proves that encryption of $`\tilde{X}`$ equals $`e`$. 

`exp_elliptic`: Given private and public key pairs, proves that public key corresponds to the private key. 

`hash_commitment`: Given an input array and its commitment, proves that the poseidon hash of the array equals the commitment. 

`permutation`: Given an array $`X`$ and $`\tilde{X}`$, proves that $`\tilde{X}`$ is the permutation of $`X`$.

`select_array`: Given the set of aligned arrays $`\{X_a\}_{a\in A_1}`$, proves that the array is chosen correctly $`X = X_{x_r}`$. 

`protocol`: Combines several proof components to produce a single proof.

Reference to the paper: 
Our Second Protocol -> Strategy of Alice.
1. In Commit step, a SNARK proof $\pi_X$ showing that $X=X_{x_r}$, the array $X$ is chosen correctly is implemented in `select_array`.
2. In SendData step, a zk-SNARK proof $\pi$ for the following relationship (the witness consists of all relevant vectors $(X,\tilde{X}, \mathbf{y}, \gamma, \mathbf{e})$ and secret information $r$, $r_p$): 1) all commitments are computed correctly, 2) $\tilde{X}$ is a permutation of $X$, 3) $\mathbf{e}$ is the encryption of $\tilde{X}$ under public keys $\mathbf{y}$ and random numbers $\gamma$ is implemented in `protocol` that uses components `hash_commitment` for proving 1), `permutation` for 2), and `encryption` for 3).  

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

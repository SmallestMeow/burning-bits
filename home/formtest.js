// servers/home/formtest.js

/** @param {NS} ns */

export async function main(ns) {
  ns.tprint(ns.formulas.reputation.calculateFavorToRep(150));
}

/** @param {NS} ns */

import { servers } from "utilities.js";

export async function main(ns) {

    const target = ns.args[0];

    ns.tprint(`${target} - ${servers(ns, "find", target)}`);

}
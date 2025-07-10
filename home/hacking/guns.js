// servers/home/hacking/prep.js

import { availRam } from "../utilities.js";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("getServerMinSecurityLevel");
  ns.disableLog("getServerSecurityLevel");
  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("getServerMaxMoney");
  
  while (true) {
    ns.run("/hacking/grow.js", 200000, "joesguns");
    await ns.sleep(10);
    }
}

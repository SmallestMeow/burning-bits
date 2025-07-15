// servers/home/hacking/prep.js

import { availRam } from "../utilities.js";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("getServerMinSecurityLevel");
  ns.disableLog("getServerSecurityLevel");
  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("getServerMaxMoney");
  
  while (true) {
    
    //ns.tprint(Math.floor(availRam(ns,"home") /2));
    while (availRam(ns, "home") > 200) {
      ns.run("/hacking/grow.js", Math.floor(availRam(ns, "home") * 0.9 / 1.75), "joesguns");
    }
    
    await ns.sleep(10);
    }
}

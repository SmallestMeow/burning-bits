// servers/home/hacking/prep.js

import { availRam } from "../utilities.js";

import { servers } from "../utilities.js";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("getServerMinSecurityLevel");
  ns.disableLog("getServerSecurityLevel");
  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("getServerMaxMoney");

  let threads = 1;
  const myServers = servers(ns, "list").filter(s => ns.getServer(s).hasAdminRights);
  
  while (true) {
    
    for (let server of myServers) {
      if (server == "home") continue;
      if (!ns.fileExists("/hacking/grow.js", server)) ns.scp("/hacking/grow.js", server, "home");
      threads = Math.floor(availRam(ns, server) / 1.75);
      if (threads == 0) threads = 1;
      while (availRam(ns, server) > 2) {
        ns.exec("/hacking/grow.js", server, {threads: threads, temporary: true}, "joesguns");
      }

    }
    //ns.tprint(Math.floor(availRam(ns,"home") /2));
    while (availRam(ns, "home") > 200) {
      ns.run("/hacking/grow.js", Math.floor(availRam(ns, "home") * 0.9 / 1.75), "joesguns");
    }
    
    await ns.sleep(100);
    }
}

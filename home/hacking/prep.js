// servers/home/hacking/prep.js

import { availRam } from "../utilities.js";

/** @param {NS} ns */
export async function main(ns) {
  ns.disableLog("getServerMinSecurityLevel");
  ns.disableLog("getServerSecurityLevel");
  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("getServerMaxMoney");
  const scriptRam = 1.75;
  let gOffset = 0;
  let ram = () => availRam(ns, ns.getServer().hostname) * 0.85;
  let gThreadz = Math.ceil(ram() / scriptRam * 0.9);
  let wThreadz = Math.ceil(gThreadz / 12.5 < 1 ? 1 : gThreadz / 12.5);
  let totalRAM = gThreadz + wThreadz * scriptRam;
  let maxedRAM = true;
  let secLevel = (mark) => ns.getServerSecurityLevel(mark);
  let minSec = (mark) => ns.getServerMinSecurityLevel(mark);
  let money = (mark) => ns.getServerMoneyAvailable(mark);
  let maxMoney = (mark) => ns.getServerMaxMoney(mark);
  let target = ns.args[0];
  while (true) {
    gOffset = ns.getWeakenTime(target) - ns.getGrowTime(target) - 10;
    maxedRAM = gThreadz + wThreadz * scriptRam > ram();
    if (maxedRAM) {
      ns.tprint(`Too much RAM! ${totalRAM} out of ${ram()}`);
      break;
    }
    ns.print(`${ns.getServerMoneyAvailable(target)} out of ${ns.getServerMaxMoney(target)}
    at ${ns.getServerSecurityLevel(target)} of ${ns.getServerMinSecurityLevel(target)}`);
    if (secLevel(target) == minSec(target)) {
      if (money(target) == maxMoney(target)) break;
    }
    if (secLevel(target) > minSec(target)){
      ns.print("pre-weaken / desync");
      ns.run("/hacking/weaken.js", Math.floor(ram() / scriptRam), target);
      await ns.sleep(ns.getWeakenTime(target) + 5);
    }
    else if (money(target) < maxMoney(target)) {
      ns.run("/hacking/grow.js", gThreadz, target, gOffset);
      ns.run("/hacking/weaken.js", wThreadz, target);
      await ns.sleep(ns.getWeakenTime(target) + 5);
    }
  }
  ns.print("DONE!");
  ns.print(`${money(target)} and ${maxMoney(target)}`);
  ns.print(`${secLevel(target)} and ${minSec(target)}`);
}

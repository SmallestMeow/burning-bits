// servers/home/hacking/prep.js
async function main(ns) {
  ns.disableLog("getServerMinSecurityLevel");
  ns.disableLog("getServerSecurityLevel");
  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("getServerMaxMoney");
  const gRam = 1.75;
  const wRam = 1.75;
  let gOffset = 0;
  let availRam = ns.getServer().maxRam - ns.getServer().ramUsed;
  let gThreadz = Math.ceil(availRam / gRam * 0.8);
  let wThreadz = Math.ceil(availRam / wRam * 0.12);
  let totalRAM = gThreadz * gRam + wThreadz * wRam;
  let maxedRAM = true;
  let secLevel = (mark) => ns.getServerSecurityLevel(mark);
  let minSec = (mark) => ns.getServerMinSecurityLevel(mark);
  let money = (mark) => ns.getServerMoneyAvailable(mark);
  let maxMoney = (mark) => ns.getServerMaxMoney(mark);
  let target = ns.args[0];
  while (true) {
    gOffset = ns.getWeakenTime(target) - ns.getGrowTime(target) - 20;
    maxedRAM = gThreadz * gRam + wThreadz * wRam > ns.getServer().maxRam;
    if (maxedRAM) {
      ns.tprint(`Too much RAM! ${totalRAM} out of ${ns.getServer().maxRam}`);
      break;
    }
    ns.print(`${ns.getServerMoneyAvailable(target)} out of ${ns.getServerMaxMoney(target)}
    at ${ns.getServerSecurityLevel(target)} of ${ns.getServerMinSecurityLevel(target)}`);
    if (secLevel(target) == minSec(target)) {
      if (money(target) == maxMoney(target)) break;
    }
    if (money(target) < maxMoney(target)) ns.run("/hacking/grow.js", gThreadz, target, gOffset);
    ns.run("/hacking/weaken.js", wThreadz, target);
    await ns.sleep(ns.getWeakenTime(target) + 20);
  }
  ns.tprint("DONE!");
  ns.tprint(`${money(target)} and ${maxMoney(target)}`);
  ns.tprint(`${secLevel(target)} and ${minSec(target)}`);
}
export {
  main
};

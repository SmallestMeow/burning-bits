// servers/home/temp.js
async function main(ns) {
  let target = ns.args[0];
  const hRam = 1.7;
  const gRam = 1.75;
  const wRam = 1.75;
  let hOffset = 0;
  let gOffset = 0;
  let availRam = ns.getServer().maxRam - ns.getServer().ramUsed;
  let ratio = 2;
  let cores = ns.getServer().cpuCores;
  let hRatio = ns.getServerMaxMoney(target) / ratio;
  let gRatio = 2;
  let hThreadz = Math.floor(ns.hackAnalyzeThreads(target, hRatio));
  let gThreadz = Math.floor(ns.growthAnalyze(target, gRatio, cores));
  let w1Threadz = Math.floor(hThreadz / 25 + gThreadz / 12.5);
  let totalRAM = hThreadz * hRam + gThreadz * gRam + w1Threadz * wRam;
  let maxedRAM = hThreadz * hRam + gThreadz * gRam + w1Threadz * wRam > availRam;
  while (maxedRAM) {
    ratio += 1;
    hRatio = ns.getServerMaxMoney(target) / ratio;
    gRatio = 1 + 1.5 / ratio;
    hThreadz = Math.floor(ns.hackAnalyzeThreads(target, hRatio)) - 1;
    gThreadz = Math.floor(ns.growthAnalyze(target, gRatio, cores)) + 1;
    w1Threadz = Math.floor(hThreadz / 24 + gThreadz / 12) + 1;
    if (w1Threadz <= 1) w1Threadz = 1;
    if (gThreadz <= 1) gThreadz = 1;
    if (hThreadz <= 1) hThreadz = 1;
    maxedRAM = hThreadz * hRam + gThreadz * gRam + w1Threadz * wRam > availRam;
    ns.print(`${hRatio} ${gRatio} ${hThreadz} ${gThreadz} ${maxedRAM}`);
    await ns.sleep(0);
  }
  while (true) {
    hOffset = ns.getWeakenTime(target) - ns.getHackTime(target) - 20;
    gOffset = ns.getWeakenTime(target) - ns.getGrowTime(target) - 20;
    ns.print(`${ns.getServerMoneyAvailable(target)} out of ${ns.getServerMaxMoney(target)}
      at ${ns.getServerSecurityLevel(target)} of ${ns.getServerMinSecurityLevel(target)}`);
    if (maxedRAM) {
      ns.tprint(`Too much RAM! ${totalRAM} out of ${availRam}`);
      break;
    } else {
      ns.run("hack.js", hThreadz, target, hOffset);
      ns.run("grow.js", gThreadz, target, gOffset);
      ns.run("weaken.js", w1Threadz, target);
      await ns.sleep(ns.getWeakenTime(target) + 75);
    }
  }
}
export {
  main
};

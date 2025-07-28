async function main(ns) {

  let target = ns.args[0];
  // const maxMoney = ns.getServerMaxMoney(target);

  const hRam = 1.7;
  const gRam = 1.75;
  const wRam = 1.75;
  let availRam = () => ns.getServer().maxRam - ns.getServer().ramUsed;

  let cores = ns.getServer().cpuCores;

  let hThreadz = 1;
  let hAmount = () => ns.hackAnalyze(target) * hThreadz;
  ns.print(hAmount());
  let gAmount = () => 1 / (1 - hAmount());
  ns.print(gAmount());
  let gThreadz = () => Math.ceil(ns.growthAnalyze(target, gAmount(), cores))
  // ns.print("gThreadz")
  let w1Threadz = () => Math.ceil(hThreadz / 25 < 1 ? 1 : hThreadz / 25);
  let w2Threadz = () => Math.ceil(gThreadz() / 12.5 < 1 ? 1 : gThreadz() / 12.5) + cores;

  let totalRAM = () => (hThreadz * hRam) + (gThreadz() * gRam) + (w1Threadz() * wRam) + (w2Threadz() * wRam);
  let maxxRAM = () => totalRAM() < availRam() - 10;

  // ns.print(`${hThreadz} ${gThreadz()} ${w1Threadz} ${w2Threadz} ${totalRAM()} ${maxxRAM()}`);



  // ns.print(`${hThreadz} ${gThreadz()} ${w1Threadz} ${w2Threadz} ${totalRAM()} ${maxxRAM()}`);

  while (true) {
    while (availRam() - 10 > totalRAM()) {
      while (maxxRAM()) {
        if (hAmount() > 0.1) break;
        if (hAmount() > 1) {
          hThreadz -= 1; break;
        }
        hThreadz += 1;
        //ns.print(gAmount());
      } ;

      if (hThreadz > 1) hThreadz -= 1;

      let hOffset = ns.getWeakenTime(target) - ns.getHackTime(target) - 5;
      let gOffset = ns.getWeakenTime(target) - ns.getGrowTime(target) + 5;
      ns.print(`${ns.getServerMoneyAvailable(target)} out of ${ns.getServerMaxMoney(target)}
      at ${ns.getServerSecurityLevel(target)} of ${ns.getServerMinSecurityLevel(target)}`);
      ns.run("/hacking/hack.js", hThreadz, target, hOffset);
      ns.run("/hacking/weaken.js", w1Threadz(), target);
      ns.run("/hacking/grow.js", gThreadz(), target, gOffset);
      ns.run("/hacking/weaken.js", w2Threadz(), target, 10);
      await ns.sleep(5);
    }
    ns.print(`${availRam()} ${totalRAM()} ${hThreadz}`)
    await ns.sleep(ns.getWeakenTime(target) + 15);
  }
}
export {
  main
};

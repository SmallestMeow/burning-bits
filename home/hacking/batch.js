/** @param {NS} ns */
import { updateProgress } from "../utilities.js"

export async function main(ns) {

  ns.disableLog("sleep");
  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("getServerMaxMoney");
  ns.disableLog("getServerSecurityLevel");
  ns.disableLog("getServerMinSecurityLevel");

  if(ns.getServer().hostname == "pserv0" || ns.args[1] == "tail") {
    ns.ui.openTail();
    ns.ui.resizeTail(583,135);
  }

  let target = ns.args[0];
  // const maxMoney = ns.getServerMaxMoney(target);

  const hRam = 1.7;
  const gRam = 1.75;
  const wRam = 1.75;

  let gPad = 0;
  let wPad = 0;

  let availRam = () => ns.getServer().maxRam - ns.getServer().ramUsed;

  let cores = ns.getServer().cpuCores;

  let hThreadz = 1;
  let hAmount = () => ns.hackAnalyze(target) * hThreadz;
  ns.print(hAmount());
  let gAmount = () => 1 / (1 - hAmount()) + gPad;
  ns.print(gAmount());
  let gThreadz = () => Math.ceil(ns.growthAnalyze(target, gAmount(), cores))
  // ns.print("gThreadz")
  let w1Threadz = () => Math.ceil(hThreadz / 25 < 1 ? 1 : hThreadz / 25 + wPad);
  let w2Threadz = () => Math.ceil(gThreadz() / 12.5 < 1 ? 1 : gThreadz() / 12.5 + wPad) + cores;

  let totalRAM = () => (hThreadz * hRam) + (gThreadz() * gRam) + (w1Threadz() * wRam) + (w2Threadz() * wRam);
  let maxxRAM = () => totalRAM() < availRam() - 10;

  // ns.print(`${hThreadz} ${gThreadz()} ${w1Threadz} ${w2Threadz} ${totalRAM()} ${maxxRAM()}`);



  // ns.print(`${hThreadz} ${gThreadz()} ${w1Threadz} ${w2Threadz} ${totalRAM()} ${maxxRAM()}`);
  

  while (true) {

    hThreadz = 1;
    let i = 0;

    if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) wPad += 0.5;
    else if (wPad > 0) wPad -= 0.1;
    if (ns.getServerMaxMoney(target) > ns.getServerMoneyAvailable(target)) gPad += .01;
    else if (gPad > 0) gPad -= 0.001;



    while (availRam() - 5 > totalRAM() && i < 500) {
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
      
      ns.run("/hacking/hack.js", hThreadz, target, hOffset);
      ns.run("/hacking/weaken.js", w1Threadz(), target);
      ns.run("/hacking/grow.js",  gThreadz(), target, gOffset);
      ns.run("/hacking/weaken.js", w2Threadz(), target, 10);
      await ns.sleep(0);
      i++
    }
    
    // ns.print(`${availRam()} ${totalRAM()} ${hThreadz}`)
    let maxTime = ns.getWeakenTime(target)
    for (let timeLeft = maxTime; timeLeft > 0; timeLeft -= 300) {
      ns.clearLog();
      ns.print("$"+Math.floor(ns.getServerMoneyAvailable(target)) + " out of $"+ns.getServerMaxMoney(target)
        +" at SecLevel: " + ns.getServerSecurityLevel(target).toFixed(2) +" of SecMin: " + ns.getServerMinSecurityLevel(target));
      ns.print(`RAM Available: ${availRam().toFixed(2)} Script RAM: ${totalRAM().toFixed(2)} Hack threads: ${hThreadz}`);
      ns.print(`Spun up ${i} ${i == 1? "batch" : "batches"}`);
      ns.print(updateProgress(ns, maxTime, timeLeft));
      ns.ui.renderTail();
      await ns.sleep(300);
    }
    if (i == 0) break;
    
    await ns.sleep(15);
  }
}

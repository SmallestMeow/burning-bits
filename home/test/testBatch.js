/** @param {NS} ns */
import { updateProgress } from "../utilities.js"
import { availRam } from "../utilities.js"
import { servers } from "../utilities.js"

export async function main(ns) {

  ns.disableLog("sleep");
  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("getServerMaxMoney");
  ns.disableLog("getServerSecurityLevel");
  ns.disableLog("getServerMinSecurityLevel");

  ns.ui.openTail();
  ns.ui.resizeTail(583,135);

  let target = ns.args[0];
  let myServers = servers(ns, "list").filter(s => ns.getServer(s).hasAdminRights);
  ns.print(myServers);
  // const maxMoney = ns.getServerMaxMoney(target);

  const hRam = 1.7;
  const gwRam = 1.75;

  let gPad = 0;
  let wPad = 0;

  

  for (let server of myServers) {
      if (server != "home"){
        if (ns.fileExists("utilities.js", server)) ns.rm("utilities.js", server); 
        if (ns.fileExists("/hacking/batch.js", server)) ns.rm("/hacking/batch.js", server);
        if (ns.fileExists("/hacking/hack.js", server)) ns.rm("/hacking/hack.js", server);
        if (ns.fileExists("/hacking/grow.js", server)) ns.rm("/hacking/grow.js", server);
        if (ns.fileExists("/hacking/weaken.js", server)) ns.rm("/hacking/weaken.js", server);
          
        ns.scp("/hacking/hack.js", server, "home");
        ns.scp("/hacking/grow.js", server, "home");
        ns.scp("/hacking/weaken.js", server, "home");
      }
  }
      

  while (true) {

    if (ns.getServerSecurityLevel(target) > ns.getServerMinSecurityLevel(target)) wPad += 0.5;
    else if (wPad > 0) wPad -= 0.1;
    if (ns.getServerMaxMoney(target) > ns.getServerMoneyAvailable(target)) gPad += .01;
    else if (gPad > 0) gPad -= 0.001;

    let wait = 0;
    let maxAvail = 0;
    let maxScript = 0;
    let maxHack = 0;
    let spin = 0;

    for(let server of myServers) {

      if (ns.args[1] == 0 && server == "home") continue;
      
      let i = 0;
      let hThreadz = 1;
      let hAmount = () => ns.hackAnalyze(target) * hThreadz;
      let gAmount = () => 1 / (1 - hAmount()) + gPad;
      let gThreadz = () => Math.ceil(ns.growthAnalyze(target, gAmount(), ns.getServer(server).cpuCores))
      let w1Threadz = () => Math.ceil(hThreadz / 25 < 1 ? 1 : hThreadz / 25 + wPad);
      let w2Threadz = () => Math.ceil(gThreadz() / 12.5 < 1 ? 1 : gThreadz() / 12.5 + wPad);

      let totalRAM = () => (hThreadz * hRam) + (gThreadz() + w1Threadz() + w2Threadz()) * gwRam;

      while (availRam(ns,server) > totalRAM() && i < 500) {
        while (totalRAM() * 2 < availRam(ns, server) - totalRAM()) {
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
        
        ns.exec("/hacking/hack.js", server, {threads: hThreadz, temporary: true}, target, hOffset);
        ns.exec("/hacking/weaken.js", server, {threads: w1Threadz(), temporary: true}, target);
        ns.exec("/hacking/grow.js", server, {threads: gThreadz(), temporary:true}, target, gOffset);
        ns.exec("/hacking/weaken.js", server, {threads: w2Threadz(), temporary: true}, target, 10);
        await ns.sleep(0);
        i++
      }
      if (wait < ns.getWeakenTime(target)) wait = ns.getWeakenTime(target); 
      if (maxAvail < availRam(ns, server)) maxAvail = availRam(ns, server);
      if (maxScript < totalRAM()) maxScript = totalRAM();
      if (maxHack < hThreadz) maxHack = hThreadz; 
      spin += i;
    }
    
    // ns.print(`${availRam()} ${totalRAM()} ${hThreadz}`)
    let maxTime = wait;
    for (let timeLeft = maxTime; timeLeft > 0; timeLeft -= 300) {
      ns.clearLog();
      ns.print("$"+Math.floor(ns.getServerMoneyAvailable(target)) + " out of $"+ns.getServerMaxMoney(target)
        +" at SecLevel: " + ns.getServerSecurityLevel(target).toFixed(2) +" of SecMin: " + ns.getServerMinSecurityLevel(target));
      ns.print(`RAM Available: ${maxAvail.toFixed(2)} Script RAM: ${maxScript.toFixed(2)} Hack threads: ${maxHack}`);
      ns.print(`Spun up ${spin} ${spin == 1? "batch" : "batches"}`);
      ns.print(updateProgress(ns, maxTime, timeLeft));
      ns.ui.renderTail();
      await ns.sleep(300);
    }
    
    
    await ns.sleep(15);
  }
}

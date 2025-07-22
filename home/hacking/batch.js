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

  const greed = 0.25;

  const target = ns.args[0];
  let myServers = servers(ns, "list").filter(s => ns.getServer(s).hasAdminRights);
  ns.print(myServers);
  // const maxMoney = ns.getServerMaxMoney(target);

  const hRam = 1.7;
  const gwRam = 1.75;

  // let gPad = 0;
  // let wPad = 0;

  let cycle = 1;





  for (let server of myServers) {
    if (server != "home") {
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

    const prepped = ns.getServerSecurityLevel(target) == ns.getServerMinSecurityLevel(target) &&
      ns.getServerMaxMoney(target) == ns.getServerMoneyAvailable(target);

    let toGrow = false;
    let hOffset = ns.getWeakenTime(target) - ns.getHackTime(target) - 5;
    let gOffset = ns.getWeakenTime(target) - ns.getGrowTime(target) + 5;

    let wait = 0;
    let maxAvail = [0, "home"];
    let maxScript = [0, "home"];
    let maxHack = [0, "home"];
    let i = 0; // How many batches running on this server.
    let j = 0;
    let spin = 0;

    let isHacking = false;

    for (let server of myServers) {

      if (ns.args[1] == 0 && server == "home") continue; // In case we don't want to run this on home.
      
      let totalRAM = () => (hThreadz * hRam) + (gThreadz() + w1Threadz() + w2Threadz()) * gwRam;
      let hThreadz = 1;
      let hAmount = () => ns.hackAnalyze(target) * hThreadz;
      let gAmount = () => 1 / (1 - hAmount());
      let gThreadz = () => Math.ceil(ns.growthAnalyze(target, gAmount(), ns.getServer(server).cpuCores))
      let w1Threadz = () => Math.ceil(hThreadz / 25 < 1 ? 1 : hThreadz / 25);
      let w2Threadz = () => Math.ceil(gThreadz() / 12.5 < 1 ? 1 : gThreadz() / 12.5);


      // If the server isn't prepped, prep it.
      if (!prepped && (j < myServers.length / 2 || cycle < 3) && ns.args[1] != "noprep") {
        let g = Math.ceil((availRam(ns, server) / gwRam) * 0.9);
        if (g == 0) g = 1;
        let w = 1;
        if (ns.getServerMaxMoney(target) > ns.getServerMoneyAvailable(target)) {
          ns.exec("/hacking/grow.js", server, g, target, gOffset);
          toGrow = true;
        }
        if (toGrow) w = Math.ceil(g / 12.5);
        else w = Math.floor(availRam(ns, server) / gwRam);
        if (w == 0) w = 1;
        ns.exec("/hacking/weaken.js", server, w, target);
        j++
      }
      else {
        while (availRam(ns, server) > totalRAM()) { // && i < 2000) {
          while (totalRAM() * 2 < availRam(ns, server) - totalRAM()) {
            if (hAmount() > 0.1) break;
            if (hAmount() > 1) {
              hThreadz -= 1; break;
            }
            hThreadz += 1;
          }

          if (hThreadz > 1) hThreadz -= 1;

          ns.exec("/hacking/hack.js", server, { threads: hThreadz, temporary: true }, target, hOffset);
          ns.exec("/hacking/weaken.js", server, { threads: w1Threadz(), temporary: true }, target);
          ns.exec("/hacking/grow.js", server, { threads: gThreadz(), temporary: true }, target, gOffset);
          ns.exec("/hacking/weaken.js", server, { threads: w2Threadz(), temporary: true }, target, 10);

          i++


        }
        isHacking = true;
      }

      if (wait < ns.getWeakenTime(target)) wait = ns.getWeakenTime(target);
      if (maxAvail[0] < availRam(ns, server)) maxAvail = [availRam(ns, server), server];
      if (maxScript[0] < totalRAM()) maxScript = [totalRAM(), server];
      if (maxHack[0] < hThreadz) maxHack = [hThreadz, server];
      spin += i + j;
      if (spin >= 95000) break;
      await ns.sleep(0);

    }

    ns.ui.openTail();
    if (!isHacking) ns.ui.resizeTail(390, 160);
    else if (j > 0) ns.ui.resizeTail(390, 252);
    else ns.ui.resizeTail(390, 230);

    // ns.print(`${availRam()} ${totalRAM()} ${hThreadz}`)
    let maxTime = wait;
    for (let timeLeft = maxTime; timeLeft > 0; timeLeft -= 300) {
      ns.clearLog();
      ns.print(`\$${Math.floor(ns.getServerMoneyAvailable(target))} out of \$${+ns.getServerMaxMoney(target)}`)
      ns.print(`at SecLevel: ${ns.getServerSecurityLevel(target).toFixed(2)} of SecMin: ${ns.getServerMinSecurityLevel(target)}`);
      if (isHacking) {
        ns.print(`Hightst RAM Avail: ${maxAvail[0].toFixed(2)} on ${maxAvail[1]}`)
        ns.print(`Hightest Script RAM: ${maxScript[0].toFixed(2)} on ${maxScript[1]}`)
        ns.print(`Highest Hack Threads: ${maxHack[0]} on ${maxHack[1]}`);
        ns.print(`Spun up ${spin} ${spin == 1 ? "batch" : "batches"} on cycle ${cycle}`);
      }
      if (j > 0) ns.print(`Prepping on ${j} out of ${myServers.length} servers`);
      ns.print(`${Math.round(timeLeft / 1000)} seconds remaining...`)
      ns.print(updateProgress(ns, maxTime, timeLeft));
      ns.ui.renderTail();
      await ns.sleep(300);
    }


    await ns.sleep(15);
    cycle += 1;
    i = 0;
    j = 0;
  }
}

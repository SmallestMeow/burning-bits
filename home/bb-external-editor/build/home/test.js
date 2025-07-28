// servers/home/test.js
async function main(ns) {
  const orbitPort = ns.run("orbit.js", 1, 0);
  await ns.nextPortWrite(orbitPort);
  let servers = ns.readPort(orbitPort);
  const doNotHack = ["home", "CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"];
  ns.disableLog("sleep");
  let cores = (server) => ns.getServer(server).cpuCores;
  let ram = (server) => ns.getServer(server).maxRam;
  let target = findHacker(servers);
  for (let i = 0; i < target.length; i++) {
    if (ns.fileExists("temp.js", target[i])) ns.rm("temp.js", target[i]);
    if (ns.fileExists("hack.js", target[i])) ns.rm("hack.js", target[i]);
    if (ns.fileExists("grow.js", target[i])) ns.rm("grow.js", target[i]);
    if (ns.fileExists("weaken.js", target[i])) ns.rm("weaken.js", target[i]);
    if (ns.fileExists("prep.js", target[i])) ns.rm("prep.js", target[i]);
    ns.scp("temp.js", target[i], "home");
    ns.scp("hack.js", target[i], "home");
    ns.scp("grow.js", target[i], "home");
    ns.scp("weaken.js", target[i], "home");
    ns.scp("prep.js", target[i], "home");
    ns.killall(target[i]);
  }
  for (let i = 0; i < target.length; i++) {
    ns.exec("temp.js", target[i], 1, "blade");
    await ns.sleep(0);
  }
  function findHacker(targets) {
    let hackers = ["n00dles"];
    for (let i = 0; i < targets.length; i++) {
      let j = 0;
      if (!doNotHack.includes(targets[i])) {
        if (cores(targets[i]) > cores(hackers[j]) && ram(targets[i]) > ram(hackers[j])) {
          hackers.push(targets[i]);
          j += 1;
        }
      }
    }
    hackers.shift();
    return hackers;
  }
}
export {
  main
};

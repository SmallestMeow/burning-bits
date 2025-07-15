// servers/home/share.js
export async function main(ns) {
  const port = ns.run("orbit.js", 1, 0);
  await ns.nextPortWrite(port);
  const servers = ns.readPort(port);
  const doNotHack = ["home", "CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"];
  let ram = 0;
  let threads = 0;
  let usedRam = (mark) => ns.getServerMaxRam(mark) - ns.getServerUsedRam(mark);
  for (let i = 0; i < servers.length; i++) {
    if (ns.hasRootAccess(servers[i]) && !doNotHack.includes(servers[i])) {
      if (!ns.fileExists("factionRAM.js", servers[i])) {
        ns.scp("factionRAM.js", servers[i], "home");
      }
      ram = usedRam(servers[i]);
      threads = Math.floor((ram - 2.7) / 4);
      if (threads > 0) { // && !ns.fileExists("/hacking/batch.js", servers[i])) {
        ns.exec("factionRAM.js", servers[i], threads);
      }
    }
  }
  ram = usedRam("home");
  threads = Math.floor((ram - 2.7) / 4);
  //if (threads > 0 && !ns.fileExists("/hacking/batch.js", "home")) {
  ns.run("factionRAM.js", threads);
  //}
}

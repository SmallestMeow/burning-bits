// servers/home/hacking/helpPrep.js

/** @param {NS} ns */

export async function main(ns) {
  const target = ns.args[0];
  const orbitPort = ns.run("orbit.js", 1, 0);
  await ns.nextPortWrite(orbitPort);
  let servers = ns.readPort(orbitPort);
  const doNotHack = ["home", "CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"];
  let usedRam = (mark) => ns.getServerMaxRam(mark) - ns.getServerUsedRam(mark);
  for (let i = 0; i < servers.length; i++) {
    if (ns.hasRootAccess(servers[i]) && !doNotHack.includes(servers[i])) {
      // ns.killall(servers[i]);
      if (ns.fileExists("/hacking/prep.js", servers[i])) {
        ns.rm("/hacking/prep.js", servers[i]);
      }
      if (ns.fileExists("/hacking/grow.js", servers[i])) {
        ns.rm("/hacking/grow.js", servers[i]);
      }
      if (ns.fileExists("/hacking/weaken.js", servers[i])) {
        ns.rm("/hacking/weaken.js", servers[i]);
      }
      if (ns.fileExists("utilities.js", servers[i])) {
        ns.rm("utilities.js", servers[i]);
      }
      ns.scp("utilities.js", servers[i], "home");
      ns.scp("/hacking/prep.js", servers[i], "home");
      ns.scp("/hacking/grow.js", servers[i], "home");
      ns.scp("/hacking/weaken.js", servers[i], "home");
      let ram = usedRam(servers[i]);
      if (ram >= 16) {
        ns.exec("/hacking/prep.js", servers[i], 1, target);
      }
    }
  }
}

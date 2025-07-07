// servers/home/hacking/helpHack.js
async function main(ns) {
  const target = ns.args[0];
  const orbitPort = ns.exec("orbit.js", "home", 1, 0);
  await ns.nextPortWrite(orbitPort);
  let servers = ns.readPort(orbitPort);
  const doNotHack = ["home", "CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z", target];
  let usedRam = (mark) => ns.getServerMaxRam(mark) - ns.getServerUsedRam(mark);
  for (let i = 0; i < servers.length; i++) {
    if (ns.hasRootAccess(servers[i]) && !doNotHack.includes(servers[i])) {
      ns.killall(servers[i]);
      if (ns.fileExists("/hacking/temp.js", servers[i])) {
        ns.rm("/hacking/temp.js", servers[i]);
      }
      if (ns.fileExists("/hacking/batch.js", servers[i])) {
        ns.rm("/hacking/batch.js", servers[i]);
      }
      if (ns.fileExists("/hacking/hack.js", servers[i])) {
        ns.rm("/hacking/hack.js", servers[i]);
      }
      if (ns.fileExists("/hacking/grow.js", servers[i])) {
        ns.rm("/hacking/grow.js", servers[i]);
      }
      if (ns.fileExists("/hacking/weaken.js", servers[i])) {
        ns.rm("/hacking/weaken.js", servers[i]);
      }
      
      let ram = usedRam(servers[i]);
      if (ram >= 32) {
        ns.scp("/hacking/batch.js", servers[i], "home");
        ns.scp("/hacking/hack.js", servers[i], "home");
        ns.scp("/hacking/grow.js", servers[i], "home");
        ns.scp("/hacking/weaken.js", servers[i], "home");
        ns.exec("/hacking/batch.js", servers[i], 1, target);
      }
    }
  }
}
export {
  main
};

// servers/home/target.js
async function main(ns) {
  const doNotHack = ["home", "CSEC", "avmnite-02h", "I.I.I.I", "run4theh111z"];
  let shouldHack = (mark) => ns.getServerMaxMoney(mark) / ns.getServerMinSecurityLevel(mark);
  const orbitPort = ns.run("orbit.js", 1, 0);
  await ns.nextPortWrite(orbitPort);
  let servers = ns.readPort(orbitPort);
  let target = servers[1];
  let target2 = servers[2];
  let target3 = servers[3];
  let target4 = servers[4];
  let target5 = servers[5];
  let targetz = findHack(servers);
  let port = ns.getPortHandle(ns.pid);
  port.clear();
  port.write(findHack(servers));
  if (ns.args[0] != 0) {
    for (let i = 0; i < targetz.length; i++) ns.tprint(targetz[i]);
  }
  function findHack(targets) {
    for (let i = 0; i < targets.length; i++) {
      if (!doNotHack.includes(targets[i]) && ns.getServerRequiredHackingLevel(targets[i]) < ns.getHackingLevel() / 2) {
        if (shouldHack(targets[i]) > shouldHack(target)) {
          target5 = target4;
          target4 = target3;
          target3 = target2;
          target2 = target;
          target = targets[i];
        }
      }
    }
    return [target, target2, target3, target4, target5];
  }
}
export {
  main
};

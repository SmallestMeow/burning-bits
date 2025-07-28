// servers/home/not_maintained/runtemp.js
async function main(ns) {
  let orbit = ["home"];
  const doNotHack = ["home", "CSEC", "avmnite-02h", "omega-net"];
  let threadz = (server) => parseInt((ns.getServerMaxRam(server) - ns.getServerUsedRam(server)) / 2.4);
  for (let i = 0; i < orbit.length; i++) {
    for (const server of ns.scan(orbit[i])) {
      if (!doNotHack.includes(server) && !orbit.includes(server)) {
        if (ns.hasRootAccess(server)) orbit.push(server);
      }
    }
    if (!doNotHack.includes(orbit[i]) && threadz(orbit[i]) != 0) {
      if (!ns.fileExists("temp.js", orbit[i])) ns.scp("temp.js", orbit[i], "home");
      else {
        ns.rm("temp.js", orbit[i]);
        ns.scp("temp.js", orbit[i], "home");
      }
      ns.exec("temp.js", orbit[i], { threads: threadz(orbit[i]), temporary: true });
      await ns.sleep(37);
    }
  }
}
export {
  main
};

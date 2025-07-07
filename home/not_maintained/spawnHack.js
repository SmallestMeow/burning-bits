// servers/home/not_maintained/spawnHack.js
async function main(ns) {
  var doNotHack = ["home", "CSEC", "avmnite-02h", ns.self().server];
  var orbit = ns.args[0].split(",");
  var target = orbit[1];
  while (true) {
    await ns.hack(findTarget(orbit));
  }
  function findTarget(targets) {
    for (let i = 0; i < targets.length; i++) {
      if (!doNotHack.includes(targets[i])) {
        if (getRatio(targets[i]) > getRatio(target)) {
          target = targets[i];
        }
      }
    }
    return target;
  }
  function getRatio(mark) {
    return ns.hackAnalyzeChance(mark) * ns.getServerMoneyAvailable(mark) / ns.getHackTime(mark);
  }
}
export {
  main
};

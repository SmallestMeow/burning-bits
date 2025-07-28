// servers/home/not_maintained/masterHack.js
async function main(ns) {
  var doNotHack = ["home", "CSEC", "avmnite-02h"];
  var orbit = ns.args[0].split(",");
  var target = orbit[1];
  var loop = 0;
  ns.disableLog("getServerMoneyAvailable");
  ns.disableLog("getServerMaxMoney");
  while (true) {
    let hacked = await ns.hack(findTarget(orbit));
    ns.tprint(`hacked ${target} for ${hacked} with a ratio of ${getRatio(target)}`);
    if (getMoney(target) < 0.25) {
      loop = 0;
      while (getMoney(target) < 0.35 && getGrow(target) && loop < 3) {
        await ns.grow(target);
        ns.tprint(`growing ${target}`);
        loop++;
      }
    }
    if (getSec(target) > 0.6 && getWeaken(target) && loop < 3) {
      loop = 0;
      while (getSec(target) < 0.4 && loop < 3) {
        await ns.weaken(target);
        ns.tprint(`weakening ${target}`);
        loop++;
      }
    }
  }
  function findTarget(targets) {
    for (let i = 0; i < targets.length; i++) {
      if (!doNotHack.includes(targets[i])) {
        if (getRatio(targets[i]) > getRatio(target)) {
          ns.tprint(`changing target from ${target} to ${targets[i]}`);
          target = targets[i];
        }
      }
    }
    return target;
  }
  function getRatio(mark) {
    return ns.hackAnalyzeChance(mark) * ns.getServerMoneyAvailable(mark) / ns.getHackTime(mark);
  }
  function getMoney(mark) {
    return ns.getServerMoneyAvailable(mark) / ns.getServerMaxMoney(mark);
  }
  function getSec(mark) {
    return ns.getServerBaseSecurityLevel(mark) / ns.getServerSecurityLevel(mark);
  }
  function getGrow(mark) {
    return ns.getHackTime(mark) / ns.getGrowTime(mark) > 0.5;
  }
  function getWeaken(mark) {
    return ns.getHackTime(mark) / ns.getWeakenTime(mark) > 0.5;
  }
}
export {
  main
};

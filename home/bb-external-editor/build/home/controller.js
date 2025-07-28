// servers/home/controller.js
async function main(ns) {
  let targetPort = ns.run("target.js", 1, 0);
  await ns.nextPortWrite(targetPort);
  let target = ns.readPort(targetPort);
  let flag = true;
  while (flag) {
    for (let i = 0; i < target.length; i++) {
      ns.run("prep.js", 1, target[i]);
      await ns.sleep(20);
      while (ns.scriptRunning("prep.js", "home")) await ns.sleep(ns.getWeakenTime(target[i]));
      targetPort = ns.run("target.js", 1, 0);
      await ns.nextPortWrite(targetPort);
      let newTarget = ns.readPort(targetPort);
      ns.tprint(`${target} and ${newTarget}`);
      if (newTarget.toString() != target.toString()) break;
      ns.tprint(`here and ${target[i]}`);
      ns.run("temp.js", 1, target[i]);
      await ns.sleep(20);
    }
    flag = false;
  }
}
export {
  main
};

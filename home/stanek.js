import { availRam, servers, copyScripts } from "utilities.js";

/** @param {NS} ns */
export async function main(ns) {
  
  const grid = ns.stanek.activeFragments();
  const fragments = ns.stanek.activeFragments().filter(f => f.id < 100);
  const myServers = servers(ns, "list").filter(s => ns.getServer(s).hasAdminRights);
  const overwrite = ns.args[2] === "ow" ? "w" : "a";

  if (ns.args[0] === "write") {
    ns.write("stanek.json", JSON.stringify({type: ns.args[1], grid: grid}, null, 2), overwrite);
    return;
  }

  if (ns.args[0] === "load") {
    const grid = JSON.parse(ns.read("stanek.json")).find(s => s.type === ns.args[1]).grid;
    ns.stanek.clearGift();
    for (const i of grid) ns.stanek.placeFragment(i.x, i.y, i.rotation, i.id);
    // ns.tprint(load.find(s => s.type === ns.args[1]).type);
    return;
  }

  for (const server of myServers) {
    if (server != "home") ns.scp("charge.js", server, "home");
  }
  

  while (true) {
    for (const fragment of fragments) {
      for (const server of myServers) {
        const ram = availRam(ns, server);
        const threads = Math.max(Math.floor((ram / 2)), 1);
        ns.exec("charge.js", server, {threads: threads, temporary: true}, fragment.x, fragment.y);
        }
        await ns.sleep(210);
      }
  }

}
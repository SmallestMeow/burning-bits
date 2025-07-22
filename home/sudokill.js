/** @param {NS} ns */
import { servers } from "utilities.js"

export async function main(ns) {

  let myServers = servers(ns, "list").filter(s => ns.getServer(s).hasAdminRights);

  for (let server of myServers) ns.killall(server);

  if (ns.args[0] == "homo") ns.killall("home");
  
}
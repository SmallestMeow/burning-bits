/** @param {NS} ns */

import { servers } from "utilities.js";
import { attemptHack } from "utilities.js";

export async function main(ns) {

  const serverList = servers(ns, "list").filter(s => !ns.getServer(s).hasAdminRights && s != "home");
  const success = [];

  for (let server of serverList) if (attemptHack(ns, server)) success.push(server);

  let printOut = "";

  if (success.length == 0) printOut = `No servers added out of ${serverList.length} scanned.`;
  else printOut = `Added ${success.join()}`;

  ns.tprint(printOut);
}
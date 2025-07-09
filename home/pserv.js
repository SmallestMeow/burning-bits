/** @param {NS} ns */

// servers/home/pserv.js
export async function main(ns) {
  // const target = ns.args[1];
  let servers = ns.getPurchasedServers();
  switch (ns.args[0]) {
    case "list":
      ns.tprint(servers);
      break;
    case "upgrade_cost":
      ns.tprint(`Upgrading ${ns.args[1]} to ${ns.args[2]}gb will cost ${ns.getPurchasedServerUpgradeCost(ns.args[1], ns.args[2])}`);
      break;
    case "upgrade_buy":
      ns.upgradePurchasedServer(ns.args[1], ns.args[2]);
      break;
    case "server_cost":
      ns.tprint(ns.getPurchasedServerCost(ns.args[1]));
      break;
    case "server_buy":
      ns.purchaseServer(ns.args[1], ns.args[2]);
      break;
    case "buyall":
      let i = servers.length;
      let hostname = "pserv";

      while (ns.getPlayer().money > ns.getPurchasedServerCost(32) 
        && servers.length < ns.getPurchasedServerLimit()) {
        ns.purchaseServer(hostname + i, 32);
        i++;
        await ns.sleep(0);
      }

      if (servers.length >= ns.getPurchasedServerLimit()) {
        ns.tprint("You are at the limit!");
      }

      break;
    case "upgradeall":
      for (let server of servers) {
        let ram = ns.getServerMaxRam(server); 
        if (ns.getPurchasedServerUpgradeCost(server, ram * 2)
        < ns.getPlayer().money) {
      ns.upgradePurchasedServer(server, ram * 2)
      ns.tprint(`upgraded ${server}!`);
        } await ns.sleep(0);
      }
      break;
  }
}
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
    case "limit":
      break;
  }
}
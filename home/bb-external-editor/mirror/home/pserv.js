// servers/home/pserv.js
async function main(ns) {
  const target = ns.args[1];
  let servers = ns.getPurchasedServers();
  switch (ns.args[0]) {
    case "list":
      ns.tprint(servers);
      break;
    case "hack":
      servers.forEach(doHack, ns.args[1]);
      break;
    case "prep":
      servers.forEach(doPrep, ns.args[1]);
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
  }
  function doHack(value) {
    ns.killall(value);
    if (ns.fileExists("temp.js", value)) {
      ns.rm("temp.js", value);
    }
    if (ns.fileExists("hack.js", value)) {
      ns.rm("hack.js", value);
    }
    if (ns.fileExists("grow.js", value)) {
      ns.rm("grow.js", value);
    }
    if (ns.fileExists("weaken.js", value)) {
      ns.rm("weaken.js", value);
    }
    ns.scp("temp.js", value, "home");
    ns.scp("hack.js", value, "home");
    ns.scp("grow.js", value, "home");
    ns.scp("weaken.js", value, "home");
    ns.exec("temp.js", value, 1, target);
  }
  function doPrep(value) {
    ns.killall(value);
    if (ns.fileExists("prep.js", value)) {
      ns.rm("prep.js", value);
    }
    if (ns.fileExists("grow.js", value)) {
      ns.rm("grow.js", value);
    }
    if (ns.fileExists("weaken.js", value)) {
      ns.rm("weaken.js", value);
    }
    ns.scp("/hacking/prep.js", value, "home");
    ns.scp("/hacking/grow.js", value, "home");
    ns.scp("/hacking/weaken.js", value, "home");
    ns.exec("/hacking/prep.js", value, 1, target);
  }
}
export {
  main
};

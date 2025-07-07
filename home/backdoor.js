
import { servers } from "utilities.js";

export async function main(ns) {
 
  const servs = servers(ns, "list", "complete");
  const doNotHack = ns.getPurchasedServers();
  doNotHack.push("home");
  const willBackdoor = (server) => { return server.hasAdminRights 
    && !server.backdoorInstalled 
    && !doNotHack.includes(server.hostname) }; 

  for (let i = 0; i < servs.length; i++) {

    //ns.print(`${servs[i]}`);
    
    const toRoot = i;

    if (!ns.singularity.connect(servs[toRoot])) {
      //ns.print(`attempting to connect`);
      while (!ns.singularity.connect(servs[toRoot])) toRoot--;
      //ns.print(ns.singularity.connect(servs[i]));
      //ns.print(ns.singularity.connect(servs[jump]));
    }

    let mark = ns.getServer(servs[i]);
    //ns.print(mark.hasAdminRights);
    //ns.print(mark.isConnectedTo);
    
    if (willBackdoor(mark)) await ns.singularity.installBackdoor();
    //ns.print(mark.backdoorInstalled);

    let toScan = ns.scan(servs[i]);
    
    for (let j = 0; j < toScan.length; j++) {
      if (toScan[j] != servs[i]) {
        ns.print(`${toScan[j]}`);
        ns.singularity.connect(toScan[j]);
        mark = ns.getServer(toScan[j]);
        //ns.print(mark.isConnectedTo);
        //ns.print(mark.hasAdminRights);
        if (willBackdoor(mark)) await ns.singularity.installBackdoor();
        //ns.print(mark.backdoorInstalled);
        //ns.print(ns.singularity.connect(servs[i]));
      }
      ns.singularity.connect(servs[i]);
    }
  }

  // ns.print(servs);
  
}

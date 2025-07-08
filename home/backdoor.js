import { servers } from "utilities.js"

export async function main(ns) {
 
  const serverz = servers(ns, "list", "complete");
  const doNotHack = ns.getPurchasedServers();
  doNotHack.push("home");
  const willBackdoor = (mark) => { return mark.hasAdminRights 
    && !mark.backdoorInstalled 
    && !doNotHack.includes(mark.hostname) };

  for (const server of serverz) {
    // ns.print(server);
    if (!ns.singularity.connect(server)) { 
      ns.singularity.connect("home"); 
      ns.singularity.connect(server); 
      }
    // else ns.print(`connected to ${server}`);
    if (willBackdoor(ns.getServer(server))) {
      ns.tprint(`Installing backdoor on ${server}`)
      await ns.singularity.installBackdoor();
    }
    ns.print(`${server} has backdoor? ${ns.getServer(server).backdoorInstalled}`);
    const scannedServers = ns.scan(server);
    for (const scanned of scannedServers) {
      if (!ns.singularity.connect(scanned)) { 
      ns.singularity.connect(server);
      ns.singularity.connect(scanned);
      }
      // else ns.print(`connected to ${scanned}`);
      if (willBackdoor(ns.getServer(scanned))) {
        ns.tprint(`Installing backdoor on ${scanned}`)
        await ns.singularity.installBackdoor();
      }
      // ns.print(`${scanned} has backdoor? ${ns.getServer(scanned).backdoorInstalled}`);
    }
  }
}
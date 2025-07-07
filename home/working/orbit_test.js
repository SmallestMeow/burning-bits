// servers/home/orbit.js
async function main(ns) {
  let orbit = [["home"]];
  let needsBackdoor = [];
  let successTotal = 0;
  let failureTotal = 0;
  let count
  let printOut = "";
  const programs = ["brutessh.exe", "relaysmtp.exe", "ftpcrack.exe", "httpworm.exe", "sqlinject.exe"];
  let installed = [];
  for (let i of programs) if (ns.fileExists(i, "home")) installed.push(i);
  for (count = 0; count < orbit.length; count++) {
    let passResult = broadenOrbit(orbit[count]);
    if (passResult[0] == passResult[1]) {
      printOut += `all servers scanned from ${passResult[2]}
      `;
    } else printOut += `${passResult[0]} out of ${passResult[1]} servers scanned from ${passResult[2]}
    `;
  }
  printOut += `and ${successTotal} out of ${successTotal + failureTotal} of scanned servers overall.`;
  if (ns.args[0] != 0) {
    ns.alert(printOut);
    ns.tprint(`Need backdoors on ${needsBackdoor.join(", ")}`);
  }
  let port = ns.getPortHandle(ns.pid);
  port.clear();
  port.write(orbit);

  function broadenOrbit(server) {
    let successCount = 0;
    let failureCount = 0;
    let servers = ns.scan(server);
    for (let i of servers) {
      if (!orbit.includes(servers[i])) {
        if (!ns.hasRootAccess(servers[i])) {
          if (attemptHack(servers[i])) {
            orbit[count].push(servers[i]);
            successCount += 1;
            successTotal += 1;
          } else {
            failureCount += 1;
            failureTotal += 1;
          }
        } else {
          orbit[count].push(servers[i]);
          successCount += 1;
          successTotal += 1;
        }
        if (!ns.getServer(servers[i]).backdoorInstalled && !needsBackdoor.includes(servers[i])) {
          needsBackdoor.push(servers[i]);
        }
      }
    }
    return [successCount, successCount + failureCount, server];
  }
  function attemptHack(server) {
    if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()) {
      if (ns.getServerNumPortsRequired(server) <= installed.length) {
        if (installed.includes("brutessh.exe")) ns.brutessh(server);
        if (installed.includes("relaysmtp.exe")) ns.relaysmtp(server);
        if (installed.includes("ftpcrack.exe")) ns.ftpcrack(server);
        if (installed.includes("httpworm.exe")) ns.httpworm(server);
        if (installed.includes("sqlinject.exe")) ns.sqlinject(server);
        ns.nuke(server);
        if (ns.hasRootAccess(server)) {
          ns.tprint(`Added ${server}!`);
          return true;
        }
      }
    }
    return false;
  }
}
export {
  main
};

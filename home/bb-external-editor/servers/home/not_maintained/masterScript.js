// servers/home/not_maintained/masterScript.js
async function main(ns) {
  var orbit = ["home"];
  var successCount = 0;
  var successTotal = 0;
  var failureCount = 0;
  var failureTotal = 0;
  var passResult = [];
  var needsBackdoor = [];
  var doNotHack = ["home", "CSEC", "avmnite-02h"];
  var printOut = `Orbit inclues: 
  `;
  for (let i = 0; i < orbit.length; i++) {
    passResult = broadenOrbit(orbit[i]);
    if (passResult[0] == passResult[1]) {
      printOut += `all servers scanned from ${passResult[2]}
      `;
    } else printOut += `${passResult[0]} out of ${passResult[1]} servers scanned from ${passResult[2]}
    `;
  }
  printOut += `and ${successTotal} out of ${successTotal + failureTotal} of scanned servers overall.

  Need backdoors on ${needsBackdoor.join(", ")}.
  
  Hack initiated...`;
  ns.alert(printOut);
  ns.run("masterHack.js", calculateThreads("home"), orbit.toString());
  for (let i = 0; i < orbit.length; i++) {
    if (!doNotHack.includes(orbit[i])) {
      ns.scp("spawnHack.js", orbit[i], "home");
      if (calculateThreads(orbit[i]) > 0) {
        ns.exec("spawnHack.js", orbit[i], { threads: calculateThreads(orbit[i]), temporary: true }, orbit.toString());
      }
    }
  }
  function broadenOrbit(server) {
    successCount = 0;
    failureCount = 0;
    let servers = ns.scan(server);
    for (let i = 0; i < servers.length; i++) {
      if (!orbit.includes(servers[i])) {
        if (!ns.hasRootAccess(servers[i])) {
          if (attemptHack(servers[i])) {
            orbit.push(servers[i]);
            successCount += 1;
            successTotal += 1;
            if (!ns.getServer(orbit[i]).backdoorInstalled) {
              needsBackdoor.push(orbit[i]);
            }
          } else {
            failureCount += 1;
            failureTotal += 1;
          }
        } else {
          orbit.push(servers[i]);
          successCount += 1;
          successTotal += 1;
          if (!ns.getServer(orbit[i]).backdoorInstalled) {
            needsBackdoor.push(orbit[i]);
          }
        }
      }
    }
    return [successCount, successCount + failureCount, server];
  }
  function attemptHack(server) {
    if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()) {
      if (ns.getServerNumPortsRequired(server) <= 2) {
        ns.brutessh(server);
        ns.ftpcrack(server);
        ns.nuke(server);
        if (ns.hasRootAccess(server)) {
          return true;
        }
      }
    }
    return false;
  }
  function calculateThreads(onServer) {
    if (onServer == "home") {
      return parseInt((ns.getServerMaxRam(onServer) - ns.getServerUsedRam(onServer)) / ns.getScriptRam("masterHack.js", onServer));
    }
    return parseInt((ns.getServerMaxRam(onServer) - ns.getServerUsedRam(onServer)) / ns.getScriptRam("spawnHack.js", onServer));
  }
}
export {
  main
};

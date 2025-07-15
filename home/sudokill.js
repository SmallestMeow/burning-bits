// servers/home/sudokill.js
async function main(ns) {
  var orbit = ["home"];
  const doNotHack = ["home", "CSEC", "avmnite-02h"];
  var count = 0;
  for (let i = 0; i < orbit.length; i++) {
    if (broadenOrbit(orbit[i])) {
      count++;
    }
    if (!doNotHack.includes(orbit[i])) {
      ns.killall(orbit[i]);
    }
  }

  if (ns.args == "") ns.killall("home");
  
  function broadenOrbit(server) {
    let servers = ns.scan(server);
    for (let i = 0; i < servers.length; i++) {
      if (!orbit.includes(servers[i])) {
        if (ns.hasRootAccess(servers[i])) {
          orbit.push(servers[i]);
        }
      }
    }
    return true;
  }
}
export {
  main
};

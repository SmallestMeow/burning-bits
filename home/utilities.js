/** @param {NS} ns */
/* export async function orbit(ns) {
  const orbitPort = ns.run("orbit.js", 1, 0)
  await ns.nextPortWrite(orbitPort)
  let servers = ns.readPort(orbitPort)
  return servers
} */

  /** @param {NS} ns */
export function availRam(ns, server) {
  return ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
}

/** @param {NS} ns */
export function updateProgress(ns, max_time, run_time, bar_length = 60) {
  let done = run_time > 0 ? Math.max(max_time / run_time, 1) : 0
  let buffer = "["
  if (done > 0) {
    buffer = buffer.padEnd(Math.round((bar_length - 1) / done), "|") // open square bracket + asterisk
  }
  buffer = buffer.padEnd(bar_length - 1, "-")
  buffer += "]"

  return buffer
}

/** @param {NS} ns */
export function servers(ns, ... args) {
  const queue = [{server:"home", path:["home"]}]
  const visited = new Set(["home"]);
  const servers = ["home"];

  while (queue.length > 0) {
    const {server: currentServer, path: currentPath} = queue.shift();

    if (args[0] === "find") {
      if(currentServer === args[1]) {
        return currentPath;
        }
    }

    const neighbors = ns.scan(currentServer);

    for (const neighbor of neighbors) {
      if (args[1] === "complete") servers.push(neighbor);
      else if (!servers.includes(neighbor)) servers.push(neighbor);
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push({
          server: neighbor,
          path: [...currentPath, neighbor]
        });

      }
    }
  }
  if (args[1] === "complete") {
    for (let i = 0; i < servers.length; i++) {
      if (servers[i] === servers[i-1]) servers.splice(i, 1);
    }
  }
  if (args[0] === "list") {
    return servers;
  }
}
/** @param {NS} ns */
export async function main(ns) {
  const sleeves = ns.sleeve.getNumSleeves()

  switch (ns.args[0]) {
    case "list":
      for (let i = 0; i < sleeves; i++) {
        ns.tprint(ns.sleeve.getTask(i));
      }
      break;
    case "faction":
      for (let i = 0; i < sleeves; i++) {
        if (ns.sleeve.getTask(i) != null) continue;
        ns.sleeve.setToFactionWork(i, ns.args[1], ns.args[2]);
        break;
      }
      break;
    case "idle":
      if (ns.args[1] === "all") {
        for (let i = 0; i < sleeves; i++) ns.sleeve.setToIdle(i); 
      }
      else if (ns.args[1] === null) ns.tprint("Incorrect parameters...");
      else {
        for (const arg of ns.args) {
          if (typeof(arg) === "number") ns.sleeve.setToIdle(arg);
        }
      }
      break;
    case "crime":
      for (let i = 0; i < sleeves; i++) {
        if (ns.sleeve.getTask(i) != null) continue;
        ns.sleeve.setToCommitCrime(i, ns.args[1]);
      }
      break;
  }
}
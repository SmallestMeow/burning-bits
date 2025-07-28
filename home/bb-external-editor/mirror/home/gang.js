/** @param {NS} ns */
export async function main(ns) {

  // const gangInfo = ns.gang.getGangInformation();
  // const tasks = ns.gang.getTaskNames();
  const members = ns.gang.getMemberNames();
  const faction = "Cyberterrorism";
  const money = "Money Laundering";

 // ns.tprint(tasks);
 // ns.tprint(members);

  switch (ns.args[0]) {
    case ("faction"): for (const member of members) (ns.gang.setMemberTask(member, faction)); break;
    case ("money"): for (const member of members) (ns.gang.setMemberTask(member, money)); break;
  }
  
}
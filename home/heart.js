/** @param {NS} ns */
export async function main(ns) {

  while (true) {
    ns.print(ns.heart.break());
    if (ns.heart.break() % 1000 === 0) ns.tprint(ns.heart.break());
    await ns.sleep(60000);
  }
}
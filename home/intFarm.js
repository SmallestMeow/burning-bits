/** @param {NS} ns */
export async function main(ns) {

  const cities = ["Aevum", "Chongqing", "Ishima", "New Tokyo", "Sector-12", "Volhaven"];

  ns.singularity.connect("n00dles");

  while(ns.getPlayer().money > 200000) {
    for (let city of cities) {
      ns.singularity.travelToCity(city);
      ns.singularity.purchaseProgram("DeepscanV1.exe");
      ns.rm("DeepscanV1.exe");
      await ns.singularity.manualHack();
      await ns.sleep(0);
    }
  }
}
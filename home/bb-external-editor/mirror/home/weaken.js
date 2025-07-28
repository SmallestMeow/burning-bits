// servers/home/weaken.js
async function main(ns) {
  await ns.weaken(ns.args[0]);
}
export {
  main
};

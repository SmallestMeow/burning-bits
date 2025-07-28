// servers/home/stonks.js
async function main(ns) {
  const stonks = ns.stock.getSymbols();
  let startMoney = ns.getPlayer().money;
  let buy = stonks[0];
  let portfolio = ns.read("portfolio.txt").split(" ");
  for (let i = 0; i < stonks.length; i++) {
    if (ns.stock.getForecast(stonks[i]) > ns.stock.getForecast(buy)) buy = stonks[i];
  }
  let shares = Math.floor(1e9 / ns.stock.getAskPrice(buy));
  ns.stock.buyStock(buy, shares);
  ns.write("portfolio.txt", `${buy} ${shares} ${ns.stock.getAskPrice(buy)} `, "a");
  portfolio = ns.read("portfolio.txt").split(" ");
  ns.tprint(`bought ${shares} of ${buy}`);
  while (true) {
    await ns.stock.nextUpdate();
    for (let i = 0; i < portfolio.length - 1; i += 3) {
      if (ns.stock.getForecast(portfolio[i]) < 0.55) {
        ns.stock.sellStock(portfolio[i], portfolio[i + 1]);
        let prePort = portfolio.slice(0, i);
        let postPort = portfolio.slice(i + 3);
        portfolio = prePort.concat(postPort);
        ns.tprint(`${portfolio}`);
        break;
      }
    }
  }
}
export {
  main
};

//import { updateProgress } from "../utilities.js"
//import { availRam } from "../utilities.js"
import { servers, checkTarget, isPrepped, prep } from "../utilities.js"
// import { copyScripts } from "../utilities.js"

const TYPES = ["hack", "weaken1", "grow", "weaken2"];
const WORKERS = ["/test/thack.js", "/test/tweaken.js", "/test/tgrow.js"];
const SCRIPTS = { hack: "/test/thack.js", weaken1: "/test/tweaken.js", grow: "/test/tgrow.js", weaken2: "/test/tweaken.js" };
const COSTS = { hack: 1.7, weaken1: 1.75, grow: 1.75, weaken2: 1.75 };
//const OFFSETS = { hack: 0, weaken1: 1, grow: 2, weaken2: 3 };

/** @param {NS} ns */
export async function main(ns) {

  ns.disableLog("ALL");
  ns.ui.openTail();


  //let batchCount = 0;

  while (true) {

    const dataPort = ns.getPortHandle(ns.pid);
    dataPort.clear();

    let target = "n00dles";

    const myServers = servers(ns, "list").filter(s => ns.getServer(s).hasAdminRights);

    for (const server of myServers) target = checkTarget(ns, server, target);

    for (const server of myServers) {
      for (const file of WORKERS) ns.scp(file, server)
    }

    const ramNet = new RamNet(ns, myServers);
    const metrics = new Metrics(ns, target);

    if (!isPrepped(ns, target)) await prep(ns, metrics, ramNet);

    //optimizeBatch(ns, metrics, ramNet);

    //ns.clearLog();

    await optimizeShotgun(ns, metrics, ramNet);
    metrics.calculate(ns);

    const jobs = [];
    let batchCount = 0;

    metrics.end = Date.now() + metrics.wTime - metrics.spacer;

    while (batchCount++ < metrics.depth) {
      for (const type of TYPES) {
        metrics.end += metrics.spacer;

        const job = new Job(type, metrics, batchCount);

        // ns.print(ramNet.assign(job));
        if (!ramNet.assign(job)) {
          //if (job.server != "none") {
            ns.print(`ERROR: Unable to assign ${type}. Dumping debug info:`);
            ns.print(job);
            ns.print(metrics);
            //ramNet.printBlocks(ns);
            //return;
          //}
          continue
        }
        jobs.push(job);
      }
    }

    for (const job of jobs) {
      if (job.server != "none") {
        job.end += metrics.delay;
        const jobPid = ns.exec(SCRIPTS[job.type], job.server, { threads: job.threads, temporary: true }, JSON.stringify(job));
        if (!jobPid) throw new Error(`Unable to deploy ${job.type}`);
        const tPort = ns.getPortHandle(jobPid);
        await tPort.nextWrite();
        metrics.delay += tPort.read();
      }
    }

    jobs.reverse();

    const timer = setInterval(() => {
      ns.clearLog()
      ns.print(`Hacking ~\$${ns.formatNumber(metrics.maxMoney * metrics.greed * batchCount * metrics.chance)} from ${metrics.target}`);
      ns.print(`Greed: ${Math.floor(metrics.greed * 1000) / 10}%`);
      ns.print(`Ram available: ${ns.formatRam(ramNet.totalRam)}/${ns.formatRam(ramNet.maxRam)}`);
      ns.print(`Total delay: ${metrics.delay}ms`);
      ns.print(`Active jobs remaining: ${jobs.length}`);
      ns.print(`ETA ${ns.tFormat(metrics.end - Date.now())}`);
    }, 1000);

    ns.atExit(() => clearInterval(timer));

    do {
      await dataPort.nextWrite();
      dataPort.clear();
      ramNet.finish(jobs.pop());
    } while (jobs.length > 0);
    clearInterval(timer);
  }
}


class Job {
  constructor(type, metrics, batch) {
    this.type = type; // Hack, Weaken1, Grow, or Weaken2
    // this.end = metrics.ends[type]; // The exact date/time we intend the job to finish
    this.end = metrics.end;
    this.time = metrics.times[type]; // How long the job should take to execute
    this.target = metrics.target; // The server we're hacking
    this.threads = metrics.threads[type]; // The number of threads to run the script with
    this.cost = this.threads * COSTS[type]; // The amount of RAM the script will cost
    this.server = "none"; // The server the script is running on
    this.report = true;
    this.port = metrics.port;
    this.batch = batch;

    // Future stuff. Ignore these.
    // this.status = "active";
    // this.id = type + batch;
  }
}

/** @param {NS} ns */
class Metrics {
  constructor(ns, server) {
    this.player = ns.getPlayer();
    this.target = server;
    this.serverObject = ns.getServer(this.target);
    this.maxMoney = ns.getServerMaxMoney(server);
    this.money = Math.max(ns.getServerMoneyAvailable(server), 1);
    this.minSec = ns.getServerMinSecurityLevel(server);
    this.sec = ns.getServerSecurityLevel(server);
    this.prepped = isPrepped(ns, server);
    this.chance = 0; // Hack chance is mainly used to estimate expected returns. Not used in this part.
    this.wTime = 0; // Weaken time is stored separately from the others for convenience, since it's used often.
    this.delay = 0; // Not used in this part. The cumulative delays caused by late jobs.
    this.spacer = 5; // The number of milliseconds between each job finishing.
    this.greed = 0.1; // The portion of money we're hacking from the server. This is actually calculated by function later.
    this.depth = 0; // Not used in this part. The number of concurrent batches to run simultaneously.

    this.times = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };
    this.end = 0;
    //this.ends = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };
    this.threads = { hack: 0, weaken1: 0, grow: 0, weaken2: 0 };

    this.port = ns.pid; // We're not using ports yet, so you can ignore this.
  }

  calculate(ns, greed = this.greed) {
    const server = this.target;
    const maxMoney = this.maxMoney;
    this.money = ns.getServerMoneyAvailable(server);
    this.sec = ns.getServerSecurityLevel(server);
    this.wTime = ns.getWeakenTime(server);
    this.times.weaken1 = this.wTime;
    this.times.weaken2 = this.wTime;
    this.times.hack = this.wTime / 4;
    this.times.grow = this.wTime * 0.8;
    // this.depth = this.wTime / this.spacer * 4;

    const hPercent = ns.formulas.hacking.hackPercent(this.serverObject, this.player);
    const amount = maxMoney * greed;
    let postHack = ns.getServer(server);
    postHack.moneyAvailable = maxMoney - amount;
    const hThreads = Math.max(Math.floor(ns.hackAnalyzeThreads(server, amount)), 1);
    const tGreed = hPercent * hThreads;
    const gThreads = ns.formulas.hacking.growThreads(postHack, this.player, maxMoney);
    this.threads.weaken1 = Math.max(Math.ceil(hThreads * 0.002 / 0.05), 1);
    this.threads.weaken2 = Math.max(Math.ceil(gThreads * 0.004 / 0.05), 1);
    this.threads.hack = hThreads;
    this.threads.grow = gThreads;
    this.chance = ns.hackAnalyzeChance(server);
  }
}

/** @param {NS} ns */
class RamNet {
  #blocks = []; // A list of every server and how much ram it has available.
  #minBlockSize = Infinity; // The size of the smallest block on the network (spoilers, it usually 4).
  #maxBlockSize = 0; // The size of the largest block on the network.
  #totalRam = 0; // The total ram available on the network.
  #maxRam = 0; // The maximum ram that the network can support.
  #prepThreads = 0; // Used for the prep function
  #index = new Map(); // An index for accessing memory blocks by server. More on this later.

  constructor(ns, servers) {
    for (const server of servers) {
      if (ns.hasRootAccess(server)) {
        const maxRam = ns.getServerMaxRam(server);
        const ram = maxRam - ns.getServerUsedRam(server);
        if (ram >= 1.60) {
          const block = { server: server, ram: ram };
          this.#blocks.push(block);
          if (ram < this.#minBlockSize) this.#minBlockSize = ram;
          if (ram > this.#maxBlockSize) this.#maxBlockSize = ram;
          this.#totalRam += ram;
          this.#maxRam += maxRam;
          this.#prepThreads += Math.floor(ram / 1.75);
        }
      }
    }

    this.#sort();

    this.#blocks.forEach((block, index) => this.#index.set(block.server, index));
  }

  #sort() {
    this.#blocks.sort((x, y) => {
      if (x.server === "home") return 1;
      if (y.server === "home") return -1;
      return x.ram - y.ram;
    });
  }

  getBlock(server) {
    if (this.#index.has(server)) {
      return this.#blocks[this.#index.get(server)];
    } else if (server != "none") {
      throw new Error(`Server ${server} not found in RamNet.`);
    }
  }

  get totalRam() {
    return this.#totalRam;
  }

  get maxRam() {
    return this.#maxRam;
  }

  get maxBlockSize() {
    return this.#maxBlockSize;
  }

  get prepThreads() {
    return this.#prepThreads;
  }

  assign(job) {
    const block = this.#blocks.find(block => block.ram >= job.cost);
    if (block) {
      job.server = block.server;
      block.ram -= job.cost;
      this.#totalRam -= job.cost;
      return true;
    } else return false; // Return false if we don't find one.
  }

  finish(job) {
    if (job.server != "none") {
      const block = this.getBlock(job.server);
      block.ram += job.cost;
      this.#totalRam += job.cost;
    }
  }

  cloneBlocks() {
    return this.#blocks.map(block => ({ ...block }));
  }

  printBlocks(ns) {
    for (const block of this.#blocks) ns.tprint(block);
  }

  testThreads(threadCosts) {
    // Clone the blocks, since we don't want to actually change the ramnet.
    const pRam = this.cloneBlocks();
    let batches = 0;
    let found = true;
    while (found) {
      // Pretty much just a copy of assign(). Repeat until a batch fails to assign all it's jobs.
      for (const cost of threadCosts) {
        found = false;
        const block = pRam.find(block => block.ram >= cost);
        if (block) {
          block.ram -= cost;
          found = true;
        } else break;
      }
      if (found) batches++; // If all of the jobs were assigned successfully, +1 batch and loop.
    }
    return batches; // Otherwise, we've found our number.
  }

}

/**
 * @param {NS} ns
 * @param {Metrics} metrics
 * @param {RamNet} ramNet
 */
async function optimizeShotgun(ns, metrics, ramNet) {
  // Setup is mostly the same.
  const maxThreads = ramNet.maxBlockSize / 1.75;
  const maxMoney = metrics.maxMoney;
  const hPercent = ns.formulas.hacking.hackPercent(metrics.serverObject, metrics.player);
  const wTime = ns.getWeakenTime(metrics.target); // We'll need this for one of our calculations.

  const minGreed = 0.001;
  const stepValue = 0.01; // Step value is now 10x higher. If you think that's overkill, it's not.
  let greed = 0.99;
  let best = 0; // Initializing the best value found.

  // This algorithm starts out pretty much the same. We begin by weeding out the obviously way too huge greed levels.
  while (greed > minGreed) {
    const amount = maxMoney * greed;
    let postHack = metrics.serverObject;
    postHack.moneyAvailable = maxMoney - amount;
    const hThreads = Math.max(Math.floor(ns.hackAnalyzeThreads(metrics.target, amount)), 1);
    const tGreed = hPercent * hThreads;
    // 1% overestimation here too. Always make sure your calculations match.
    const gThreads = ns.formulas.hacking.growThreads(postHack, metrics.player, maxMoney);

    if (Math.max(hThreads, gThreads) <= maxThreads) {
      const wThreads1 = Math.max(Math.ceil(hThreads * 0.002 / 0.05), 1);
      const wThreads2 = Math.max(Math.ceil(gThreads * 0.004 / 0.05), 1);

      const threadCosts = [hThreads * 1.7, wThreads1 * 1.75, gThreads * 1.75, wThreads2 * 1.75];

      // These lines were supposed to help weed out a few more too-high values, but in my unit tests they never
      // actually did anything. Uncomment them if you want.
      // const totalCost = threadCosts.reduce((t, c) => t + c);
      // if (totalCost > ramNet.totalRam) continue;

      /*
      Here's where it all changes. First we calculate the number of batches we can fit into ram at the current
      greed level. Then we calculate how much money that nets and how long it will take. If that income/time is
      better than what we've found before, we update the metrics and then continue.

      Unlike the previous version, this one checks every value. Between that and the loop to simulate assigning
      jobs, this is a very heavy algorithm that can take seconds to execute if done synchronously. To prevent it
      from freezing the game, we run it asynchronously and sleep after checking each value.
      */
      const batchCount = ramNet.testThreads(threadCosts);
      const income = tGreed * maxMoney * batchCount / (metrics.spacer * 4 * batchCount + wTime);
      if (income > best) {
        best = income;
        metrics.greed = tGreed;
        metrics.depth = batchCount;
      }
    }
    await ns.sleep(0);
    greed -= stepValue;
  }
  // Added the check here to only throw an error if we failed to find any valid configurations.
  if (best === 0) throw new Error("Not enough ram to run even a single batch. Something has gone seriously wrong.");
}

/* export function optimizeBatch(ns, metrics, ramNet) {
  const maxThreads = ramNet.maxBlockSize / 1.75;
  const maxMoney = metrics.maxMoney;
  const hPercent = ns.hackAnalyze(metrics.target);

  const minGreed = 0.001;
  const stepValue = 0.001;
  let greed = 0.99;
  while (greed > minGreed) {
    const amount = maxMoney * greed;
    const hThreads = Math.max(Math.floor(ns.hackAnalyzeThreads(metrics.target, amount)), 1);
    const tGreed = hPercent * hThreads;
    const gThreads = Math.ceil(ns.growthAnalyze(metrics.target, maxMoney / (maxMoney - maxMoney * tGreed)));

    if (Math.max(hThreads, gThreads) <= maxThreads) {
      const wThreads1 = Math.max(Math.ceil(hThreads * 0.002 / 0.05), 1);
      const wThreads2 = Math.max(Math.ceil(gThreads * 0.004 / 0.05), 1);

      const threadCosts = [hThreads * 1.7, wThreads1 * 1.75, gThreads * 1.75, wThreads2 * 1.75];

      const pRam = ramNet.cloneBlocks();
      let found;
      for (const cost of threadCosts) {
        found = false;
        for (const block of pRam) {
          if (block.ram < cost) continue;
          found = true;
          block.ram -= cost;
          break;
        }
        if (found) continue;
        // If we're ever unable to assign one of the jobs, we break and try again.
        break;
      }
      // If we managed to assign them all, great! Set the corresponding values in metrics and report our success.
      if (found) {
        metrics.greed = greed;
        metrics.threads = { hack: hThreads, weaken1: wThreads1, grow: gThreads, weaken2: wThreads2 };
        return true;
      }
    }
    greed -= stepValue;
  }
  throw new Error("Not enough ram to run even a single batch. Something has gone seriously wrong.");
}



//let cycle = 1;
//let totalRAM= 0;


/* const hAmount = target.moneyMax * greed;
  ns.print(hAmount);
  let hThreads = Math.ceil(ns.hackAnalyzeThreads(target.hostname, hAmount));
  //ns.print(hThreads);
  const postHack = {... target};
  postHack.moneyAvailale -= hAmount;
  postHack.hackDifficulty += ns.hackAnalyzeSecurity(hThreads, target.hostname);

  let w1Threads = Math.ceil((postHack.hackDifficulty - postHack.minDifficulty) / 
      ns.weakenAnalyze(1, 1)); //ns.getServer(server).cpuCores));

      ns.print(w1Threads);

    let gThreads = ns.formulas.hacking.growThreads(postHack, me, target.moneyMax, 1); //ns.getServer(server).cpuCores);

    const postGrow = { ...target };
    postGrow.hackDifficulty += ns.growthAnalyzeSecurity(gThreads, target.hostname);
    
    let w2Threads = Math.ceil((postGrow.hackDifficulty - postGrow.minDifficulty) / 
      ns.weakenAnalyze(1, 1)); //ns.getServer(server).cpuCores));
      ns.print(w2Threads);


/* while (true) {

  

  const prepped = ns.getServerSecurityLevel(target.hostname) == ns.getServerMinSecurityLevel(target.hostname) &&
    ns.getServerMaxMoney(target.hostname) == ns.getServerMoneyAvailable(target.hostname);

  


  const hTime = ns.formulas.hacking.hackTime(target, me);
  const gTime = ns.formulas.hacking.growTime(target, me);
  const wTime = ns.formulas.hacking.weakenTime(target, me);

  let toGrow = false;
  let hOffset = wTime - hTime - 5;
  let gOffset = wTime - gTime + 5;

  let wait = 0;
  let maxAvail = [0, "home"];
  let maxScript = [0, "home"];
  let maxHack = [0, "home"];
  let i = 0; // How many batches running on this server.
  let j = 0;
  let spin = 0;

  let isHacking = false;

  /* for (let server of myServers) {

    if (ns.args[1] == 0 && server == "home") continue; // In case we don't want to run this on home.

    

    // If the server isn't prepped, prep it.
    if (!prepped && (j < myServers.length / 2 || cycle < 3) && ns.args[1] != "noprep") {
      let g = Math.ceil((availRam(ns, server) / 3.5) * 0.9);
      if (g == 0) g = 1;
      let w = 1;
      if (ns.getServerMaxMoney(target.hostname) > ns.getServerMoneyAvailable(target.hostname)) {
        ns.exec("/hacking/grow.js", server, g, target.hostname, gOffset);
        toGrow = true;
      }
      if (toGrow) w = Math.ceil(g / 12.5);
      else w = Math.floor(availRam(ns, server) / 3.5);
      if (w == 0) w = 1;
      ns.exec("/hacking/weaken.js", server, w, target.hostname);
      j++
    }

    else {
        totalRAM = hThreads * 1.7 + (w1Threads + w2Threads + gThreads) * 1.75;
        ns.print(totalRAM);
        const threadsAvail = availRam(ns, server) / totalRAM;
        const ratio = threadsAvail > 1 ? 1 : threadsAvail;

        hThreads = Math.floor(hThreads * ratio);
        if (hThreads == 0) continue;
        gThreads = Math.floor(gThreads * ratio);
        if (gThreads == 0) continue;
        w1Threads = Math.floor(w1Threads * ratio);
        if (w1Threads == 0) continue;
        w2Threads = Math.floor(w2Threads * ratio);
        if (w2Threads == 0) continue;


        ns.exec("/hacking/hack.js", server, { threads: hThreads, temporary: true }, target.hostname, hOffset);
        ns.exec("/hacking/weaken.js", server, { threads: w1Threads, temporary: true }, target.hostname);
        ns.exec("/hacking/grow.js", server, { threads: gThreads, temporary: true }, target.hostname, gOffset);
        ns.exec("/hacking/weaken.js", server, { threads: w2Threads, temporary: true }, target.hostname, 10);

        i++

        isHacking = true;

      }

    if (wait < ns.getWeakenTime(target.hostname)) wait = ns.getWeakenTime(target.hostname);
    if (maxAvail[0] < availRam(ns, server)) maxAvail = [availRam(ns, server), server];
    if (maxScript[0] < totalRAM) maxScript = [totalRAM, server];
    if (maxHack[0] < hThreads) maxHack = [hThreads, server];
    spin += i + j;
    if (spin >= 95000) break;
    // await ns.sleep(0);

  }

  ns.ui.openTail();
 if (!isHacking) ns.ui.resizeTail(390, 160);
  else if (j > 0) ns.ui.resizeTail(390, 252);
  else ns.ui.resizeTail(390, 230);


  // ns.print(`${availRam()} ${totalRAM()} ${hThreadz}`)
  let maxTime = wait;
  for (let timeLeft = maxTime; timeLeft > 0; timeLeft -= 300) {
    ns.clearLog();
    ns.print(`\$${Math.floor(ns.getServerMoneyAvailable(target.hostname))} out of \$${+ns.getServerMaxMoney(target.hostname)}`)
    ns.print(`at SecLevel: ${ns.getServerSecurityLevel(target.hostname).toFixed(2)} of SecMin: ${ns.getServerMinSecurityLevel(target.hostname)}`);
    if (isHacking) {
      ns.print(`Hightst RAM Avail: ${maxAvail[0].toFixed(2)} on ${maxAvail[1]}`)
      ns.print(`Hightest Script Threads: ${maxScript[0].toFixed(2)} on ${maxScript[1]}`)
      ns.print(`Highest Hack Threads: ${maxHack[0]} on ${maxHack[1]}`);
      ns.print(`Spun up ${spin} ${spin == 1 ? "batch" : "batches"} on cycle ${cycle}`);
    }
    if (j > 0) ns.print(`Prepping on ${j} out of ${myServers.length} servers`);
    ns.print(`${Math.round(timeLeft / 1000)} seconds remaining...`)
    ns.print(updateProgress(ns, maxTime, timeLeft));
    ns.ui.renderTail();
    await ns.sleep(300);
 
  }


  await ns.sleep(15);
  cycle += 1;
  i = 0;
  j = 0;
  
}*/


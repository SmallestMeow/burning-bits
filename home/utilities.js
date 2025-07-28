/** @param {NS} ns */
export async function main(ns) {
  ns.tprint("This is just a function library, it doesn't do anything.");
}

/** @param {NS} ns */
export function availRam(ns, server) {
  return ns.getServerMaxRam(server) - ns.getServerUsedRam(server);
}

/** @param {NS} ns */
export function isPrepped(ns, server) {
  const tolerance = 0.0001;
  const maxMoney = ns.getServerMaxMoney(server);
  const money = ns.getServerMoneyAvailable(server);
  const minSec = ns.getServerMinSecurityLevel(server);
  const sec = ns.getServerSecurityLevel(server);
  const secFix = Math.abs(sec - minSec) < tolerance; // A fix for floating point innaccuracy.
  return (money === maxMoney && secFix) ? true : false;
}

/** @param {NS} ns */
export function updateProgress(ns, max_time, run_time, bar_length = 40) {
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
export function servers(ns, ...args) {
  const queue = [{ server: "home", path: ["home"] }]
  const visited = new Set(["home"]);
  const servers = ["home"];

  while (queue.length > 0) {
    const { server: currentServer, path: currentPath } = queue.shift();

    if (args[0] === "find") {
      if (currentServer === args[1]) {
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
      if (servers[i] === servers[i - 1]) servers.splice(i, 1);
    }
  }
  if (args[0] === "list") {
    return servers;
  }
}

/** @param {NS} ns */
export function attemptHack(ns, server) {
  const programs = ["brutessh.exe", "relaysmtp.exe", "ftpcrack.exe", "httpworm.exe", "sqlinject.exe"];
  let installed = [];
  for (let program of programs) if (ns.fileExists(program, "home")) installed.push(program);

  if (ns.getServerRequiredHackingLevel(server) <= ns.getHackingLevel()) {
    if (ns.getServerNumPortsRequired(server) <= installed.length) {
      if (installed.includes("brutessh.exe")) ns.brutessh(server);
      if (installed.includes("relaysmtp.exe")) ns.relaysmtp(server);
      if (installed.includes("ftpcrack.exe")) ns.ftpcrack(server);
      if (installed.includes("httpworm.exe")) ns.httpworm(server);
      if (installed.includes("sqlinject.exe")) ns.sqlinject(server);
      ns.nuke(server);
      if (ns.hasRootAccess(server)) return true;
    }
  }
  return false;
}


/** @param {NS} ns */
export function checkTarget(ns, server, target = "n00dles") {
  if (!ns.hasRootAccess(server)) return target;
  const player = ns.getPlayer();
  const serverSim = ns.getServer(server);
  const pSim = ns.getServer(target);
  let previousScore;
  let currentScore;

  if (serverSim.requiredHackingSkill <= player.skills.hacking) {
    serverSim.hackDifficulty = serverSim.minDifficulty;
    pSim.hackDifficulty = pSim.minDifficulty;
    previousScore = pSim.moneyMax / ns.formulas.hacking.weakenTime(pSim, player) * ns.formulas.hacking.hackChance(pSim, player);
    currentScore = serverSim.moneyMax / ns.formulas.hacking.weakenTime(serverSim, player) * ns.formulas.hacking.hackChance(serverSim, player);
    if (currentScore > previousScore) target = server;
  }
  return target;
}

// A simple function for copying a list of scripts to a server.
/** @param {NS} ns */
export function copyScripts(ns, server, scripts, overwrite = false) {
  for (const script of scripts) {
    if ((!ns.fileExists(script, server) || overwrite) && ns.hasRootAccess(server)) {
      ns.scp(script, server, "home");
    }
  }
}

/** @param {NS} ns */
export async function prep(ns, values, ramNet) {
  const player = ns.getPlayer();
  const server = ns.getServer(values.target);
	const maxMoney = values.maxMoney;
	const minSec = values.minSec;
	let money = values.money;
	let sec = values.sec;
	while (!isPrepped(ns, values.target)) {
		const wTime = ns.formulas.hacking.weakenTime(server, player);
		const gTime = wTime * 0.8;
		const dataPort = ns.getPortHandle(ns.pid);
		dataPort.clear();

		const pRam = ramNet.cloneBlocks();
		const maxThreads = Math.floor(ramNet.maxBlockSize / 1.75);
		const totalThreads = ramNet.prepThreads;
		let wThreads1 = 0;
		let wThreads2 = 0;
		let gThreads = 0;
		let batchCount = 1;
		let script, mode;
		/*
		Modes:
		0: Security only
		1: Money only
		2: One shot
		*/

		if (money < maxMoney) {
			gThreads = Math.ceil(ns.formulas.hacking.growThreads(server, player, maxMoney));
			wThreads2 = Math.ceil(ns.growthAnalyzeSecurity(gThreads) / 0.05);
		}
		if (sec > minSec) {
			wThreads1 = Math.ceil((sec - minSec) * 20);
			if (!(wThreads1 + wThreads2 + gThreads <= totalThreads && gThreads <= maxThreads)) {
				gThreads = 0;
				wThreads2 = 0;
				batchCount = Math.ceil(wThreads1 / totalThreads);
				if (batchCount > 1) wThreads1 = totalThreads;
				mode = 0;
			} else mode = 2;
		} else if (gThreads > maxThreads || gThreads + wThreads2 > totalThreads) {
			mode = 1;
			const oldG = gThreads;
			wThreads2 = Math.max(Math.floor(totalThreads / 13.5), 1);
			gThreads = Math.floor(wThreads2 * 12.5);
			batchCount = Math.ceil(oldG / gThreads);
		} else mode = 2;

		// Big buffer here, since all the previous calculations can take a while. One second should be more than enough.
		const wEnd1 = Date.now() + wTime + 1000;
		const gEnd = wEnd1 + values.spacer;
		const wEnd2 = gEnd + values.spacer;

		// "metrics" here is basically a mock Job object. Again, this is just an artifact of repurposed old code.
		const metrics = {
			batch: "prep",
			target: values.target,
			type: "none",
			time: 0,
			end: 0,
			port: ns.pid,
			log: values.log,
			report: false
		};

		for (const block of pRam) {
			while (block.ram >= 1.75) {
				const bMax = Math.floor(block.ram / 1.75)
				let threads = 0;
				if (wThreads1 > 0) {
					script = "/test/tweaken.js";
					metrics.type = "pWeaken1";
					metrics.time = wTime;
					metrics.end = wEnd1;
					threads = Math.min(wThreads1, bMax);
					if (wThreads2 === 0 && wThreads1 - threads <= 0) metrics.report = true;
					wThreads1 -= threads;
				} else if (wThreads2 > 0) {
					script = "/test/tweaken.js";
					metrics.type = "pWeaken2";
					metrics.time = wTime;
					metrics.end = wEnd2;
					threads = Math.min(wThreads2, bMax);
					if (wThreads2 - threads === 0) metrics.report = true;
					wThreads2 -= threads;
				} else if (gThreads > 0 && mode === 1) {
					script = "/test/tgrow.js";
					metrics.type = "pGrow";
					metrics.time = gTime;
					metrics.end = gEnd;
					threads = Math.min(gThreads, bMax);
					metrics.report = false;
					gThreads -= threads;
				} else if (gThreads > 0 && bMax >= gThreads) {
					script = "/test/tgrow.js";
					metrics.type = "pGrow";
					metrics.time = gTime;
					metrics.end = gEnd;
					threads = gThreads;
					metrics.report = false;
					gThreads = 0;
				} else break;
				metrics.server = block.server;
				const pid = ns.exec(script, block.server, { threads: threads, temporary: true }, JSON.stringify(metrics));
				if (!pid) throw new Error("Unable to assign all jobs.");
				block.ram -= 1.75 * threads;
			}
		}

		// Fancy UI stuff to update you on progress.
		const tEnd = ((mode === 0 ? wEnd1 : wEnd2) - Date.now()) * batchCount + Date.now();
		const timer = setInterval(() => {
			ns.clearLog();
			switch (mode) {
				case 0:
					ns.print(`Weakening security on ${values.target}...`);
					break;
				case 1:
					ns.print(`Maximizing money on ${values.target}...`);
					break;
				case 2:
					ns.print(`Finalizing preparation on ${values.target}...`);
			}
			ns.print(`Security: +${ns.formatNumber(sec - minSec, 3)}`);
			ns.print(`Money: \$${ns.formatNumber(money, 2)}/${ns.formatNumber(maxMoney, 2)}`);
			const time = tEnd - Date.now();
			ns.print(`Estimated time remaining: ${ns.tFormat(time)}`);
			ns.print(`~${batchCount} ${(batchCount === 1) ? "batch" : "batches"}.`);
		}, 200);
		ns.atExit(() => clearInterval(timer));

		// Wait for the last weaken to finish.
		do await dataPort.nextWrite(); while (!dataPort.read().startsWith("pWeaken"));
		clearInterval(timer);
		await ns.sleep(100);

		money = ns.getServerMoneyAvailable(values.target);
		sec = ns.getServerSecurityLevel(values.target);
	}
	return true;
}
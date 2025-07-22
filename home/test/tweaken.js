/** @param {NS} ns */
export async function main(ns) {
	const job = JSON.parse(ns.args[0]);

	// Calculate the delay required to end at the job's designated time. We do it now for best possible accuracy.
	let delay = job.end - job.time - Date.now();
	if (delay < 0) {
		// Send a warning, but don't actually cancel the job if it's late.
		// The warning isn't sent to the terminal, since it would just get erased. Check logs if jobs land out of order.
		ns.tprint(`WARN: Batch ${job.batch} ${job.type} was ${-delay}ms too late. (${job.end})\n`);
		ns.writePort(ns.pid, -delay);
		delay = 0;
	} else {
		ns.writePort(ns.pid, 0);
	}
	await ns.weaken(job.target, { additionalMsec: delay });
	const end = Date.now();

	ns.atExit(() => {
		if (job.report) ns.writePort(job.port, job.type + job.server);
		// ns.tprint(`Batch ${job.batch}: ${job.type} finished at ${end.toString().slice(-6)}/${Math.round(job.end).toString().slice(-6)}\n`);
	});
}
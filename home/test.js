import { servers } from "utilities.js"

export async function main(ns) {
 
ns.print(servers(ns, "list"));

}
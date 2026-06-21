import { db } from '../../config'
import { EclConfigurationsRepository } from '../../repositories/ecl-configurations.repository'

async function run() {
    try {
        console.log("Fetching details...");
        const details = await EclConfigurationsRepository.findDetailsByHeaderId(1n)();
        console.log("Details:", details);
    } catch (e) {
        console.error("Error:", e);
    }
}
run();

// HF Workbench — Boost Engine
// Shared gain-boost model for vertical antennas

export class BoostEngine {
    /**
     * config = {
     *   groundScreen: boolean,
     *   elevatedRadials: boolean,
     *   saltwater: boolean,
     *   dxTurbo: boolean,
     *   notes?: string[]
     * }
     */
    static computeBoost(config = {}) {
        const details = [];
        let total = 0;

        if (config.groundScreen) {
            const boost = 1.0; // dB
            total += boost;
            details.push({ key: "groundScreen", label: "Ground screen", boost });
        }

        if (config.elevatedRadials) {
            const boost = 1.5; // dB
            total += boost;
            details.push({ key: "elevatedRadials", label: "Elevated radials", boost });
        }

        if (config.saltwater) {
            const boost = 2.0; // dB
            total += boost;
            details.push({ key: "saltwater", label: "Saltwater ground", boost });
        }

        if (config.dxTurbo) {
            const boost = 1.2; // dB
            total += boost;
            details.push({ key: "dxTurbo", label: "0.70λ DX Turbo", boost });
        }

        return {
            totalBoost: total,
            details
        };
    }
}

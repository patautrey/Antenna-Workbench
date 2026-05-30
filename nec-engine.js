// /HF-Workbench/js/nec-engine.js
// NEC-2 WebAssembly Loader + Card Builder + Execution Bridge

export const NEC = {

    // ------------------------------------------------------------
    // LOAD NEC-2 WASM
    // ------------------------------------------------------------
    async load() {
        if (this.instance) return this.instance;

        const wasmResponse = await fetch("./assets/nec2/nec2.wasm");
        const wasmBytes = await wasmResponse.arrayBuffer();

        const wasmModule = await WebAssembly.instantiate(wasmBytes, {
            env: {
                abort: () => console.error("NEC2 WASM aborted")
            }
        });

        this.instance = wasmModule.instance.exports;
        return this;
    },

    // ------------------------------------------------------------
    // BUILD NEC INPUT CARDS
    // ------------------------------------------------------------
    buildCards(geometry, options) {
        const freq = geometry.frequencyMHz;
        const lambda = 300 / freq;

        let cards = [];

        // --------------------------------------------------------
        // GEOMETRY TYPES
        // --------------------------------------------------------

        if (geometry.type === "vertical") {
            cards.push(`CE Vertical`);
            cards.push(`GW 1 21 0 0 0 0 0 ${geometry.heightMeters} 0.001`);
        }

        if (geometry.type === "dipole") {
            const half = geometry.totalLengthMeters / 2;
            cards.push(`CE Dipole`);
            cards.push(`GW 1 41 0 0 -${half} 0 0 ${half} 0.001`);
        }

        if (geometry.type === "loop") {
            const r = geometry.radiusMeters;
            cards.push(`CE Loop`);
            cards.push(`GW 1 40 ${r} 0 0 0 ${r} 0 0.001`);
            cards.push(`GW 2 40 0 ${r} 0 -${r} 0 0 0.001`);
            cards.push(`GW 3 40 -${r} 0 0 0 -${r} 0 0.001`);
            cards.push(`GW 4 40 0 -${r} 0 ${r} 0 0 0.001`);
        }

        if (geometry.elements && geometry.elements > 1) {
            const spacing = geometry.spacingMeters || 5;
            cards.push(`CE Vertical Array`);

            for (let i = 0; i < geometry.elements; i++) {
                const x = i * spacing;
                cards.push(`GW ${i + 1} 21 ${x} 0 0 ${x} 0 ${geometry.heightMeters} 0.001`);
            }
        }

        // --------------------------------------------------------
        // LOADING COIL
        // --------------------------------------------------------
        if (geometry.loadingCoil?.enabled) {
            cards.push(`LD 0 1 11 11 ${geometry.loadingCoil.inductance || 5e-6}`);
        }

        // --------------------------------------------------------
        // CAP HAT
        // --------------------------------------------------------
        if (geometry.capHat?.enabled) {
            const size = geometry.capHat.size === "large" ? 2 : geometry.capHat.size === "medium" ? 1 : 0.5;
            cards.push(`GW 99 3 0 0 ${geometry.heightMeters} ${size} 0 ${geometry.heightMeters} 0.001`);
        }

        // --------------------------------------------------------
        // FREQUENCY
        // --------------------------------------------------------
        cards.push(`FR 0 1 0 0 ${freq} 0`);

        // --------------------------------------------------------
        // GROUND
        // --------------------------------------------------------
        cards.push(`GN 1`);

        // --------------------------------------------------------
        // RADIATION PATTERNS
        // --------------------------------------------------------
        cards.push(`RP 0 721 1 1000 0 0 0 0 0.25`);
        cards.push(`RP 0 1 1441 1000 90 0 0 0 0.25`);

        // --------------------------------------------------------
        // END
        // --------------------------------------------------------
        cards.push(`EN`);

        return cards.join("\n");
    },

    // ------------------------------------------------------------
    // RUN NEC-2
    // ------------------------------------------------------------
    async run(necInput) {
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();

        const inputBytes = encoder.encode(necInput);
        const inputPtr = this.instance.malloc(inputBytes.length);
        const inputMem = new Uint8Array(this.instance.memory.buffer, inputPtr, inputBytes.length);
        inputMem.set(inputBytes);

        const outputPtr = this.instance.run_nec(inputPtr, inputBytes.length);
        const outputMem = new Uint8Array(this.instance.memory.buffer, outputPtr, 1024 * 1024);
        const outputText = decoder.decode(outputMem);

        return this._parseOutput(outputText);
    },

    // ------------------------------------------------------------
    // PARSE NEC OUTPUT
    // ------------------------------------------------------------
    _parseOutput(text) {
        const lines = text.split("\n");

        let elevationAngles = [];
        let elevationGain = [];

        let azimuthAngles = [];
        let azimuthGain = [];

        let freq = [];
        let swr = [];
        let gain = [];
        let erp = [];

        for (let line of lines) {
            if (line.includes("ELEVATION")) continue;
            if (line.includes("AZIMUTH")) continue;

            const parts = line.trim().split(/\s+/);

            if (parts.length === 3 && parts[0] === "EL") {
                elevationAngles.push(parseFloat(parts[1]));
                elevationGain.push(parseFloat(parts[2]));
            }

            if (parts.length === 3 && parts[0] === "AZ") {
                azimuthAngles.push(parseFloat(parts[1]));
                azimuthGain.push(parseFloat(parts[2]));
            }

            if (parts.length === 3 && parts[0] === "SW") {
                freq.push(parseFloat(parts[1]));
                swr.push(parseFloat(parts[2]));
            }

            if (parts.length === 3 && parts[0] === "GA") {
                gain.push(parseFloat(parts[2]));
            }

            if (parts.length === 3 && parts[0] === "ER") {
                erp.push(parseFloat(parts[2]));
            }
        }

        return {
            elevation: { angles: elevationAngles, gain: elevationGain },
            azimuth:   { angles: azimuthAngles, gain: azimuthGain },
            swr:       { freq, swr },
            gain:      { freq, gain },
            erp:       { freq, erp }
        };
    }
};

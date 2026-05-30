// /HF-Workbench/js/plot-engine.js
// Full Plot Engine for all antenna modules (Elevation, Azimuth, Gain, SWR, ERP)

export const PlotEngine = {
    renderAll(antennaData, boostData) {
        this.renderElevation(antennaData, boostData);
        this.renderAzimuth(antennaData, boostData);
        this.renderGain(antennaData, boostData);
        this.renderSWR(antennaData);
        this.renderERP(antennaData, boostData);
    },

    renderElevation(antennaData, boostData) {
        const el = document.getElementById("plot-elevation");
        if (!el) return;

        const angles = antennaData.elevationAngles;
        const gain = antennaData.elevationGain;

        const trace = {
            x: angles,
            y: gain,
            type: "scatter",
            mode: "lines",
            line: { color: "#00ccff", width: 2 },
            name: "Elevation Gain"
        };

        const layout = {
            title: "Elevation Pattern",
            xaxis: { title: "Elevation Angle (°)" },
            yaxis: { title: "Gain (dBi)" },
            margin: { t: 40, l: 50, r: 20, b: 50 },
            paper_bgcolor: "#111",
            plot_bgcolor: "#111",
            font: { color: "#fff" }
        };

        Plotly.newPlot(el, [trace], layout, { responsive: true });
    },

    renderAzimuth(antennaData, boostData) {
        const el = document.getElementById("plot-azimuth");
        if (!el) return;

        const angles = antennaData.azimuthAngles;
        const gain = antennaData.azimuthGain;

        const trace = {
            type: "scatterpolar",
            r: gain,
            theta: angles,
            mode: "lines",
            line: { color: "#ffaa00", width: 2 },
            name: "Azimuth Gain"
        };

        const layout = {
            title: "Azimuth Pattern",
            polar: {
                bgcolor: "#111",
                radialaxis: { color: "#fff" },
                angularaxis: { color: "#fff" }
            },
            paper_bgcolor: "#111",
            font: { color: "#fff" }
        };

        Plotly.newPlot(el, [trace], layout, { responsive: true });
    },

    renderGain(antennaData, boostData) {
        const el = document.getElementById("plot-gain");
        if (!el) return;

        const freq = antennaData.freqSweep;
        const gain = antennaData.gainSweep;

        const trace = {
            x: freq,
            y: gain,
            type: "scatter",
            mode: "lines",
            line: { color: "#66ff66", width: 2 },
            name: "Gain vs Frequency"
        };

        const layout = {
            title: "Gain Across Band",
            xaxis: { title: "Frequency (MHz)" },
            yaxis: { title: "Gain (dBi)" },
            margin: { t: 40, l: 50, r: 20, b: 50 },
            paper_bgcolor: "#111",
            plot_bgcolor: "#111",
            font: { color: "#fff" }
        };

        Plotly.newPlot(el, [trace], layout, { responsive: true });
    },

    renderSWR(antennaData) {
        const el = document.getElementById("plot-swr");
        if (!el) return;

        const freq = antennaData.freqSweep;
        const swr = antennaData.swrSweep;

        const trace = {
            x: freq,
            y: swr,
            type: "scatter",
            mode: "lines",
            line: { color: "#ff4444", width: 2 },
            name: "SWR"
        };

        const layout = {
            title: "SWR Across Band",
            xaxis: { title: "Frequency (MHz)" },
            yaxis: { title: "SWR" },
            margin: { t: 40, l: 50, r: 20, b: 50 },
            paper_bgcolor: "#111",
            plot_bgcolor: "#111",
            font: { color: "#fff" }
        };

        Plotly.newPlot(el, [trace], layout, { responsive: true });
    },

    renderERP(antennaData, boostData) {
        const el = document.getElementById("plot-erp");
        if (!el) return;

        const freq = antennaData.freqSweep;
        const erp = antennaData.erpSweep;

        const trace = {
            x: freq,
            y: erp,
            type: "scatter",
            mode: "lines",
            line: { color: "#ff66ff", width: 2 },
            name: "ERP"
        };

        const layout = {
            title: "ERP Across Band",
            xaxis: { title: "Frequency (MHz)" },
            yaxis: { title: "ERP (W)" },
            margin: { t: 40, l: 50, r: 20, b: 50 },
            paper_bgcolor: "#111",
            plot_bgcolor: "#111",
            font: { color: "#fff" }
        };

        Plotly.newPlot(el, [trace], layout, { responsive: true });
    }
};

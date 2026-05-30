// /HF-Workbench/js/plot-engine.js
// High-Resolution Plot Engine for HF Workbench

export const PlotEngine = {

    // ------------------------------------------------------------
    // PUBLIC API
    // ------------------------------------------------------------
    renderElevation(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        this._drawPolar(canvas, data.angles, data.gain, "Elevation Pattern");
    },

    renderAzimuth(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        this._drawPolar(canvas, data.angles, data.gain, "Azimuth Pattern");
    },

    renderSWR(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        this._drawCartesian(canvas, data.freq, data.swr, "SWR", "SWR");
    },

    renderGain(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        this._drawCartesian(canvas, data.freq, data.gain, "Gain (dBi)", "Gain");
    },

    renderERP(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        this._drawCartesian(canvas, data.freq, data.erp, "ERP (W)", "ERP");
    },

    // ------------------------------------------------------------
    // POLAR PLOT (Elevation / Azimuth)
    // ------------------------------------------------------------
    _drawPolar(canvas, angles, gain, title) {
        const ctx = canvas.getContext("2d");
        const w = canvas.width;
        const h = canvas.height;
        const cx = w / 2;
        const cy = h / 2;
        const radius = Math.min(w, h) * 0.42;

        ctx.clearRect(0, 0, w, h);
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = "#ccc";
        ctx.fillStyle = "#fff";
        ctx.font = "14px sans-serif";

        // Title
        ctx.fillText(title, 10, 20);

        // dB scaling
        const maxGain = Math.max(...gain);
        const minGain = maxGain - 40;

        // Draw radial gridlines
        for (let db = 0; db >= -40; db -= 10) {
            const r = radius * (1 - (maxGain - (maxGain + db)) / 40);
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillText(`${db} dB`, cx + r + 5, cy);
        }

        // Draw angle spokes
        ctx.strokeStyle = "#bbb";
        for (let a = 0; a < 360; a += 30) {
            const rad = a * Math.PI / 180;
            const x = cx + radius * Math.cos(rad);
            const y = cy + radius * Math.sin(rad);
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(x, y);
            ctx.stroke();
        }

        // Plot pattern
        ctx.strokeStyle = "#00aaff";
        ctx.lineWidth = 2;
        ctx.beginPath();

        angles.forEach((deg, i) => {
            const rad = deg * Math.PI / 180;
            const g = gain[i];
            const norm = (g - minGain) / (maxGain - minGain);
            const r = radius * norm;

            const x = cx + r * Math.cos(rad);
            const y = cy + r * Math.sin(rad);

            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });

        ctx.closePath();
        ctx.stroke();
    },

    // ------------------------------------------------------------
    // CARTESIAN PLOT (SWR, Gain, ERP)
    // ------------------------------------------------------------
    _drawCartesian(canvas, xData, yData, yLabel, title) {
        const ctx = canvas.getContext("2d");
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);
        ctx.font = "14px sans-serif";
        ctx.fillStyle = "#fff";
        ctx.strokeStyle = "#ccc";

        // Title
        ctx.fillText(title, 10, 20);

        // Plot area
        const left = 50;
        const right = w - 20;
        const top = 40;
        const bottom = h - 40;

        // Axes
        ctx.beginPath();
        ctx.moveTo(left, top);
        ctx.lineTo(left, bottom);
        ctx.lineTo(right, bottom);
        ctx.stroke();

        // Scaling
        const xMin = Math.min(...xData);
        const xMax = Math.max(...xData);
        const yMin = Math.min(...yData);
        const yMax = Math.max(...yData);

        const xScale = (right - left) / (xMax - xMin);
        const yScale = (bottom - top) / (yMax - yMin);

        // Gridlines
        ctx.strokeStyle = "#444";
        ctx.lineWidth = 0.8;

        for (let i = 0; i <= 5; i++) {
            const y = bottom - i * (bottom - top) / 5;
            ctx.beginPath();
            ctx.moveTo(left, y);
            ctx.lineTo(right, y);
            ctx.stroke();
        }

        // Plot curve
        ctx.strokeStyle = "#00aaff";
        ctx.lineWidth = 2;
        ctx.beginPath();

        xData.forEach((x, i) => {
            const px = left + (x - xMin) * xScale;
            const py = bottom - (yData[i] - yMin) * yScale;

            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
        });

        ctx.stroke();

        // Labels
        ctx.fillText(yLabel, 10, h / 2);
        ctx.fillText(`${xMin.toFixed(2)} MHz`, left, bottom + 20);
        ctx.fillText(`${xMax.toFixed(2)} MHz`, right - 40, bottom + 20);
    }
};

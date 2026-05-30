// /HF-Workbench/js/modules/quick-start.js
// Full Quick Start Guide module for HF Workbench

export function loadQuickStart() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="qs-wrapper">
            <h1>HF Workbench — Quick Start Guide</h1>

            <p class="qs-intro">
                This guide gets you designing antennas in under a minute.  
                Follow the steps below to jump straight into modeling.
            </p>

            <div class="qs-steps">

                <section id="qs-step1" class="qs-step">
                    <h2>1. Choose an Antenna Module</h2>
                    <p>
                        Use the top navigation bar to select the antenna you want to design:
                    </p>
                    <ul>
                        <li><strong>Doublet</strong> — multiband dipoles, open‑wire fed systems</li>
                        <li><strong>Loop</strong> — small transmitting loops</li>
                        <li><strong>Skyloop</strong> — full‑wave horizontal loops</li>
                        <li><strong>Verticals ▼</strong> — DX, NVIS, Performer, Dominator</li>
                    </ul>
                </section>

                <section id="qs-step2" class="qs-step">
                    <h2>2. Enter Your Basic Parameters</h2>
                    <p>
                        Every module has a left‑column input panel.  
                        Enter:
                    </p>
                    <ul>
                        <li>Frequency</li>
                        <li>Height</li>
                        <li>Dimensions (leg length, loop diameter, etc.)</li>
                        <li>Environmental factors (time of day, seaside)</li>
                    </ul>
                </section>

                <section id="qs-step3" class="qs-step">
                    <h2>3. Add Optional Enhancements</h2>
                    <p>
                        Most antennas support:
                    </p>
                    <ul>
                        <li>Loading coils</li>
                        <li>Capacitance hats</li>
                        <li>Linear loading</li>
                        <li>Foldover geometry</li>
                        <li>Array spacing (verticals)</li>
                    </ul>
                </section>

                <section id="qs-step4" class="qs-step">
                    <h2>4. Click “Compute”</h2>
                    <p>
                        The Boost Engine calculates:
                    </p>
                    <ul>
                        <li>DX Boost</li>
                        <li>NVIS Boost</li>
                        <li>TOA shift</li>
                        <li>Efficiency</li>
                        <li>F/B and F/S ratios</li>
                        <li>Electrical height</li>
                    </ul>
                </section>

                <section id="qs-step5" class="qs-step">
                    <h2>5. Review Automatic Plots</h2>
                    <p>
                        The Plot Engine generates:
                    </p>
                    <ul>
                        <li>Elevation pattern</li>
                        <li>Azimuth pattern</li>
                        <li>Gain across band</li>
                        <li>SWR across band</li>
                        <li>ERP across band</li>
                    </ul>
                </section>

                <section id="qs-step6" class="qs-step">
                    <h2>6. Adjust and Recompute</h2>
                    <p>
                        Change any parameter and click <strong>Compute</strong> again.  
                        The Workbench updates instantly.
                    </p>
                </section>

                <section id="qs-step7" class="qs-step">
                    <h2>7. Explore Advanced Modules</h2>
                    <p>
                        Once you're comfortable, try:
                    </p>
                    <ul>
                        <li><strong>Performer Vertical</strong> — high‑efficiency engineered vertical</li>
                        <li><strong>Dominator Array</strong> — multi‑element phased vertical system</li>
                    </ul>
                </section>

            </div>
        </section>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash === "#quick-start") {
        loadQuickStart();
    }
});

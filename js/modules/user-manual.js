// /HF-Workbench/js/modules/user-manual.js
// Full User Manual module for HF Workbench

export function loadUserManual() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="manual-wrapper">
            <h1>HF Workbench — User Manual</h1>

            <nav class="manual-nav">
                <a href="#um-overview">Overview</a>
                <a href="#um-navigation">Navigation</a>
                <a href="#um-antennas">Antenna Modules</a>
                <a href="#um-boost">Boost Engine</a>
                <a href="#um-plots">Plot Engine</a>
                <a href="#um-verticals">Vertical Systems</a>
                <a href="#um-doublet">Doublet Systems</a>
                <a href="#um-loops">Loop Systems</a>
                <a href="#um-troubleshooting">Troubleshooting</a>
            </nav>

            <article class="manual-content">

                <section id="um-overview">
                    <h2>Overview</h2>
                    <p>
                        HF Workbench is a modular antenna engineering suite designed for rapid modeling,
                        performance estimation, and system optimization. Each module provides a focused
                        design environment for a specific antenna class, supported by the Boost Engine
                        and Plot Engine.
                    </p>
                </section>

                <section id="um-navigation">
                    <h2>Navigation</h2>
                    <p>
                        The top navigation bar provides access to all major tools and help resources.
                        Antenna modules appear on the right side, while documentation appears on the left.
                    </p>
                </section>

                <section id="um-antennas">
                    <h2>Antenna Modules</h2>
                    <p>
                        Each antenna module includes:
                    </p>
                    <ul>
                        <li>Input panel (left column)</li>
                        <li>Results table (right column)</li>
                        <li>Automatic plots (below results)</li>
                        <li>Boost Engine integration</li>
                    </ul>
                </section>

                <section id="um-boost">
                    <h2>Boost Engine</h2>
                    <p>
                        The Boost Engine computes performance modifiers based on:
                    </p>
                    <ul>
                        <li>Height and electrical length</li>
                        <li>Loading coil configuration</li>
                        <li>Capacitance hat size</li>
                        <li>Linear loading style</li>
                        <li>Foldover angle</li>
                        <li>Array geometry</li>
                        <li>Environmental factors (time of day, seaside proximity)</li>
                    </ul>
                </section>

                <section id="um-plots">
                    <h2>Plot Engine</h2>
                    <p>
                        The Plot Engine automatically generates:
                    </p>
                    <ul>
                        <li>Elevation pattern</li>
                        <li>Azimuth pattern</li>
                        <li>Gain across band</li>
                        <li>SWR across band</li>
                        <li>ERP across band</li>
                    </ul>
                </section>

                <section id="um-verticals">
                    <h2>Vertical Systems</h2>
                    <p>
                        The Verticals category includes:
                    </p>
                    <ul>
                        <li>Vertical DX Designer</li>
                        <li>Vertical NVIS Designer</li>
                        <li>Performer Vertical</li>
                        <li>Dominator Array</li>
                    </ul>
                </section>

                <section id="um-doublet">
                    <h2>Doublet Systems</h2>
                    <p>
                        The Doublet Designer supports:
                    </p>
                    <ul>
                        <li>Multiband doublets</li>
                        <li>Fan dipoles</li>
                        <li>Open-wire fed systems</li>
                    </ul>
                </section>

                <section id="um-loops">
                    <h2>Loop Systems</h2>
                    <p>
                        Loop modules include:
                    </p>
                    <ul>
                        <li>Small transmitting loops</li>
                        <li>Skyloops / full-wave loops</li>
                    </ul>
                </section>

                <section id="um-troubleshooting">
                    <h2>Troubleshooting</h2>
                    <p>
                        If a module does not load:
                    </p>
                    <ul>
                        <li>Check the browser console for missing file paths</li>
                        <li>Ensure all modules are placed in /js/modules/</li>
                        <li>Verify that workbench-loader.js includes the correct route</li>
                    </ul>
                </section>

            </article>
        </section>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash === "#user-manual") {
        loadUserManual();
    }
});

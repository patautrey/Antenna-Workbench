// /HF-Workbench/js/modules/glossary.js
// Full Glossary module for HF Workbench

export function loadGlossary() {
    const container = document.querySelector("#content");
    if (!container) return;

    container.innerHTML = `
        <section class="glossary-wrapper">
            <h1>HF Workbench — Glossary</h1>

            <p class="glossary-intro">
                A reference list of common HF engineering terms used throughout the Workbench.
            </p>

            <nav class="glossary-nav">
                <a href="#g-A">A</a>
                <a href="#g-B">B</a>
                <a href="#g-C">C</a>
                <a href="#g-D">D</a>
                <a href="#g-E">E</a>
                <a href="#g-F">F</a>
                <a href="#g-G">G</a>
                <a href="#g-H">H</a>
                <a href="#g-I">I</a>
                <a href="#g-L">L</a>
                <a href="#g-N">N</a>
                <a href="#g-R">R</a>
                <a href="#g-S">S</a>
                <a href="#g-T">T</a>
            </nav>

            <article class="glossary-content">

                <section id="g-A">
                    <h2>A</h2>
                    <dl>
                        <dt>Antenna Efficiency</dt>
                        <dd>Ratio of radiated power to total input power, accounting for losses.</dd>

                        <dt>Aperture</dt>
                        <dd>Effective area of an antenna that captures RF energy.</dd>

                        <dt>Azimuth Pattern</dt>
                        <dd>Horizontal-plane radiation pattern showing gain vs direction.</dd>
                    </dl>
                </section>

                <section id="g-B">
                    <h2>B</h2>
                    <dl>
                        <dt>Bandwidth</dt>
                        <dd>Range of frequencies over which the antenna performs acceptably.</dd>

                        <dt>Base Loading</dt>
                        <dd>Placing a loading coil at the base of a shortened vertical.</dd>

                        <dt>Boost Engine</dt>
                        <dd>Workbench subsystem that computes performance modifiers.</dd>
                    </dl>
                </section>

                <section id="g-C">
                    <h2>C</h2>
                    <dl>
                        <dt>Capacitance Hat</dt>
                        <dd>Top-loading structure that increases electrical height.</dd>

                        <dt>Common-Mode Current</dt>
                        <dd>Unwanted current flowing on the outside of feedline conductors.</dd>

                        <dt>Current Maximum</dt>
                        <dd>Point along an antenna where RF current is highest.</dd>
                    </dl>
                </section>

                <section id="g-D">
                    <h2>D</h2>
                    <dl>
                        <dt>Director</dt>
                        <dd>Element placed ahead of a driven element to increase forward gain.</dd>

                        <dt>Doublet</dt>
                        <dd>Center-fed dipole used across multiple bands with a tuner.</dd>

                        <dt>Dominator</dt>
                        <dd>Workbench vertical array module supporting multi-element phasing.</dd>
                    </dl>
                </section>

                <section id="g-E">
                    <h2>E</h2>
                    <dl>
                        <dt>Elevation Pattern</dt>
                        <dd>Vertical-plane radiation pattern showing gain vs elevation angle.</dd>

                        <dt>ERP (Effective Radiated Power)</dt>
                        <dd>Transmitter power multiplied by antenna gain and system efficiency.</dd>

                        <dt>Electrical Length</dt>
                        <dd>Physical length expressed as a fraction of wavelength.</dd>
                    </dl>
                </section>

                <section id="g-F">
                    <h2>F</h2>
                    <dl>
                        <dt>F/B Ratio</dt>
                        <dd>Front-to-back ratio; difference in gain between forward and rear directions.</dd>

                        <dt>F/S Ratio</dt>
                        <dd>Front-to-side ratio; difference in gain between forward and side directions.</dd>

                        <dt>Foldover</dt>
                        <dd>Intentional bending of an antenna element to reduce height.</dd>
                    </dl>
                </section>

                <section id="g-G">
                    <h2>G</h2>
                    <dl>
                        <dt>Gain</dt>
                        <dd>Increase in signal strength in a given direction compared to isotropic.</dd>

                        <dt>Ground Loss</dt>
                        <dd>Power lost due to imperfect earth conductivity.</dd>
                    </dl>
                </section>

                <section id="g-H">
                    <h2>H</h2>
                    <dl>
                        <dt>Height Fraction</dt>
                        <dd>Antenna height expressed in wavelengths.</dd>

                        <dt>High Angle Radiation</dt>
                        <dd>Radiation at steep elevation angles, useful for NVIS.</dd>
                    </dl>
                </section>

                <section id="g-I">
                    <h2>I</h2>
                    <dl>
                        <dt>Impedance</dt>
                        <dd>Opposition to AC current flow, measured in ohms.</dd>

                        <dt>Isotropic Radiator</dt>
                        <dd>Theoretical antenna radiating equally in all directions.</dd>
                    </dl>
                </section>

                <section id="g-L">
                    <h2>L</h2>
                    <dl>
                        <dt>Loading Coil</dt>
                        <dd>Inductor used to electrically lengthen a short antenna.</dd>

                        <dt>Loop Antenna</dt>
                        <dd>Antenna formed by a closed loop of wire.</dd>
                    </dl>
                </section>

                <section id="g-N">
                    <h2>N</h2>
                    <dl>
                        <dt>NVIS</dt>
                        <dd>Near Vertical Incidence Skywave; high-angle HF propagation.</dd>

                        <dt>Noise Floor</dt>
                        <dd>Background RF noise level at the receiver.</dd>
                    </dl>
                </section>

                <section id="g-R">
                    <h2>R</h2>
                    <dl>
                        <dt>Radial System</dt>
                        <dd>Ground wires used to reduce earth losses in vertical antennas.</dd>

                        <dt>Resonance</dt>
                        <dd>Frequency where reactance is zero and impedance is purely resistive.</dd>
                    </dl>
                </section>

                <section id="g-S">
                    <h2>S</h2>
                    <dl>
                        <dt>SWR</dt>
                        <dd>Standing Wave Ratio; measure of feedline mismatch.</dd>

                        <dt>Skyloop</dt>
                        <dd>Large horizontal loop antenna, typically full-wave or larger.</dd>

                        <dt>Supergain</dt>
                        <dd>Array configuration achieving gain beyond simple element addition.</dd>
                    </dl>
                </section>

                <section id="g-T">
                    <h2>T</h2>
                    <dl>
                        <dt>TOA (Takeoff Angle)</dt>
                        <dd>Elevation angle where maximum radiation occurs.</dd>

                        <dt>Tuner</dt>
                        <dd>Device that matches antenna impedance to transmitter output.</dd>
                    </dl>
                </section>

            </article>
        </section>
    `;
}

document.addEventListener("DOMContentLoaded", () => {
    if (window.location.hash === "#glossary") {
        loadGlossary();
    }
});

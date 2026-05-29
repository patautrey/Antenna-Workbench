/* ---------------------------------------------------------
   Antenna Workbench — DOM Helper Library
   Safe element creation, query helpers, and UI utilities
--------------------------------------------------------- */

/* ---------------------------------------------------------
   BASIC SELECTORS
--------------------------------------------------------- */

export function $(selector, root = document) {
    return root.querySelector(selector);
}

export function $all(selector, root = document) {
    return Array.from(root.querySelectorAll(selector));
}

/* ---------------------------------------------------------
   ELEMENT CREATION
--------------------------------------------------------- */

export function el(tag, className = null, html = null) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== null) node.innerHTML = html;
    return node;
}

/* ---------------------------------------------------------
   CLEAR ELEMENT CONTENT
--------------------------------------------------------- */

export function clear(node) {
    while (node.firstChild) {
        node.removeChild(node.firstChild);
    }
}

/* ---------------------------------------------------------
   APPEND MULTIPLE CHILDREN
--------------------------------------------------------- */

export function append(node, ...children) {
    children.forEach(child => {
        if (child) node.appendChild(child);
    });
    return node;
}

/* ---------------------------------------------------------
   BUILD A TABLE FROM ROW DATA
--------------------------------------------------------- */

export function buildTable(headers = [], rows = []) {
    const table = el("table");
    const thead = el("thead");
    const tbody = el("tbody");

    // Header row
    const trHead = el("tr");
    headers.forEach(h => {
        trHead.appendChild(el("th", null, h));
    });
    thead.appendChild(trHead);

    // Body rows
    rows.forEach(row => {
        const tr = el("tr");
        row.forEach(cell => {
            tr.appendChild(el("td", null, cell));
        });
        tbody.appendChild(tr);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    return table;
}

/* ---------------------------------------------------------
   SET HTML SAFELY
--------------------------------------------------------- */

export function setHTML(node, html) {
    node.innerHTML = html;
}

/* ---------------------------------------------------------
   CREATE LAB PANEL (TITLE + BODY)
--------------------------------------------------------- */

export function createPanel(title, bodyHTML = "") {
    const panel = el("div", "panel");
    const h = el("h3", null, title);
    const body = el("div", "panel-body", bodyHTML);
    append(panel, h, body);
    return panel;
}

/* ---------------------------------------------------------
   CREATE INFO BOX
--------------------------------------------------------- */

export function infoBox(text) {
    const box = el("div", "info-box");
    box.innerHTML = text;
    return box;
}

/* ---------------------------------------------------------
   CREATE WARNING BOX
--------------------------------------------------------- */

export function warnBox(text) {
    const box = el("div", "warn-box");
    box.innerHTML = text;
    return box;
}

/* ---------------------------------------------------------
   CREATE SUCCESS BOX
--------------------------------------------------------- */

export function successBox(text) {
    const box = el("div", "success-box");
    box.innerHTML = text;
    return box;
}

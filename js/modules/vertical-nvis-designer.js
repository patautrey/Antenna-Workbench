<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>HF Workbench</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="./css/workbench.css">
</head>

<body>

    <!-- ============================
         TOP NAVIGATION BAR
    ============================= -->
    <header class="topnav">

        <a href="#home" class="nav-item">Home</a>
        <a href="#doublet" class="nav-item">Doublet</a>
        <a href="#loop" class="nav-item">Loop</a>
        <a href="#skyloop" class="nav-item">Skyloop</a>

        <!-- Verticals Dropdown -->
        <div class="dropdown">
            <button class="dropdown-btn">Verticals ▼</button>
            <div class="dropdown-content">
                <a href="#vertical-dx">Vertical DX Designer</a>
                <a href="#vertical-nvis">Vertical NVIS Designer</a>
                <a href="#performer">Performer Vertical</a>
                <a href="#dominator">Dominator Array</a>
            </div>
        </div>

        <!-- Help Dropdown -->
        <div class="dropdown">
            <button class="dropdown-btn">Help ▼</button>
            <div class="dropdown-content">
                <a href="#user-manual">User Manual</a>
                <a href="#quick-start">Quick Start</a>
                <a href="#glossary">Glossary</a>
            </div>
        </div>

    </header>

    <!-- ============================
         MAIN RENDER TARGET
         (This is the missing piece)
    ============================= -->
    <main>
        <div id="content"></div>
    </main>

    <!-- ============================
         SCRIPT LOADER
    ============================= -->
    <script type="module" src="./js/workbench-loader.js"></script>

</body>
</html>

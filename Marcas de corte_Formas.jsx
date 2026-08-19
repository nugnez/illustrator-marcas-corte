#target illustrator

function main() {
    if (app.documents.length === 0) {
        alert("Por favor, abre un documento en Illustrator.");
        return;
    }

    var doc = app.activeDocument;
    var selection = doc.selection;

    if (!selection || selection.length === 0) {
        alert("Por favor, selecciona al menos una forma o trazado.");
        return;
    }

    var mmToPt = 2.83464567;

    // Ventana gráfica
    var dialog = new Window("dialog", "Marcas de Corte y Puntos Guía (Corregido)");
    dialog.orientation = "column";
    dialog.alignChildren = ["fill", "top"];

    var panel = dialog.add("panel", undefined, "Parámetros de las Marcas");
    panel.orientation = "column";
    panel.alignChildren = ["left", "top"];
    panel.spacing = 10;
    panel.margins = 15;

    function addInput(parent, labelText, defaultValue) {
        var group = parent.add("group");
        group.orientation = "row";
        var label = group.add("statictext", undefined, labelText);
        label.preferredSize.width = 180;
        var input = group.add("edittext", undefined, defaultValue);
        input.preferredSize.width = 60;
        return input;
    }

    var inputLength = addInput(panel, "Longitud de marca (mm):", "5");
    var inputOffset = addInput(panel, "Separación / Sangrado (mm):", "3");
    var inputStroke = addInput(panel, "Grosor de línea (pt):", "0.25");
    var inputDotSize = addInput(panel, "Diámetro del punto guía (mm):", "0.3");

    var btnGroup = dialog.add("group");
    btnGroup.alignment = "right";
    btnGroup.add("button", undefined, "Cancelar", {name: "cancel"});
    btnGroup.add("button", undefined, "Generar", {name: "ok"});

    if (dialog.show() !== 1) return;

    var lengthPt = parseFloat(inputLength.text) * mmToPt;
    var offsetPt = parseFloat(inputOffset.text) * mmToPt;
    var strokePt = parseFloat(inputStroke.text);
    var dotRadiusPt = (parseFloat(inputDotSize.text) * mmToPt) / 2;

    if (isNaN(lengthPt) || isNaN(offsetPt) || isNaN(strokePt) || isNaN(dotRadiusPt)) {
        alert("Por favor, introduce valores numéricos válidos.");
        return;
    }

    var regColor;
    try {
        regColor = doc.swatches.getByName("[Registration]").color;
    } catch (e) {
        try {
            regColor = doc.swatches.getByName("Registro").color;
        } catch (err) {
            var cmyk = new CMYKColor();
            cmyk.cyan = 100; cmyk.magenta = 100; cmyk.yellow = 100; cmyk.black = 100;
            regColor = cmyk;
        }
    }

    var layerName = "Líneas de Corte";
    var cropLayer;
    try {
        cropLayer = doc.layers.getByName(layerName);
    } catch (e) {
        cropLayer = doc.layers.add();
        cropLayer.name = layerName;
    }

    var pathItemsToProcess = [];
    collectPathItems(selection, pathItemsToProcess);

    for (var i = 0; i < pathItemsToProcess.length; i++) {
        var item = pathItemsToProcess[i];
        var points = item.pathPoints;
        var len = points.length;

        if (len < 3) continue;

        var marksGroup = cropLayer.groupItems.add();
        marksGroup.name = "Marcas_Forma_" + (i + 1);

        var dotColor = getDarkenedColor(item.fillColor);

        // Calcular la orientación general del polígono (Clockwise vs Counter-Clockwise)
        var isClockwise = getPolygonOrientation(points);

        for (var j = 0; j < len; j++) {
            var pPrev = points[(j - 1 + len) % len].anchor;
            var pCurr = points[j].anchor;
            var pNext = points[(j + 1) % len].anchor;

            var isConvex = checkIsConvex(pPrev, pCurr, pNext, isClockwise);

            if (!isConvex) {
                // VÉRTICE CÓNCAVO (Interior / Entrada): Crear punto guía
                var circle = marksGroup.pathItems.ellipse(
                    pCurr[1] + dotRadiusPt,
                    pCurr[0] - dotRadiusPt,
                    dotRadiusPt * 2,
                    dotRadiusPt * 2
                );
                circle.filled = true;
                circle.fillColor = dotColor;
                circle.stroked = false;
            } else {
                // VÉRTICE CONVEXO (Exterior / Saliente): Crear marcas de corte rectas
                var vPrev = [pCurr[0] - pPrev[0], pCurr[1] - pPrev[1]];
                var lenPrev = Math.sqrt(vPrev[0] * vPrev[0] + vPrev[1] * vPrev[1]);

                var vNext = [pNext[0] - pCurr[0], pNext[1] - pCurr[1]];
                var lenNext = Math.sqrt(vNext[0] * vNext[0] + vNext[1] * vNext[1]);

                if (lenPrev > 0) {
                    var uPrev = [vPrev[0] / lenPrev, vPrev[1] / lenPrev];
                    var start1 = [pCurr[0] + uPrev[0] * offsetPt, pCurr[1] + uPrev[1] * offsetPt];
                    var end1 = [pCurr[0] + uPrev[0] * (offsetPt + lengthPt), pCurr[1] + uPrev[1] * (offsetPt + lengthPt)];

                    createLine(marksGroup, start1, end1, regColor, strokePt);
                }

                if (lenNext > 0) {
                    var uNext = [vNext[0] / lenNext, vNext[1] / lenNext];
                    var start2 = [pCurr[0] - uNext[0] * offsetPt, pCurr[1] - uNext[1] * offsetPt];
                    var end2 = [pCurr[0] - uNext[0] * (offsetPt + lengthPt), pCurr[1] - uNext[1] * (offsetPt + lengthPt)];

                    createLine(marksGroup, start2, end2, regColor, strokePt);
                }
            }
        }
    }

    app.redraw();
}

// Determina el sentido global del trazado (Shoelace Formula)
function getPolygonOrientation(points) {
    var area = 0;
    var len = points.length;
    for (var i = 0; i < len; i++) {
        var p1 = points[i].anchor;
        var p2 = points[(i + 1) % len].anchor;
        area += (p2[0] - p1[0]) * (p2[1] + p1[1]);
    }
    return area > 0; // True si es Clockwise, False si es Counter-Clockwise (en sistema de coordenadas AI)
}

// Comprueba la convexidad ajustada a la orientación real de la forma
function checkIsConvex(pPrev, pCurr, pNext, isClockwise) {
    var crossProduct = (pCurr[0] - pPrev[0]) * (pNext[1] - pCurr[1]) - (pCurr[1] - pPrev[1]) * (pNext[0] - pCurr[0]);
    return isClockwise ? (crossProduct <= 0) : (crossProduct >= 0);
}

function getDarkenedColor(originalColor) {
    if (originalColor.typename === "CMYKColor") {
        var cmyk = new CMYKColor();
        cmyk.cyan = Math.min(100, originalColor.cyan * 1.2);
        cmyk.magenta = Math.min(100, originalColor.magenta * 1.2);
        cmyk.yellow = Math.min(100, originalColor.yellow * 1.2);
        cmyk.black = Math.min(100, originalColor.black + 30);
        return cmyk;
    } else if (originalColor.typename === "RGBColor") {
        var rgb = new RGBColor();
        rgb.red = Math.max(0, originalColor.red * 0.65);
        rgb.green = Math.max(0, originalColor.green * 0.65);
        rgb.blue = Math.max(0, originalColor.blue * 0.65);
        return rgb;
    } else if (originalColor.typename === "GrayColor") {
        var gray = new GrayColor();
        gray.gray = Math.min(100, originalColor.gray + 30);
        return gray;
    }
    
    var fallback = new CMYKColor();
    fallback.cyan = 0; fallback.magenta = 0; fallback.yellow = 0; fallback.black = 40;
    return fallback;
}

function createLine(group, startPt, endPt, color, strokeWidth) {
    var line = group.pathItems.add();
    line.setEntirePath([startPt, endPt]);
    line.stroked = true;
    line.strokeColor = color;
    line.strokeWidth = strokeWidth;
    line.filled = false;
}

function collectPathItems(items, resultList) {
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        if (item.typename === "PathItem") {
            resultList.push(item);
        } else if (item.typename === "GroupItem") {
            collectPathItems(item.pageItems, resultList);
        } else if (item.typename === "CompoundPathItem") {
            collectPathItems(item.pathItems, resultList);
        }
    }
}

main();
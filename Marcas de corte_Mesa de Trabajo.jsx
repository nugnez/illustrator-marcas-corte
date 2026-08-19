#target illustrator

function main() {
    if (app.documents.length === 0) {
        alert("Por favor, abre un documento en Illustrator.");
        return;
    }

    var doc = app.activeDocument;
    var activeArtboard = doc.artboards[doc.artboards.getActiveArtboardIndex()];

    // Conversión de mm a puntos (1 mm = 2.83464567 pt)
    var mmToPt = 2.83464567;

    // Crear ventana gráfica (ScriptUI)
    var dialog = new Window("dialog", "Generador de Líneas de Corte");
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

    var groupCheck = panel.add("group");
    var checkAllArtboards = groupCheck.add("checkbox", undefined, "Aplicar a TODAS las mesas de trabajo");
    checkAllArtboards.value = false;

    var btnGroup = dialog.add("group");
    btnGroup.alignment = "right";
    btnGroup.add("button", undefined, "Cancelar", {name: "cancel"});
    btnGroup.add("button", undefined, "Generar", {name: "ok"});

    if (dialog.show() !== 1) return;

    var lengthPt = parseFloat(inputLength.text) * mmToPt;
    var offsetPt = parseFloat(inputOffset.text) * mmToPt;
    var strokePt = parseFloat(inputStroke.text);

    if (isNaN(lengthPt) || isNaN(offsetPt) || isNaN(strokePt)) {
        alert("Por favor, introduce valores numéricos válidos.");
        return;
    }

    // Color de registro (Registration)
    var regColor;
    try {
        regColor = doc.swatches.getByName("[Registration]").color;
    } catch (e) {
        try {
            regColor = doc.swatches.getByName("Registro").color;
        } catch (err) {
            var cmyk = new CMYKColor();
            cmyk.cyan = 0; cmyk.magenta = 0; cmyk.yellow = 0; cmyk.black = 100;
            regColor = cmyk;
        }
    }

    // Crear o seleccionar capa dedicada
    var layerName = "Líneas de Corte";
    var cropLayer;
    try {
        cropLayer = doc.layers.getByName(layerName);
    } catch (e) {
        cropLayer = doc.layers.add();
        cropLayer.name = layerName;
    }

    var artboardsToProcess = [];
    if (checkAllArtboards.value) {
        for (var i = 0; i < doc.artboards.length; i++) {
            artboardsToProcess.push(doc.artboards[i]);
        }
    } else {
        artboardsToProcess.push(activeArtboard);
    }

    for (var a = 0; a < artboardsToProcess.length; a++) {
        var abRect = artboardsToProcess[a].artboardRect;
        var L = abRect[0];
        var T = abRect[1];
        var R = abRect[2];
        var B = abRect[3];

        // Definir los 8 segmentos de corte alrededor del límite de la mesa
        var lines = [
            // Esquina Superior Izquierda
            [[L, T + offsetPt], [L, T + offsetPt + lengthPt]],
            [[L - offsetPt, T], [L - offsetPt - lengthPt, T]],

            // Esquina Superior Derecha
            [[R, T + offsetPt], [R, T + offsetPt + lengthPt]],
            [[R + offsetPt, T], [R + offsetPt + lengthPt, T]],

            // Esquina Inferior Izquierda
            [[L, B - offsetPt], [L, B - offsetPt - lengthPt]],
            [[L - offsetPt, B], [L - offsetPt - lengthPt, B]],

            // Esquina Inferior Derecha
            [[R, B - offsetPt], [R, B - offsetPt - lengthPt]],
            [[R + offsetPt, B], [R + offsetPt + lengthPt, B]]
        ];

        var group = cropLayer.groupItems.add();
        group.name = "Marcas_Mesa_" + (a + 1);

        for (var k = 0; k < lines.length; k++) {
            var line = group.pathItems.add();
            line.setEntirePath(lines[k]);
            line.stroked = true;
            line.strokeColor = regColor;
            line.strokeWidth = strokePt;
            line.filled = false;
        }
    }

    app.redraw();
}

main();
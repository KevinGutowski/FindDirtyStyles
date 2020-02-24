import sketch from 'sketch'
// documentation: https://developer.sketchapp.com/reference/api/

export default function() {
    let sketch = require('sketch')
    let UI = sketch.UI
    let doc = sketch.getSelectedDocument()
    let sharedTextStyles = doc.sharedTextStyles

    let dirtyLayerSkipped

    for (const sharedStyle of sharedTextStyles) {
        const layers = sharedStyle.getAllInstancesLayers()

        for (const layer of layers) {
            let isOutOfSync = layer.style.isOutOfSyncWithSharedStyle(sharedStyle)

            if (isOutOfSync) {
                if (doc.selectedLayers.length != 0) {
                    if (layer.id != doc.selectedLayers.layers[0].id) {
                        UI.message("💩 Dirty style found");
                        zoomToLayer(layer)
                        return
                    } else {
                        dirtyLayerSkipped = layer
                    }
                } else {
                    UI.message("💩 Dirty style found");
                    zoomToLayer(layer)
                    return
                }
            }
        }
    }

    if (dirtyLayerSkipped) {
        UI.message("💩 Dirty style found");
        zoomToLayer(dirtyLayerSkipped)
        return
    } else {
        UI.message("✨ Shared text styles all clean: No out of sync layers found");
    }

    function zoomToLayer(layer) {
        let page = layer.getParentPage()
        doc.selectedPage = page
        doc.selectedLayers.clear()
        layer.selected = true;
        doc.sketchObject.eventHandlerManager().currentHandler().zoomToSelection()
    }
}

import sketch from 'sketch'
// documentation: https://developer.sketchapp.com/reference/api/

export default function() {
  let sketch = require('sketch')
  let UI = sketch.UI
  let doc = sketch.getSelectedDocument()
  let sharedTextStyles = doc.sharedTextStyles

  for (const sharedStyle of sharedTextStyles) {
    const layers = sharedStyle.getAllInstancesLayers()

    for (const layer of layers) {
      let isOutOfSync = layer.style.isOutOfSyncWithSharedStyle(sharedStyle)

      if (isOutOfSync) {
        zoomToLayer(layer)
        UI.message("💩 Dirty style found");
        return
      }
    }
  }

  UI.message("✨ Shared text styles all clean: No out of sync layers found");

  function zoomToLayer(layer) {
    doc.selectedLayers = [];
    layer.selected = true;
    doc.sketchObject.eventHandlerManager().currentHandler().zoomToSelection()
  }
}

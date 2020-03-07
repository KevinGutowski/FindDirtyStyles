import sketch from 'sketch'
let Settings = sketch.Settings
// documentation: https://developer.sketchapp.com/reference/api/

let UI = sketch.UI
let doc = sketch.getSelectedDocument()

export function findDirtyTextStyles() {
    let sharedTextStyles = doc.sharedTextStyles
    let firstLayerSkipped
    let previouslyFound
    if (Settings.sessionVariable('dirtyTextLayerIDs')) {
        previouslyFound = Settings.sessionVariable('dirtyTextLayerIDs')
    } else {
        previouslyFound = []
    }

    for (const sharedStyle of sharedTextStyles) {
        let layers = sharedStyle.getAllInstancesLayers()

        if (Settings.settingForKey('limitToCurrentPage')) {
            layers = layers.filter(layer => layer.getParentPage().id == doc.selectedPage.id)
        }

        for (const layer of layers) {

            if (previouslyFound.includes(layer.id)) {
                if (!firstLayerSkipped) {
                    firstLayerSkipped = layer
                }
                continue;
            }

            let isOutOfSync = layer.style.isOutOfSyncWithSharedStyle(sharedStyle)
            if (isOutOfSync) {
                previouslyFound.push(layer.id)
                Settings.setSessionVariable('dirtyTextLayerIDs', previouslyFound)
                UI.message("💩 Dirty text style found");
                zoomToLayer(layer)
                return
            }
        }
    }

    if (firstLayerSkipped) {
        Settings.setSessionVariable('dirtyTextLayerIDs', [firstLayerSkipped.id])
        UI.message("💩 Dirty text style found (Back to top)");
        zoomToLayer(firstLayerSkipped)
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

export function findDirtyLayerStyles() {
    let sharedLayerStyles = doc.sharedLayerStyles
    let firstLayerSkipped
    let previouslyFound
    if (Settings.sessionVariable('dirtyLayerIDs')) {
        previouslyFound = Settings.sessionVariable('dirtyLayerIDs')
    } else {
        previouslyFound = []
    }

    for (const sharedStyle of sharedLayerStyles) {
        let layers = sharedStyle.getAllInstancesLayers()

        if (Settings.settingForKey('limitToCurrentPage')) {
            layers = layers.filter(layer => layer.getParentPage().id == doc.selectedPage.id)
        }

        for (const layer of layers) {

            if (previouslyFound.includes(layer.id)) {
                if (!firstLayerSkipped) {
                    firstLayerSkipped = layer
                }
                continue;
            }

            let isOutOfSync = layer.style.isOutOfSyncWithSharedStyle(sharedStyle)
            if (isOutOfSync) {
                previouslyFound.push(layer.id)
                Settings.setSessionVariable('dirtyLayerIDs', previouslyFound)
                UI.message("💩 Dirty layer style found");
                zoomToLayer(layer)
                return
            }
        }
    }

    if (firstLayerSkipped) {
        Settings.setSessionVariable('dirtyLayerIDs', [firstLayerSkipped.id])
        UI.message("💩 Dirty layer style found (Back to top)");
        zoomToLayer(firstLayerSkipped)
        return
    } else {
        UI.message("✨ Shared layer styles all clean: No out of sync layers found");
    }

    function zoomToLayer(layer) {
        let page = layer.getParentPage()
        doc.selectedPage = page
        doc.selectedLayers.clear()
        layer.selected = true;
        doc.sketchObject.eventHandlerManager().currentHandler().zoomToSelection()
    }
}

export function toggleCurrentPageSetting() {
    let limitToCurrentPageMenuItem = getMenuItem()

    if (limitToCurrentPageMenuItem.state() == NSControlStateValueOff) {
        Settings.setSettingForKey('limitToCurrentPage', true)
        limitToCurrentPageMenuItem.state = NSControlStateValueOn
    } else {
        Settings.setSettingForKey('limitToCurrentPage', false)
        limitToCurrentPageMenuItem.state = NSControlStateValueOff
    }
}

export function onStartup() {
    let limitToCurrentPageSetting = Settings.settingForKey('limitToCurrentPage')
    let limitToCurrentPageMenuItem = getMenuItem()

    if (limitToCurrentPageSetting) {
        limitToCurrentPageMenuItem.state = NSControlStateValueOn
    } else {
        limitToCurrentPageMenuItem.state = NSControlStateValueOff
    }
}

function getMenuItem() {
    let menu = NSApplication.sharedApplication().mainMenu()
    let pluginsMenu = menu.itemWithTitle('Plugins').submenu()
    let dirtyStylesMenu = pluginsMenu.itemWithTitle('Find Dirty Styles').submenu()
    let limitToCurrentPageMenuItem = dirtyStylesMenu.itemWithTitle('Limit to current page')
    return limitToCurrentPageMenuItem
}

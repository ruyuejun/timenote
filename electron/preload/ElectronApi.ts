import { ipcRenderer, contextBridge } from 'electron'

export const initElectronApi = () => {
    contextBridge.exposeInMainWorld('electron', {
        platform: process.platform,
        versions: {
            node: process.versions.node,
            chrome: process.versions.chrome,
            electron: process.versions.electron,
        },
        openDirectoryDialog: () => ipcRenderer.invoke('open-directory-dialog'),
        readDirectory: (dirPath: string) => ipcRenderer.invoke('read-directory', dirPath),
        readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
        writeFile: (filePath: string, content: string) => ipcRenderer.invoke('write-file', filePath, content),
    })
}

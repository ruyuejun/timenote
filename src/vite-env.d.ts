/// <reference types="svelte" />
/// <reference types="vite/client" />

interface FileSystemItem {
    name: string
    path: string
    isDirectory: boolean
    size: number
    modified: number
}

interface Window {
    electronAPI: {
        platform: NodeJS.Platform
        versions: {
            node: string
            chrome: string
            electron: string
        }
        openDirectoryDialog: () => Promise<string | null>
        readDirectory: (dirPath: string) => Promise<FileSystemItem[]>
    }
}

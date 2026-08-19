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
    electron: {
        platform: NodeJS.Platform
        versions: {
            node: string
            chrome: string
            electron: string
        }
        openDirectoryDialog: () => Promise<string | null>
        createDirectoryDialog: () => Promise<string | null>
        saveFileDialog: (defaultName?: string) => Promise<string | null>
        readDirectory: (dirPath: string) => Promise<FileSystemItem[]>
        readFile: (filePath: string) => Promise<string>
        writeFile: (filePath: string, content: string) => Promise<{ success: boolean }>
    }
}

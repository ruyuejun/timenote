import { writable } from 'svelte/store'

export interface LocalFile {
    path: string
    name: string
    isDirectory: boolean
}

export interface LocalDirectory {
    path: string
    name: string
    expanded: boolean
    children?: LocalFile[]
    isStandaloneFile?: boolean
}

function createLocalFilesStore() {
    const { subscribe, update } = writable<LocalDirectory[]>([])

    return {
        subscribe,
        addStandaloneFile: (filePath: string) => {
            update(directories => {
                if (directories.some(item => item.path === filePath)) {
                    return directories
                }
                const fileName = filePath.split('/').pop() || filePath
                return [...directories, {
                    path: filePath,
                    name: fileName,
                    expanded: false,
                    isStandaloneFile: true
                }]
            })
        },
        addDirectory: (path: string) => {
            update(directories => {
                if (directories.some(item => item.path === path)) {
                    return directories
                }
                return [...directories, {
                    path,
                    name: path.split('/').pop() || path,
                    expanded: false
                }]
            })
        },
        updateDirectoryChildren: async (path: string, children: LocalFile[]) => {
            update(directories => {
                return directories.map(dir => {
                    if (dir.path === path) {
                        return { ...dir, children }
                    }
                    return dir
                })
            })
        },
        toggleExpanded: async (path: string) => {
            update(directories => {
                return directories.map(dir => {
                    if (dir.path === path) {
                        return { ...dir, expanded: !dir.expanded }
                    }
                    return dir
                })
            })
        }
    }
}

export const localFilesStore = createLocalFilesStore()

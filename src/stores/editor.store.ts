import { writable } from 'svelte/store'

interface EditorState {
    filePath: string | null
    content: string
}

function createEditorStore() {
    const { subscribe, set, update } = writable<EditorState>({
        filePath: null,
        content: ''
    })

    return {
        subscribe,
        setFile: (filePath: string, content: string) => {
            set({ filePath, content })
        },
        clear: () => {
            set({ filePath: null, content: '' })
        }
    }
}

export const editorStore = createEditorStore()

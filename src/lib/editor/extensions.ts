import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'

export const extensions = [
    StarterKit,

    Underline,

    Link.configure({
        openOnClick: false,
    }),

    Placeholder.configure({
        placeholder: '请输入内容...',
    }),
]

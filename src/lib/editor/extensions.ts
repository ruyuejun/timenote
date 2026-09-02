import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyleKit } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import { ListStyle } from './list-style'

export const extensions = [
    StarterKit,

    Underline,

    TextStyleKit.configure({
        lineHeight: {
            types: ['textStyle', 'heading', 'paragraph'],
        },
    }),

    TextAlign.configure({
        types: ['heading', 'paragraph'],
    }),

    ListStyle,

    Link.configure({
        openOnClick: false,
    }),

    Placeholder.configure({
        placeholder: '请输入内容...',
    }),
]

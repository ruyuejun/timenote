import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import { Superscript, Subscript } from './script-marks'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import { TableKit } from '@tiptap/extension-table'
import Placeholder from '@tiptap/extension-placeholder'
import { TextStyleKit } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import { ListStyle } from './list-style'

export const extensions = [
    StarterKit,

    Underline,
    Superscript,
    Subscript,

    TextStyleKit.configure({
        lineHeight: {
            types: ['textStyle', 'heading', 'paragraph'],
        },
    }),

    TextAlign.configure({
        types: ['heading', 'paragraph'],
    }),

    ListStyle,

    Image.configure({
        allowBase64: true,
    }),

    Link.configure({
        openOnClick: false,
        autolink: true,
        defaultProtocol: 'https',
    }),

    TableKit.configure({
        table: { resizable: true },
    }),

    Placeholder.configure({
        placeholder: '请输入内容...',
    }),
]

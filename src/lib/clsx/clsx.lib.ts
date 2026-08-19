import { twMerge } from 'tailwind-merge'

export type ClassValue =
    | string
    | number
    | bigint
    | boolean
    | null
    | undefined
    | ClassValue[]
    | { [key: string]: boolean | null | undefined }

function toClassName(value: ClassValue): string {
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'bigint') {
        return String(value)
    }

    if (typeof value === 'boolean' || value === null || value === undefined) {
        return ''
    }

    if (Array.isArray(value)) {
        return value.map(toClassName).filter(Boolean).join(' ')
    }

    if (typeof value === 'object') {
        return Object.keys(value)
            .filter(key => value[key])
            .join(' ')
    }

    return ''
}

export function clsx(...inputs: ClassValue[]): string {
    return inputs.map(toClassName).filter(Boolean).join(' ')
}

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(...inputs))
}

export type WithElementRef<T> = T & {
    ref?: any
}

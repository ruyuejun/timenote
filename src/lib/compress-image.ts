/** 将图片压缩到可上传体积，避免大图占满磁盘与文档体积膨胀 */

export type CompressImageOptions = {
	/** 最长边上限，默认 1920 */
	maxEdge?: number
	/** 初始 JPEG 质量，默认 0.82 */
	quality?: number
	/** 目标最大字节，默认约 1.2MB；超出会继续降质 */
	maxBytes?: number
	/** 输出类型，默认 image/jpeg（gif 不做压缩） */
	mimeType?: 'image/jpeg' | 'image/webp'
}

function canvasToBlob(
	canvas: HTMLCanvasElement,
	type: string,
	quality: number,
): Promise<Blob> {
	return new Promise((resolve, reject) => {
		canvas.toBlob(
			blob => {
				if (!blob) {
					reject(new Error('图片压缩失败'))
					return
				}
				resolve(blob)
			},
			type,
			quality,
		)
	})
}

function loadImage(file: File): Promise<HTMLImageElement> {
	return new Promise((resolve, reject) => {
		const url = URL.createObjectURL(file)
		const img = new Image()
		img.onload = () => {
			URL.revokeObjectURL(url)
			resolve(img)
		}
		img.onerror = () => {
			URL.revokeObjectURL(url)
			reject(new Error('无法读取图片'))
		}
		img.src = url
	})
}

function replaceExt(name: string, ext: string) {
	const base = name.replace(/\.[^./\\]+$/, '') || 'image'
	return `${base}${ext}`
}

/**
 * 前端压缩图片：限制最长边 + 质量迭代，直到体积可控。
 * gif 保持原样（避免丢动画）；非图片原样返回。
 */
export async function compressImageFile(
	file: File,
	options: CompressImageOptions = {},
): Promise<File> {
	if (!file.type.startsWith('image/')) return file
	// 动图不压，避免损坏；体积过大由调用方或后端限额拦截
	if (file.type === 'image/gif') return file

	const maxEdge = options.maxEdge ?? 1920
	const maxBytes = options.maxBytes ?? Math.floor(1.2 * 1024 * 1024)
	const mimeType = options.mimeType ?? 'image/jpeg'
	let quality = options.quality ?? 0.82

	const img = await loadImage(file)
	const scale = Math.min(1, maxEdge / Math.max(img.naturalWidth, img.naturalHeight))
	const width = Math.max(1, Math.round(img.naturalWidth * scale))
	const height = Math.max(1, Math.round(img.naturalHeight * scale))

	// 已够小且无需缩放则跳过重编码
	if (scale >= 1 && file.size <= Math.min(maxBytes, 400 * 1024)) {
		return file
	}

	const canvas = document.createElement('canvas')
	canvas.width = width
	canvas.height = height
	const ctx = canvas.getContext('2d')
	if (!ctx) throw new Error('当前环境不支持图片压缩')
	ctx.drawImage(img, 0, 0, width, height)

	let blob = await canvasToBlob(canvas, mimeType, quality)
	while (blob.size > maxBytes && quality > 0.45) {
		quality = Math.max(0.45, quality - 0.1)
		blob = await canvasToBlob(canvas, mimeType, quality)
		// 让出主线程，避免多图连续压缩卡死界面
		await new Promise<void>(resolve => setTimeout(resolve, 0))
	}

	const ext = mimeType === 'image/webp' ? '.webp' : '.jpg'
	return new File([blob], replaceExt(file.name, ext), {
		type: mimeType,
		lastModified: Date.now(),
	})
}

import { uploadImageApi } from '../api/auth'
import { compressImageFile, type CompressImageOptions } from './compress-image'

/** 编辑器插图：压到约 1920 边长 / 1.2MB 后再上传 */
export async function uploadEditorImage(file: File) {
	const compressed = await compressImageFile(file, {
		maxEdge: 1920,
		quality: 0.82,
		maxBytes: Math.floor(1.2 * 1024 * 1024),
		mimeType: 'image/jpeg',
	})
	return uploadImageApi(compressed)
}

/** 头像：更小尺寸，进一步省空间 */
export async function uploadAvatarImage(file: File, options?: CompressImageOptions) {
	const compressed = await compressImageFile(file, {
		maxEdge: 512,
		quality: 0.85,
		maxBytes: 300 * 1024,
		mimeType: 'image/jpeg',
		...options,
	})
	return uploadImageApi(compressed)
}

export interface RemoteFileItem {
    name: string
    path: string
    isDirectory: boolean
    size?: number
    modifiedTime?: string
    children?: RemoteFileItem[]
}

export const remoteSpaceMockData: RemoteFileItem[] = [
    {
        name: '项目文档',
        path: '/remote/项目文档',
        isDirectory: true,
        children: [
            {
                name: '需求文档.md',
                path: '/remote/项目文档/需求文档.md',
                isDirectory: false,
                size: 15420,
                modifiedTime: '2026-08-15 10:30:00',
            },
            {
                name: '技术方案.md',
                path: '/remote/项目文档/技术方案.md',
                isDirectory: false,
                size: 28900,
                modifiedTime: '2026-08-16 14:20:00',
            },
            {
                name: '会议记录',
                path: '/remote/项目文档/会议记录',
                isDirectory: true,
                children: [
                    {
                        name: '2026-08-01 周会.md',
                        path: '/remote/项目文档/会议记录/2026-08-01 周会.md',
                        isDirectory: false,
                        size: 5200,
                        modifiedTime: '2026-08-01 16:00:00',
                    },
                    {
                        name: '2026-08-08 周会.md',
                        path: '/remote/项目文档/会议记录/2026-08-08 周会.md',
                        isDirectory: false,
                        size: 6100,
                        modifiedTime: '2026-08-08 16:00:00',
                    },
                ],
            },
        ],
    },
    {
        name: '设计稿',
        path: '/remote/设计稿',
        isDirectory: true,
        children: [
            {
                name: 'UI设计规范.pptx',
                path: '/remote/设计稿/UI设计规范.pptx',
                isDirectory: false,
                size: 45000,
                modifiedTime: '2026-08-10 09:15:00',
            },
            {
                name: '原型图.pptx',
                path: '/remote/设计稿/原型图.pptx',
                isDirectory: false,
                size: 38000,
                modifiedTime: '2026-08-12 11:30:00',
            },
        ],
    },
    {
        name: '数据报表',
        path: '/remote/数据报表',
        isDirectory: true,
        children: [
            {
                name: '月度报告.xlsx',
                path: '/remote/数据报表/月度报告.xlsx',
                isDirectory: false,
                size: 125000,
                modifiedTime: '2026-08-01 18:00:00',
            },
            {
                name: '用户分析.xlsx',
                path: '/remote/数据报表/用户分析.xlsx',
                isDirectory: false,
                size: 98000,
                modifiedTime: '2026-08-14 10:45:00',
            },
            {
                name: '季度总结.docx',
                path: '/remote/数据报表/季度总结.docx',
                isDirectory: false,
                size: 67000,
                modifiedTime: '2026-08-17 15:20:00',
            },
        ],
    },
    {
        name: '团队资料',
        path: '/remote/团队资料',
        isDirectory: true,
        children: [
            {
                name: '团队介绍.md',
                path: '/remote/团队资料/团队介绍.md',
                isDirectory: false,
                size: 8500,
                modifiedTime: '2026-07-20 14:00:00',
            },
            {
                name: '开发指南',
                path: '/remote/团队资料/开发指南',
                isDirectory: true,
                children: [
                    {
                        name: '代码规范.md',
                        path: '/remote/团队资料/开发指南/代码规范.md',
                        isDirectory: false,
                        size: 12000,
                        modifiedTime: '2026-07-25 10:00:00',
                    },
                    {
                        name: 'Git工作流.md',
                        path: '/remote/团队资料/开发指南/Git工作流.md',
                        isDirectory: false,
                        size: 9800,
                        modifiedTime: '2026-07-26 11:30:00',
                    },
                ],
            },
        ],
    },
    {
        name: 'README.txt',
        path: '/remote/README.txt',
        isDirectory: false,
        size: 2400,
        modifiedTime: '2026-08-18 08:00:00',
    },
]

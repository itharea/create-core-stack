import type { Metadata } from 'next';

export function constructMetadata({
    title = 'create-core-stack',
    description = 'The fastest way to build production-ready mobile apps with React Native, Expo, and Node.js.',
    image = '/og-image.png',
    icons = '/favicon.ico',
    noIndex = false,
}: {
    title?: string;
    description?: string;
    image?: string;
    icons?: string;
    noIndex?: boolean;
} = {}): Metadata {
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: image,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [image],
            creator: '@itharea',
        },
        icons,
        metadataBase: new URL('https://docs.create-core-stack.dev'),
        ...(noIndex && {
            robots: {
                index: false,
                follow: false,
            },
        }),
    };
}

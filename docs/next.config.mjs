import createMDX from '@next/mdx';

const withMDX = createMDX({
    extension: /\.mdx?$/,
    options: {
        remarkPlugins: [],
        rehypePlugins: ['rehype-slug'],
    },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
    pageExtensions: ['js', 'jsx', 'ts', 'tsx', 'md', 'mdx'],
    reactStrictMode: true,
    images: {
        formats: ['image/avif', 'image/webp'],
    },
    async redirects() {
        return [
            {
                source: '/docs',
                destination: '/docs/getting-started',
                permanent: true,
            },
        ];
    },
};

export default withMDX(nextConfig);

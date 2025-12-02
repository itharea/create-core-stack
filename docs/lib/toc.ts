export type TocItem = {
    id: string;
    text: string;
    level: number;
};

export function getTableOfContents(content: string): TocItem[] {
    const regex = /^(#{2,3})\s+(.*)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
        const level = match[1].length;
        const text = match[2];
        const id = text
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');

        items.push({ id, text, level });
    }

    return items;
}

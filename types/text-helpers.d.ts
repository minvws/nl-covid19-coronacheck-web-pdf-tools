export const regular: (string | number)[];
export const bold: (string | number)[];
export function drawTextItemOverLines(doc: any, textItem: any, x: any, textAlign: any): void;
export function setFontAndWeight(doc: any, textItem: any, chunk: any): void;
export function drawTextItemWithMixedChunks(doc: any, chunks: any, textItem: any, baseX: any, baseY: any): void;
export function htmlToChunks(text: any): ({
    text: any;
    fontWeight?: undefined;
    color?: undefined;
    break?: undefined;
} | {
    text: any;
    fontWeight: number;
    color?: undefined;
    break?: undefined;
} | {
    text: any;
    color: number[];
    fontWeight?: undefined;
    break?: undefined;
} | {
    break: boolean;
    text?: undefined;
    fontWeight?: undefined;
    color?: undefined;
})[];

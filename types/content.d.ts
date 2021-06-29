export const lineHeight: 4.5;
export function getTextItems(page: Page, locale: Locale): TextItem[];
export function getImageItems(page: Page, qrSizeInCm: number): Promise<ImageItem[]>;
export function getFrames(): Frame[];
export function getLines(): Line[];
export type Page = import("./types").Page;
export type Locale = import("./types").Locale;
export type Color = [number, number, number];
export type Position = [number, number];
export type ImageItem = {
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
};
export type Line = {
    color: [number, number, number];
    x1: number;
    y1: number;
    x2: number;
    y2: number;
};
export type Frame = {
    color: Color;
    x: number;
    y: number;
    width: number;
    height: number;
    rx: number;
    ry: number;
};
export type TextItem = {
    text: string;
    fontFamily: string;
    fontWeight: number;
    position: Position;
    textAlign?: string;
    fontSize?: number;
    color?: Color;
    width?: number;
    lineHeight?: number;
    hasHTML?: boolean;
};

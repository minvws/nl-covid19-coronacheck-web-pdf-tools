export const lineHeight: 4.5;
export function getTextItems(proof: Proof, locale: Locale, createdAt: Date | number): TextItem[];
export function getImageItems(proof: Proof, qrSizeInCm: number): Promise<ImageItem[]>;
export function getFrames(territory: string): Frame[];
export function getLines(): Line[];
export type Proof = import("./types").Proof;
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
    fontStyle?: string;
    position: Position;
    textAlign?: "left" | "right" | "center" | "justify";
    fontSize?: number;
    color?: Color;
    width?: number;
    lineHeight?: number;
    hasHTML?: boolean;
};

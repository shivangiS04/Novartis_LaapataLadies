/**
 * Theme Configuration - Black & Orange Theme
 * Font: Roboto, Black 900 Italic for headings
 */
export declare const theme: {
    colors: {
        primary: string;
        primaryDark: string;
        primaryLight: string;
        background: string;
        backgroundLight: string;
        backgroundLighter: string;
        text: string;
        textSecondary: string;
        textTertiary: string;
        accent: string;
        accentDark: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        border: string;
        borderLight: string;
    };
    fonts: {
        primary: string;
        heading: string;
        mono: string;
    };
    fontWeights: {
        light: number;
        regular: number;
        medium: number;
        semibold: number;
        bold: number;
        black: number;
    };
    fontStyles: {
        headingBlackItalic: {
            fontFamily: string;
            fontWeight: number;
            fontStyle: string;
            fontSize: string;
            lineHeight: number;
            letterSpacing: string;
        };
        headingBold: {
            fontFamily: string;
            fontWeight: number;
            fontSize: string;
            lineHeight: number;
            letterSpacing: string;
        };
        subheading: {
            fontFamily: string;
            fontWeight: number;
            fontSize: string;
            lineHeight: number;
        };
        body: {
            fontFamily: string;
            fontWeight: number;
            fontSize: string;
            lineHeight: number;
        };
        bodySmall: {
            fontFamily: string;
            fontWeight: number;
            fontSize: string;
            lineHeight: number;
        };
        caption: {
            fontFamily: string;
            fontWeight: number;
            fontSize: string;
            lineHeight: number;
            textTransform: string;
            letterSpacing: string;
        };
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
        xxl: string;
    };
    borderRadius: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
        full: string;
    };
    shadows: {
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    transitions: {
        fast: string;
        normal: string;
        slow: string;
    };
};
export type Theme = typeof theme;
//# sourceMappingURL=theme.d.ts.map
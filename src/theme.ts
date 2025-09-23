import { DefaultTheme, DarkTheme } from '@react-navigation/native';
import { TextStyle } from 'react-native';

const palette = {
  primary: '#007aff',
  white: '#ffffff',
  black: '#000000',
  red: '#ff3b30', // 削除ボタン用

  gray50: '#f5f5f5',   // 全体の背景色
  gray100: '#f0f0f0',  // 検索ボックスの背景色
  gray200: '#eeeeee',  // 区切り線
  gray300: '#cccccc',
  gray500: '#888888',  // EmptyTextの色
  gray600: '#777777',  // 詳細テキスト
  gray700: '#666666',  // アイコンの色
  gray800: '#555555',  // サブタイトル
  gray900: '#333333',

  darkBg: '#121212',
  darkSurface: '#242424',
  darkSeparator: '#3a3a3a',

  // タグ用
  tagText: '#4338ca',
  tagBackground: '#eef2ff',
  star: "#ffb400",

};

type FontWeight = TextStyle['fontWeight'];

// アプリのデザイントークン
export const tokens = {
  colors: {
    // ライトモード
    light: {
      background: palette.gray50,
      card: palette.white,
      text: palette.black,
      subtext: palette.gray800,
      detailText: palette.gray600,
      icon: palette.gray700,
      primary: palette.primary,
      separator: palette.gray200,
      inputBackground: palette.gray100,
      danger: palette.red,
      tagText: palette.tagText,
      tagBackground: palette.tagBackground,
      emptyText: palette.gray500,
      buttonSelected: palette.primary,
      buttonSelectedText: palette.white,
      buttonText: palette.primary,
      star: palette.star,
      starInactive: palette.gray300,
    },
    // ダークモード
    dark: {
      background: palette.darkBg,
      card: palette.darkSurface,
      text: palette.white,
      subtext: palette.gray200,
      detailText: palette.gray500,
      icon: palette.gray200,
      primary: palette.primary,
      separator: palette.darkSeparator,
      inputBackground: palette.darkSeparator,
      danger: palette.red,
      tagText: palette.tagBackground,
      tagBackground: palette.tagText, 
      emptyText: palette.gray500,
      buttonSelected: palette.primary,
      buttonSelectedText: palette.white,
      buttonText: palette.primary,
      star: palette.star,
      starInactive: palette.gray800,
    },
  },
  spacing: {
    xs: 4,
    ss: 6,
    s: 8,
    m: 10,
    l: 12,
    xl: 16,
    xxl: 20,
  },
  typography: {
    title: {
      fontSize: 20,
      fontWeight: 'bold' as FontWeight,
    },
    subtitle: {
      fontSize: 16,
      color: palette.gray800,
    },
    body: {
      fontSize: 14,
    },
    caption: {
      fontSize: 12,
    },
  },
};

export const navigationLightTheme = {
    ...DefaultTheme,
    colors: {
    ...DefaultTheme.colors,
    primary: tokens.colors.light.primary,
    background: tokens.colors.light.background,
    card: tokens.colors.light.card,
    text: tokens.colors.light.text,
    border: tokens.colors.light.separator,
  },
};

export const navigationDarkTheme = {
    ...DarkTheme,
    colors: {
    ...DarkTheme.colors,
    primary: tokens.colors.dark.primary,
    background: tokens.colors.dark.background,
    card: tokens.colors.dark.card,
    text: tokens.colors.dark.text,
    border: tokens.colors.dark.separator,
  },
};


// 型定義
export type AppTheme = typeof tokens.colors.light;
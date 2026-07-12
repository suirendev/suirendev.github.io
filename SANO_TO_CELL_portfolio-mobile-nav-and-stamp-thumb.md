# SANO → CELL 作業報告書

- **案件名**: portfolio-mobile-nav-and-stamp-thumb
- **デプロイ先**: https://suirendev.github.io/
- **デプロイ日時**: 2026-07-13 02:50 JST
- **ベース**: 7/11 デプロイ済み `main`（commit `e5cd4e152822a710ab7e8aa3e822bc10a49fb639` / `index.html` blob `26dc2f81228f18093747ffc245b65754ec060f0a`）

## 変更点

1. ヒーローの `.btn-row` に `About ↓`（`#about`）と `Services ↓`（`#services`）を追加。
2. サブ導線用 `.btn-sub` を追加し、既存2CTAより視覚的な主張を抑制。
3. 640px以下で4ボタンが2×2になるよう `.btn-row .btn` を調整。
4. 固定ナビとの重なりを避けるため、`#about` / `#services` に `scroll-margin-top: 80px` を追加。
5. LINEスタンプカードの `😺` を透過PNG `assets/nekomata-chibi.png` に置換。
6. サムネ用 `.work-thumb-img` を追加し、16:9グラデーション枠内で `contain` 表示。

## 追加・変更クラス

- `.btn-sub`
- `.btn-row .btn`（640px以下のみ）
- `.btn-row .btn-sub`（640px以下のみ）
- `.work-thumb-img`

## 画像

- 配置先: `assets/nekomata-chibi.png`
- 支給JPGからキャラクター部分のみ透過化。支給原本は未変更。
- 1024×1024 / RGBA / 507,374 bytes
- SHA-256: `549e1a86cd0108ce06ee90d4e41ce43820f84f7b058a7759238fb1ffdae8bf59`

## 確認結果

- 375×812、412×915（Pixel 9相当）: CTA 2×2、About / Servicesジャンプ正常
- 1440×900: 4ボタンが1行に収まり、既存ナビ・ヒーロー配置とも崩れなし
- 透過PNG: 16:9枠内、`alt` / `loading="lazy"` / `object-fit: contain` 済み
- 7/11改修: CASE FILEモーダル、LINE STORE / Twitch、静的カードを維持
- Clarity `x766xzwipf`、Cloudflare Web Analyticsを維持
- `GAS` 0件、機密語（シフト・店舗名等）0件
- UTF-8 strict decode、インラインJS構文、ブラウザコンソール: エラー0件

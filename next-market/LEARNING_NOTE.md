# next-market 学習ノート

作成日: 2026-03-26

---

## 目次

1. [使用技術の概要](#1-使用技術の概要)
2. [プロジェクト構成とディレクトリの役割](#2-プロジェクト構成とディレクトリの役割)
3. [Next.js App Router の仕組み](#3-nextjs-app-router-の仕組み)
4. [Server Component と Client Component](#4-server-component-と-client-component)
5. [API Routes (Route Handlers)](#5-api-routes-route-handlers)
6. [MongoDB + Mongoose によるデータ管理](#6-mongodb--mongoose-によるデータ管理)
7. [JWT 認証の仕組み](#7-jwt-認証の仕組み)
8. [Middleware による保護](#8-middleware-による保護)
9. [各ページ・コードの役割](#9-各ページコードの役割)
10. [書き方の注意点・改善ポイント](#10-書き方の注意点改善ポイント)

---

## 1. 使用技術の概要

| 技術 | バージョン | 役割 |
|------|-----------|------|
| **Next.js** | 16.1.6 | フロントエンド + バックエンド フレームワーク |
| **React** | 19.2.3 | UI コンポーネントライブラリ |
| **MongoDB Atlas** | - | クラウドデータベース |
| **Mongoose** | 9.3.0 | MongoDB の ODM（オブジェクト操作ライブラリ） |
| **jose** | 6.2.2 | JWT の生成・検証ライブラリ |
| **Tailwind CSS** | v4 | ユーティリティファーストの CSS フレームワーク |

### Next.js とは

Next.js は React ベースのフルスタックフレームワーク。
**1つのプロジェクトでフロントエンド（画面）とバックエンド（API）を両方書ける**のが特徴。

```
ブラウザ (React) ←→ Next.js ←→ MongoDB
```

---

## 2. プロジェクト構成とディレクトリの役割

```
next-market/
├── app/                      ← App Router のルートディレクトリ
│   ├── api/                  ← バックエンド API（Route Handlers）
│   │   ├── item/
│   │   │   ├── create/route.js        POST /api/item/create
│   │   │   ├── readall/route.js       GET  /api/item/readall
│   │   │   ├── readsingle/[id]/route.js  GET /api/item/readsingle/:id
│   │   │   ├── update/[id]/route.js   PUT  /api/item/update/:id
│   │   │   └── delete/[id]/route.js   DELETE /api/item/delete/:id
│   │   └── user/
│   │       ├── register/route.js      POST /api/user/register
│   │       └── login/route.js         POST /api/user/login
│   ├── item/                 ← アイテム関連の画面ページ
│   │   ├── create/page.js
│   │   ├── readsingle/[id]/page.js
│   │   └── update/[id]/page.js
│   ├── user/                 ← ユーザー関連の画面ページ
│   │   ├── login/page.js
│   │   └── register/page.js
│   ├── utils/                ← 共通ユーティリティ
│   │   ├── database.js       ← DB 接続処理
│   │   └── schemaModels.js   ← Mongoose スキーマ定義
│   ├── globals.css           ← グローバルスタイル
│   ├── layout.tsx            ← 全ページ共通レイアウト
│   └── page.js               ← トップページ（商品一覧）
├── middleware.js              ← 認証ミドルウェア
├── next.config.ts             ← Next.js 設定
└── package.json
```

**ポイント：** App Router では **フォルダ名がそのままURL** になる。
例：`app/item/create/page.js` → `http://localhost:3000/item/create`

---

## 3. Next.js App Router の仕組み

### ファイルベースルーティング

| ファイル名 | 役割 |
|-----------|------|
| `page.js` | そのパスの画面（ページコンポーネント） |
| `layout.tsx` | 複数ページで共有するレイアウト |
| `route.js` | API エンドポイント（バックエンド処理） |

### 動的ルート（Dynamic Routes）

フォルダ名を `[id]` のように `[]` で囲むと、動的なパスになる。

```
app/item/readsingle/[id]/page.js
→ /item/readsingle/abc123  (id = "abc123")
→ /item/readsingle/xyz456  (id = "xyz456")
```

### params の仕組み

`params` はデータベースに保存されたものではなく、**URLから自動的に取り出される**値。
Next.js がURLとフォルダ構造を照合して、自動でコンポーネントに渡してくれる。

```
① Linkでidをurl に埋め込む → <Link href={`/item/update/${item._id}`}>
② ユーザーがクリック → /item/update/69bfd2af... に移動
③ Next.jsがURLを見る → [id] の位置の値を取り出す
④ コンポーネントに渡す → params = { id: "69bfd2af..." }
```

params からIDを取り出す方法（Next.js 15以降、params は Promise になった）：

```js
// Server Component の場合 → await で展開
const ReadSingleItem = async ({ params }) => {
    const { id } = await params;
```

```js
// Client Component の場合 → React の use() で展開
import { use } from "react";

const UpdateItem = ({ params }) => {
    const { id } = use(params);
```

### 複数の動的パラメータ

`[...]` フォルダを複数作れば、それぞれが `params` に入る。

```
app/shop/[shopId]/item/[itemId]/page.js
URL: /shop/abc123/item/xyz789
→ params = { shopId: "abc123", itemId: "xyz789" }
```

### layout.tsx の役割

全ページに共通するHTMLの骨格（`<html>`, `<body>`）を定義する。
`{children}` の部分に各ページのコンテンツが入る。

```tsx
export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    );
}
```

---

## 4. Server Component と Client Component

Next.js App Router では、コンポーネントは **デフォルトで Server Component**。

### Server Component（サーバー側で実行）

- ファイル先頭に `"use client"` を**書かない**
- `async/await` でデータを直接フェッチできる
- `useState`, `useEffect` などの React フックは**使えない**
- データをサーバーで取得してHTMLを返す（SEOに有利）

```js
// app/page.js（Server Component）
const getAllItems = async () => {
    const response = await fetch("http://localhost:3000/api/item/readall", {
        cache: "no-store"  // ← キャッシュなし（常に最新データ）
    });
    const jsonData = await response.json();
    return jsonData.allItems;
};

const ReadAllItems = async () => {      // ← async 関数として定義
    const allItems = await getAllItems(); // ← そのまま await 可能
    return ( ... );
};
```

### Client Component（ブラウザ側で実行）

- ファイル先頭に `"use client"` を書く
- `useState`, `useEffect`, `useRouter` などが使える
- `localStorage` にアクセスできる
- ユーザー操作（フォーム、クリックなど）を扱う

```js
// app/user/login/page.js（Client Component）
"use client";
import { useState } from "react";

const Login = () => {
    const [email, setEmail] = useState(""); // ← useState が使える
    ...
};
```

### Client Component では `async` を使えない

`"use client"` のコンポーネント自体を `async` にすると `useState` などのHooksが使えなくなる。
ただし、コンポーネントの**中で定義する関数**は `async` にできる。

```js
// ❌ コンポーネント自体を async にする
const UpdateItem = async ({ params }) => {
    const [formData, setFormData] = useState(...); // エラー！
}

// ✅ 中の関数は async にできる
const UpdateItem = ({ params }) => {
    const handleSubmit = async (e) => { ... }  // OK
}
```

### useEffect（マウント時のデータ取得）

コンポーネントが画面に表示された**後**に実行される処理。
Client Component でデータを取得するときの基本パターン。

```js
// 表示時に1回だけ実行
useEffect(() => {
    fetchData();
}, []);          // ← 空の配列（依存配列）= 1回だけ

// id が変わるたびに実行
useEffect(() => {
    fetchData(id);
}, [id]);        // ← id を監視
```

**注意：** `useEffect` の中で直接 `async` は使えない。中で関数を定義して呼ぶ。

```js
useEffect(() => {
    const fetchData = async () => {
        const data = await fetch(...);
    };
    fetchData();  // ← 呼び出しを忘れない
}, []);
```

### 使い分けの判断基準

| 条件 | Component の種類 |
|------|-----------------|
| データ表示のみ（インタラクションなし） | Server Component |
| フォーム、ボタンクリックなど | Client Component |
| localStorage を使う | Client Component |
| useEffect でデータ取得 | Client Component |
| SEO が重要なページ | Server Component |

---

## 5. API Routes (Route Handlers)

`app/api/` 以下の `route.js` ファイルがバックエンドの API になる。

### 基本構造

```js
import { NextResponse } from "next/server";

// HTTP メソッド名と同じ名前の関数をエクスポートする
export async function GET(request) { ... }
export async function POST(request) { ... }
export async function PUT(request, { params }) { ... }
export async function DELETE(request, { params }) { ... }
```

### リクエストボディの受け取り方

```js
export async function POST(request) {
    const reqBody = await request.json(); // ← JSON を受け取る
    // reqBody.name, reqBody.email ... で値を取れる
}
```

### レスポンスの返し方

```js
// 成功時
return NextResponse.json({ message: "成功！" });

// エラー時（ステータスコード付き）
return NextResponse.json({ message: "エラー" }, { status: 401 });
```

### 動的ルートのパラメータ取得

```js
export async function GET(request, { params }) {
    const { id } = await params; // ← [id] フォルダのIDを取得
}
```

### `response.ok` でレスポンスの成否を判定する

`fetch` のレスポンスのステータスコードが **200〜299 なら `true`、それ以外なら `false`** になるプロパティ。
**注意：** `fetch` はHTTPエラー（404, 500）でも例外を投げないため、自分でチェックする必要がある。

```js
const response = await fetch("/api/user/register", { ... });
if (response.ok) {
    // 成功（200番台）
    const data = await response.json();
} else {
    // 失敗（400, 500番台）— ここも普通に実行される
    alert("エラーが発生しました");
}
```

### revalidate = 0 について

```js
export const revalidate = 0; // ← このAPIルートのキャッシュを無効化
```

Next.js はデフォルトでレスポンスをキャッシュするため、常に最新データを返したい場合は `0` を設定する。

---

## 6. MongoDB + Mongoose によるデータ管理

### MongoDB Atlas とは

クラウド上で動くMongoDBサービス。ローカルにDBをインストールせずに使える。

### Mongoose とは

MongoDBをJavaScriptから操作するためのライブラリ（ODM）。
データの形（スキーマ）を定義して、型安全に操作できる。

### 接続処理（database.js）

```js
import mongoose from "mongoose";

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://...");
        console.log("MongoDB connected successfully!");
    } catch (error) {
        console.error("MongoDB connection error:", error);
        process.exit(1); // 接続失敗時はプロセスを終了
    }
};

export default connectDB;
```

**API を呼ぶたびに `connectDB()` を呼び出す**パターン（Next.js のサーバーレス環境に対応）。

### スキーマとモデル（schemaModels.js）

**スキーマ** = データの設計図（どんなフィールドを持つか）

```js
const itemSchema = new Schema({
    title: String,
    image: String,
    price: String,
    description: String,
    email: String,
});
```

**モデル** = スキーマを使ってDBを操作するためのオブジェクト

```js
// mongoose.models.Item が既に存在する場合はそれを使い、
// なければ新しく作る（Hot Reload 時の重複エラー防止）
export const ItemModel = mongoose.models.Item || mongoose.model('Item', itemSchema);
```

### CRUD 操作

```js
// Create（作成）
await ItemModel.create(reqBody);

// Read All（全件取得）
const allItems = await ItemModel.find();

// Read Single（1件取得）
const item = await ItemModel.findById(id);

// Update（更新）
await ItemModel.findByIdAndUpdate(id, reqBody);

// Delete（削除）
await ItemModel.findByIdAndDelete(id);
```

---

## 7. JWT 認証の仕組み

### JWT（JSON Web Token）とは

ユーザーが「ログイン済みか」を証明するためのトークン（文字列）。
サーバーが発行し、クライアントが保持して、リクエスト時に送る。

```
[ログイン]
ユーザー → POST /api/user/login → サーバー
                                   ↓ パスワード照合
                                   ↓ JWTを生成
ユーザー ← token ←←←←←←←←←←←← サーバー
    ↓
localStorage.setItem("token", token)  // ブラウザに保存

[認証が必要な操作]
ユーザー → POST /api/item/create  → Middleware（JWT検証）→ Route Handler
         + Authorization: Bearer <token>
```

### JWT の生成（jose ライブラリ）

```js
import { SignJWT } from "jose";

const secretKey = new TextEncoder().encode("next-market-app-book");
const payload = { email: reqBody.email };

const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })  // 署名アルゴリズム
    .setExpirationTime("2h")               // 有効期限 2時間
    .sign(secretKey);
```

### JWT の検証

```js
import { jwtVerify } from "jose";

const secretKey = new TextEncoder().encode("next-market-app-book");
const decodedJwt = await jwtVerify(token, secretKey);
// 検証成功 → decodedJwt.payload にデータが入る
// 検証失敗 → 例外がスローされる
```

### トークンの送り方（Authorization ヘッダー）

```js
// クライアントから API を呼ぶとき
const response = await fetch("http://localhost:3000/api/item/create", {
    method: "POST",
    headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
    body: JSON.stringify(formData)
});
```

---

## 8. Middleware による保護

`middleware.js` はすべてのリクエストの**前**に実行される処理。
特定の API に対してJWT認証チェックをかけている。

```js
// middleware.js
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request) {
    // Authorization ヘッダーからトークンを取り出す
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    try {
        const secretKey = new TextEncoder().encode("next-market-app-book");
        await jwtVerify(token, secretKey);
        return NextResponse.next(); // ← 次の処理（Route Handler）へ進む
    } catch {
        return NextResponse.json({ message: "Invalid token" }, { status: 401 });
    }
}

// どのパスに対して middleware を適用するか
export const config = {
    matcher: [
        "/api/item/create",
        "/api/item/update/:path*",  // ← :path* で /api/item/update/任意のID に対応
        "/api/item/delete/:path*",
    ]
};
```

**ポイント：** `readall` と `readsingle` は保護していない → 誰でも閲覧できる。
`create`, `update`, `delete` は保護 → ログインユーザーのみ操作可能。

---

## 9. 各ページ・コードの役割

### トップページ（app/page.js）

- Server Component
- 全商品を取得して一覧表示
- `Link` コンポーネントで商品詳細ページへ遷移
- `Image` コンポーネントで画像を最適化表示

### ユーザー登録（app/user/register/page.js）

- Client Component
- `useState` で各フィールドの入力値を管理
- フォーム送信時に POST `/api/user/register` を呼ぶ

### ユーザーログイン（app/user/login/page.js）

- Client Component
- ログイン成功時に JWT トークンを `localStorage` に保存
- 以降の認証が必要な操作でこのトークンを使う

### 商品作成（app/item/create/page.js）

- Client Component
- `formData` オブジェクトで全フィールドをまとめて管理
- `handleChange` で input の `name` 属性を使って一括更新
- 作成成功後 `router.push("/")` でトップへリダイレクト

```js
// formData をオブジェクトで管理する便利パターン
const handleChange = (e) => {
    // 分割代入：e.target から name と value だけ取り出す
    const { name, value } = e.target;
    setFormData((prevData) => ({
        ...prevData,       // スプレッド構文：既存データをコピー
        [name]: value      // 動的キー：input の name 属性をキーに使って上書き
    }));
};
// → 1つの関数で全inputに対応できる（input ごとに関数を書かなくてよい）
```

**分割代入（Destructuring Assignment）** はオブジェクトや配列から必要な値だけを取り出す書き方。React で頻出。

```js
// オブジェクトの分割代入
const { id, name } = params;  // params.id, params.name を一度に取得

// 配列の分割代入
const [first, second] = ["red", "green"];  // first = "red"

// 関数の引数でも使える
const UpdateItem = ({ params }) => { ... }  // 引数オブジェクトから params を取り出し
```

### 商品詳細（app/item/readsingle/[id]/page.js）

- Server Component
- URLの `id` から単一商品を取得して表示

### 商品更新（app/item/update/[id]/page.js）

- Client Component
- `use(params)` で動的ルートのIDを取得
- `useEffect` でページ表示時に既存データを取得してフォームに設定
- 更新後はトップへリダイレクト

---

## 10. 書き方の注意点・改善ポイント

### (1) パスワードは平文で保存しない（重大なセキュリティ問題）

現在のコードはパスワードをそのままDBに保存・比較している。
実際のアプリでは **bcrypt** などでハッシュ化する。

```js
// 現在（危険）
await UserModel.create({ name, email, password });
if (savedUserData.password === reqBody.password) { ... }

// 改善例
import bcrypt from "bcrypt";
const hashedPassword = await bcrypt.hash(password, 10);
await UserModel.create({ name, email, password: hashedPassword });
// 検証
const isMatch = await bcrypt.compare(reqBody.password, savedUserData.password);
```

### (2) JWT の秘密鍵をハードコードしない

```js
// 現在（危険 - ソースコードに秘密鍵が含まれる）
const secretKey = new TextEncoder().encode("next-market-app-book");

// 改善例 - 環境変数を使う
const secretKey = new TextEncoder().encode(process.env.JWT_SECRET);
```

`.env.local` ファイルに `JWT_SECRET=your-secret-key` と書く。

### (3) MongoDB の接続文字列も環境変数に

```js
// 現在（認証情報がソースコードに含まれる）
await mongoose.connect("mongodb+srv://username:password@cluster...");

// 改善例
await mongoose.connect(process.env.MONGODB_URI);
```

### (4) `mongoose.models.Item || mongoose.model(...)` パターンの理由

```js
export const ItemModel = mongoose.models.Item || mongoose.model('Item', itemSchema);
```

Next.js の開発環境では Hot Reload でファイルが再読み込みされるため、
同じモデルを二度定義しようとしてエラーになることがある。
`mongoose.models.Item` が既に存在するか確認してから新規作成することで防止。

### (5) `next/router` ではなく `next/navigation` を使う

App Router では `next/navigation` を使う。`next/router` は古い Pages Router 用。
間違えると「NextRouter was not mounted」エラーが出る。

```js
// ❌ 古い（Pages Router 用）
import { useRouter } from "next/router";

// ✅ 今の書き方（App Router 用）
import { useRouter } from "next/navigation";
```

### (6) `params` は Next.js 15 以降 async になった

```js
// Next.js 15 以降の Server Component
const { id } = await params; // ← await が必要

// Next.js 15 以降の Client Component
import { use } from "react";
const { id } = use(params); // ← use() でアンラップ
```

### (7) `router.push()` と `router.refresh()` の違い

```js
router.push("/");    // ← 指定ページへ移動（ブラウザ履歴に追加）
router.refresh();   // ← サーバーコンポーネントのデータを再取得して画面を更新
```

`router.push("/")` 後に `router.refresh()` を呼ぶことで、
トップページに戻ったときに最新の商品一覧が表示される。

### (8) `cache: "no-store"` の意味

```js
const response = await fetch(url, { cache: "no-store" });
```

Next.js はデフォルトで `fetch` の結果をキャッシュする。
`cache: "no-store"` を指定すると毎回新鮮なデータを取得する。
商品一覧などの動的データには必要。

### (9) 商品のオーナーチェックの方法

現在は商品の `email` フィールドとリクエストの `email` を比較してオーナー確認をしている。

```js
const singleItem = await ItemModel.findById(id);
if (singleItem.email === reqBody.email) {
    await ItemModel.findByIdAndUpdate(id, reqBody);
}
```

しかし `reqBody.email` はクライアントが送る値なので改ざんが可能。
より安全な方法は JWT のペイロードからメールアドレスを取得すること。

### (10) エラーハンドリングを統一する

`create/route.js` は `catch` の引数が空になっているが、
他のファイルと統一するために `(error)` を受け取ってログを出すとよい。

```js
// 現在
} catch {
    return NextResponse.json({ message: 'Failed to create item.' });
}

// 改善
} catch (error) {
    console.error("Error creating item:", error);
    return NextResponse.json({ message: 'Failed to create item.' }, { status: 500 });
}
```

---

## まとめ：このアプリで学んだこと

| テーマ | 内容 |
|--------|------|
| **App Router** | フォルダ = URL、page.js / route.js の役割 |
| **動的ルート** | `[id]` フォルダで URL パラメータを扱う。params はURLから自動取得 |
| **Server / Client Component** | データ取得はServer、操作はClientで行う |
| **Client Component の制約** | コンポーネント自体は async にできない。中の関数は OK |
| **useEffect** | マウント時のデータ取得パターン。依存配列で実行タイミング制御 |
| **API Routes** | `route.js` でバックエンドAPIを実装 |
| **response.ok** | fetch はエラーでも例外を投げないため自分で成否チェックが必要 |
| **分割代入** | `{ name, value } = e.target` のようにオブジェクトから値を取り出す |
| **formData パターン** | オブジェクト + 分割代入 + 動的キーでフォーム管理 |
| **MongoDB / Mongoose** | スキーマ定義、CRUD操作、接続管理 |
| **JWT 認証** | jose でトークン生成・検証、localStorageで保持 |
| **Middleware** | 特定ルートへのアクセスを一括で保護 |
| **next/navigation** | App Router では `next/router` ではなく `next/navigation` を使う |
| **環境変数** | 秘密情報はソースコードに書かず `.env` に分離 |

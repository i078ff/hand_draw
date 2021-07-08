# hand_draw

## アプリ説明
hand_draw（仮）はカメラから手を認識して絵を描くアプリです。
特別なデバイスは不要で、パソコンやスマートフォンでブラウザからアクセスするだけで絵を描き始めることができます。

## 以下開発メンバー向け
### ディレクトリ構造
```
hand_draw
│  .gitignore
│  docker-compose.yml:      Dockerfileのまとめと各種設定
│  README.md
│  run.py:                  アプリを実行するためだけのファイル
├─app:                      アプリケーションサーバーのディレクトリ
│  │  app.py:               アプリのメインのファイル
│  │  Dockerfile:           Flask, Gunicorn用のDockerfile
│  │  models.py:            DBに関するファイル
│  │  requirements.txt:     pipでinstallするライブラリ
│  ├─static:                静的ファイルを置くディレクトリ
│  │  ├─script:             JavaScriptを置くディレクトリ
│  │  └─style:              CSSを置くディレクトリ
│  ├─templates:             HTMLを置くディレクトリ
├─nginx:                    WEBサーバーのディレクトリ
│      Dockerfile:          nginx用のDockerfile
│      nginx.conf:          nginxの設定ファイル
└─postgres:                 DBサーバーのディレクトリ
    │  Dockerfile:          Postgres用のDockerfile
    └─initdb:               DB起動時に実行されるファイルを集めたディレクトリ
            createdb.sql:   データベースを作成
```

### 実行方法
Docker / Docker Composeが必要です。Docker / Docker Composeインストール後に`cd`コマンドでクローンしたディレクトリ（draw_handディレクトリ）に移動して以下のコマンドを実行するだけです。
#### 基本コマンド
基本こちらのコマンドで動きます。うまく動かないとき[詳細コマンド](#詳細コマンド)を実行してみてください。
アプリ起動
```
docker-compose up -d
```
アプリ再起動（ブラウザで再読み込みしても変更が反映されない場合実行）
```
docker-compose restart
```
アプリ停止
```
docker-compose down
```
起動したアプリに接続するにはブラウザで`http://localhost/`にアクセスします。

#### 詳細コマンド
上手く動かないとき用のコマンド。

アプリ起動
- -d: バックグラウンドで実行
- --build: キャッシュを使わず一からビルドする
```
docker-compose up -d --build
```

アプリ停止
- --volumes: ローカル保存用の領域も削除、（今回は--volumesを付けるとデータベースの内容も削除される）
- --rmi all: 全てのDockerイメージを削除
```
docker-compose down --volumes --rmi all
```

### 目標
1番目の目標は楽しむこと、2番目の目標は最低限動く作品を完成させることです（主観です）。そして超えられない壁を経た後、追加機能の開発やUXの改善になると思います。@yochimonji も開発がバリバリできる！なんて自信はないので、大量に失敗しながら少しずつ成長できればいいなと思っています。

### 役割分担
- @yochimonji ：環境構築、MediaPipe、ONNX、フロントエンド（JavaScript）、DB
- @i078ff ：Flask、JavaScript(そのうち詳細詰める)
- @i009fb @ZZkobaty0214ZZ @Kenshinkk ：デザイン、フロントエンド（HTML/CSS）、スマホ担当、PC担当など決まれば書き直します

担当未定のタスク
- スライド、発表、動画作成

### スケジュール 
とりあえずのスケジュールです。適宜調整します。スケジュール通り行くように頑張ろう…！12,13回目の授業(7/7, 7/14)は開発なんでも相談会

~7/5
- 全員：ハンドサイン撮影と保存
- @yochimonji ：MediaPipeを使えるようになる
- @i078ff ：Flask勉強完了、随時Flaskでバックエンド構築
- @i009fb @ZZkobaty0214ZZ @Kenshinkk ：デザイン、HTML/CSS勉強

7/5~7/14
- @yochimonji ：ハンドサイン学習、適切なモデルの選択と最適化、構築したモデルをonnxjsに変換、DBを操作するコード書く
- @i078ff ：Flask続き、場合によっては途中まで完成してるHTML/CSSにJavaScriptを当てる
- @i009fb @ZZkobaty0214ZZ @Kenshinkk ：HTML/CSSでコーディング

7/14~7/20
- @yochimonji ：JavaScriptを死ぬ気で書く、ログイン周りのHTML/CSSも書く、Webアプリ公開手続き
- @i078ff ：JavaScript死ぬ気で書く
- @i009fb @ZZkobaty0214ZZ @Kenshinkk ：HTML/CSSの調整、追加機能があればそれをする
- 誰か：スライド、動画作成

7/21：最終成果報告会

### 運用方針
#### コーディングからマージまでの流れ
[Githubでチーム開発するためのマニュアル](https://qiita.com/siida36/items/880d92559af9bd245c34)を元に少し変更します。詳細はリンク先参照。
- まずは`main`ブランチからはじめる
    - ローカルリポジトリで`main`ブランチに入る
    - リモートリポジトリで`main`ブランチの更新があるか確認する
- 各開発ブランチで開発
    - 機能を要約した名前でブランチを切る
    - 開発する
    - 変更点を`add`, `commit`、`add`, `commit`は細かく行ってOK、[補足](#コミット頻度)
    - 1つのファイルやページ、機能が完成したら次のステップへ
- `push`の前に
    - `main`ブランチに移動して`main`ブランチを`pull`
    - 開発ブランチに移動して開発ブランチに`main`ブランチを`rebase`
- `push`と`Pull Request`
    - リモートリポジトリへ`push`
    - @yochimonji or @i078ff へ`Pull Request`を出す
    - 問題なければ`merge`します

#### ブランチ
- `main`
    - リリース用ブランチ
    - 保護設定したので`main`ブランチにはプッシュ不可です
    - 他に開発用ブランチを作成してマージしましょう
- `｛他のブランチ｝`
    - 面倒なので命名規則はないです
    - 実装する機能をまとめた名前にしましょう

#### コミット時のコメント
[この記事](https://qiita.com/itosho/items/9565c6ad2ffc24c09364#%E9%80%9A%E5%B8%B8%E7%89%88)を参考にします。
- 1行目：コミット種別 タイトル・要約
- 2行目 ：空行
- 3行目以降：変更した理由（内容、詳細）

コミット種別は以下の4つから選択
- fix：バグ修正
- add：新規（ファイル）機能追加
- update：機能修正（バグではない）
- remove：削除（ファイル）

#### コミット頻度
コミットをどのくらいの頻度で行うかについて、「細かい」の基準は難しいと思いますが、ひとまず、複数のバグの修正をひとつのコミットのまとめるのはNGです。
最低限自分なりの哲学や一貫性があれば（説明出来れば）OKです。

#### 自動フォーマット&コードチェック
- 現在はPythonのみ
    - [black](https://qiita.com/tsu_0514/items/2d52c7bf79cd62d4af4a): 自動フォーマット
    - [flake8](https://qiita.com/tsu_0514/items/949827f6a1cfca32dc65): コードチェック

### その他
- #5 のようにこれからする内容のissueを書くと、他のメンバーが何の作業をしているのか確認ができるので助かります。
- 報告・連絡・相談はSlack
- コード管理はGithub
- タスク管理・バグ報告などはGithubのissue機能を使います（他のメンバーも自由に使ってください！）
- ハンドサイン識別用のリポジトリはまた別で作ります
- 発表資料や画像などの共有はGoogleドライブへ
- 10分考えてもわからないことがあればチームメンバー、メンター、サポーターに相談しましょう

#### 参考資料
- [ローカルで開発していたアプリをDocker化してみた（nginx+Flask+postgres）](https://qiita.com/kiyokiyo_kzsby/items/bea738fa210216c5ea65)
- [【Git】基本コマンド](https://qiita.com/konweb/items/621722f67fdd8f86a017)
- [Githubでチーム開発するためのマニュアル](https://qiita.com/siida36/items/880d92559af9bd245c34)
- [GitHub初心者はForkしない方のPull Requestから入門しよう](https://blog.qnyp.com/2013/05/28/pull-request-for-github-beginners/)
- [Github で Fork して PullRequest を送るのはこんなに簡単](https://qiita.com/YumaInaura/items/acff806290c8953d3185)
- [GithubでのWeb上からのマージの仕方3種とその使いどころ](https://qiita.com/ko-he-8/items/94e872f2154829c868df)
- [3.6 Git のブランチ機能 - リベース](https://git-scm.com/book/ja/v2/Git-%E3%81%AE%E3%83%96%E3%83%A9%E3%83%B3%E3%83%81%E6%A9%9F%E8%83%BD-%E3%83%AA%E3%83%99%E3%83%BC%E3%82%B9)
- [Gitのコミットメッセージの書き方](https://qiita.com/itosho/items/9565c6ad2ffc24c09364#%E9%80%9A%E5%B8%B8%E7%89%88)
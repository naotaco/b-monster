# :fire:b-monster:fire:

b-monsterの予約を自動化するスクリプトです。  
指定された枠を定期的に監視して空き次第即座に予約します。  
もうF5連打で枠を争う必要がなくなります:wink:

## 必要ツール
* node 6+  
* git

## 使い方
1. repoのクローン・インストール
```
git clone https://github.com/koiketakayuki/b-monster.git
cd b-monster
npm install
```

2. .env.sampleファイルを書き換える
```
mv .env.sample .env
BMONSTER_EMAIL=<メールアドレスを入力>
BMONSTER_PASSWORD=<パスワードを入力>
```
3. 実行
```
node index.js
```
スタジオID,レッスンIDはレッスンのURLを参考にしてください

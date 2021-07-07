# 参照元イメージの指定
FROM python:3.7 
# ワーキングディレクトリの指定
WORKDIR /var/www
# ライブラリインストール
COPY requirements.txt app/requirements.txt
RUN pip install -r app/requirements.txt
# コンテナ起動時の実行コマンド
CMD ["bash", "-c", "gunicorn run:app -b 0.0.0.0:4000"]
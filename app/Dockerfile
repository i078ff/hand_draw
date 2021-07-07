# 参照元イメージの指定
FROM python:3.7 
# ワーキングディレクトリの指定
WORKDIR /var/www
# コンテナ起動時の実行コマンド
CMD ["bash", "-c", "pip install -r requirements.txt && gunicorn run:app -b 0.0.0.0:4000"]
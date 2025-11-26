docker compose down
git pull https://github.com/kosmicdakerbal/anabelle-bot.git main
docker rmi anabelle -f
docker build -t anabelle .
docker compose up -d
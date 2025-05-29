dev:
    pnpm run dev --open

deploy:
    @echo "Deploying to aliyun..."
    pnpm run build
    rsync -avz --delete -e ssh ./docs/.vuepress/dist aliyun:Page

    @echo "Deploying to github..."
    git push

lint:
    pnpm run lint

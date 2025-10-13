dev:
    pnpm run dev --open

deploy: deploy-tencent deploy-git

deploy-tencent:
    @echo "Deploying to tencent..."
    pnpm run build
    rsync -avz --delete -e ssh ./docs/.vuepress/dist/ tencent:/var/www

deploy-git:
    @echo "Deploying to github..."
    git push

lint:
    pnpm run lint

update:
    pnpm dlx vp-update

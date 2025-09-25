dev:
    pnpm run dev --open

deploy: deploy-alyyun deploy-git

deploy-alyyun:
    @echo "Deploying to aliyun..."
    pnpm run build
    rsync -avz --delete -e ssh ./docs/.vuepress/dist aliyun:Page

deploy-git:
    @echo "Deploying to github..."
    git push

lint:
    pnpm run lint

update:
    pnpm dlx vp-update

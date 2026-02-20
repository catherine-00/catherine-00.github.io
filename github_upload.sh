#!/bin/bash

now=$(date "+%Y-%m-%d %H:%M:%S")

read -p "커밋 메시지를 입력하세요: " msg

git add --all
git commit -m "$msg ($now)"
git push
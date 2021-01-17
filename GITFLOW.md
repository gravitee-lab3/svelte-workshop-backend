

```bash
export FEATURE_ALIAS="init-src"
# git flow feature start "${FEATURE_ALIAS}"
export COMMIT_MESSAGE="feat.(${FEATURE_ALIAS}): retrieving base code from https://github.com/pokusio/hugo-cheatsheet"
# git add --all && git commit -m "${COMMIT_MESSAGE}" && git push -u origin HEAD

# # squash commits on feature branch
# git flow feature finish "${FEATURE_ALIAS}"
# git flow release start 0.0.0
# git flow release finish -s 0.0.0


export FEATURE_ALIAS="trigger-pipeline"
# git flow feature start "${FEATURE_ALIAS}"
export COMMIT_MESSAGE="feat.(${FEATURE_ALIAS}): implement trigger a pipeline"
# git add --all && git commit -m "${COMMIT_MESSAGE}" && git push -u origin HEAD

# # squash commits on feature branch
# git flow feature finish "${FEATURE_ALIAS}"
# git flow release start 0.0.1
# git flow release finish -s 0.0.1

```

# Trigger and List Circle CI Pipelines Endpoints Operational

In the previous release, a first Endpoint was implemented, allowing to askthe Circle CI API v2 "Who am I?".

In this version, three more endpoints are implemented, allowing to call the Circle CI API, and :
* trigger the execution of any Circle CI Pipeline,
* List all pipelines
* List all Pipelines ofagiven project (of a given `git` repo)

* Launch a test release in the gravitee-lab Github Org, on branch `4.4.x` of the release repo :

```bash
# It should be SECRETHUB_ORG=graviteeio, but Cirlce CI token is related to
# a Circle CI User, not an Org, so jsut reusing the same than for Gravtiee-Lab here, to work faster
# ---
SECRETHUB_ORG=gravitee-lab
SECRETHUB_REPO=cicd
# Nevertheless, I today think :
# Each team member should have his own personal secrethub repo in the [graviteeio] secrethub org.
# like this :
# a [graviteeio/${TEAM_MEMBER_NAME}] secrethub repo for each team member
# and the Circle CI Personal Access token stored with [graviteeio/${TEAM_MEMBER_NAME}/circleci/token]
# ---
export HUMAN_NAME=jblasselle
export CCI_TOKEN=$(secrethub read "${SECRETHUB_ORG}/${SECRETHUB_REPO}/humans/${HUMAN_NAME}/circleci/token")

export ORG_NAME="gravitee-lab"
export REPO_NAME="graviteek-release-test-suite-1"
export BRANCH="4.4.x"
export JSON_PAYLOAD="{

    \"branch\": \"${BRANCH}\",
    \"parameters\":

    {
        \"gio_action\": \"release\"
    }

}"

curl -X GET -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Circle-Token: ${CCI_TOKEN}" https://circleci.com/api/v2/me | jq .
curl -X POST -d "${JSON_PAYLOAD}" -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Circle-Token: ${CCI_TOKEN}" https://circleci.com/api/v2/project/gh/${ORG_NAME}/${REPO_NAME}/pipeline | jq .
```


### How to test this release

* Go and get a Circle CI Personal API Token on Circle CI Web UI: in the next step, set `YOUR_CIRCLECI_PERSONAL_API_TOKEN` 's value to your Circle CI Personal API Token.
* Install and run the server on your machine :
```bash
export DESIRED_VERSION=0.0.0
export WHERE_YOU_INSTALL_GHALLAGHER=./ghallagher.test
# git clone git@github.com:gravitee-lab3/svelte-workshop-backend.git ${WHERE_YOU_INSTALL_GHALLAGHER}
git clone https://github.com/gravitee-lab3/svelte-workshop-backend ${WHERE_YOU_INSTALL_GHALLAGHER}
cd ${WHERE_YOU_INSTALL_GHALLAGHER}
git checkout ${DESIRED_VERSION}
export YOUR_CIRCLECI_PERSONAL_API_TOKEN="your very long token value here"
cat <<EOF > ./.secrets.$(whoami).json
{
  "circleci": {
    "auth": {
      "username": "$(whoami)@${HOSTNAME}",
      "token": "${YOUR_CIRCLECI_PERSONAL_API_TOKEN}"
    }
  }
}
EOF
export SECRETS_FILE_PATH=./.secrets.$(whoami).json
sed -i "s#SECRETS_FILE_PATH=.*#SECRETS_FILE_PATH=${SECRETS_FILE_PATH}#g" ./.env
npm i
npm run server
```

* Note that he preceding script, set the value of the `SECRET_FILE_PATH`, in the `.env` file, to the path of the file containing the secret needed by Ghallagher : Your Circle CI Personal API Token.

#### Test : Circle CI Who am I

* Invoke the Ghallagher `[/backend/circleci/whoami]` Endpoint, without authentication, like this :

```bash
curl -iv http://localhost:5000/backend/circleci/whoami | tail -n 1 | jq .
```

#### Test : Trigger Pipelines

* Invoke the Ghallagher `[/backend/circleci/trigger-pipeline]` Endpoint, without authentication, totriggera pipeline, like this :

```bash
export ORG_NAME="gravitee-lab"
export REPO_NAME="graviteek-release-test-suite-1"
export BRANCH="4.4.x"
export JSON_PAYLOAD="{
    \"github_org\": \"${ORG_NAME}\",
    \"git_repo\": {
      \"name\": \"${REPO_NAME}\",
      \"branch\": \"${BRANCH}\"
    },
    \"parameters\":

    {
        \"gio_action\": \"release\"
    }

}"

curl -iv -X POST -d "${JSON_PAYLOAD}" http://localhost:5000/backend/circleci/trigger-pipeline -H 'Content-Type: application/json' -H 'Accept: application/json' | tail -n 1 | jq .

```

#### Test : List Pipelines of all projects

* Invoke the Ghallagher `[/backend/circleci/get-pipelines]` Endpoint, without authentication, totriggera pipeline, like this :

```bash
export ORG_NAME="gravitee-lab"
export MINE_ONLY=false
export PAGE_TOKEN="AARLwwV7vuFl0VMwl20IVdr6uGOEtLSNJrEWPjBYNC_oeHRntXh8SD2KLvXBj9cv3V5a_zKczdNZcTcRNM1_Ao2gR5hVu802JPFw7yIewjAVZzUELxZ683hcYmmhabpeHcf_HkIGGljg8lIAV9Ajjl9xUBuS6slRlqeS93WlRef7T0TyBnYgs6I"

export JSON_PAYLOAD="{
    \"github_org\": \"${ORG_NAME}\",
    \"mine\": ${MINE_ONLY}
}"

export JSON_PAYLOAD="{
    \"github_org\": \"${ORG_NAME}\",
    \"mine\": ${MINE_ONLY},
    \"page_token\": \"${PAGE_TOKEN}\"
}"


curl -iv -X GET -d "${JSON_PAYLOAD}" http://localhost:5000/backend/circleci/get-pipelines -H 'Content-Type: application/json' -H 'Accept: application/json' | tail -n 1 | jq .

```

* Which should do the same as the following `curl` :

```bash
SECRETHUB_ORG=gravitee-lab
SECRETHUB_REPO=cicd
# Nevertheless, I today think :
# Each team member should have his own personal secrethub repo in the [graviteeio] secrethub org.
# like this :
# a [graviteeio/${TEAM_MEMBER_NAME}] secrethub repo for each team member
# and the Circle CI Personal Access token stored with [graviteeio/${TEAM_MEMBER_NAME}/circleci/token]
# ---
export HUMAN_NAME=jblasselle
export CCI_TOKEN=$(secrethub read "${SECRETHUB_ORG}/${SECRETHUB_REPO}/humans/${HUMAN_NAME}/circleci/token")

export ORG_NAME=gravitee-lab
export MINE_ONLY=false
export PAGE_TOKEN="AARLwwV7vuFl0VMwl20IVdr6uGOEtLSNJrEWPjBYNC_oeHRntXh8SD2KLvXBj9cv3V5a_zKczdNZcTcRNM1_Ao2gR5hVu802JPFw7yIewjAVZzUELxZ683hcYmmhabpeHcf_HkIGGljg8lIAV9Ajjl9xUBuS6slRlqeS93WlRef7T0TyBnYgs6I"
export QUERY_PARAMETERS="org-slug=gh/${ORG_NAME}&mine=${MINE_ONLY}&page-token=${PAGE_TOKEN}"
curl -iv -X GET "https://circleci.com/api/v2/pipeline?${QUERY_PARAMETERS}" -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Circle-Token: ${CCI_TOKEN}" | tail -n 1 | jq .
```

#### Test : List Pipelines of a given project (of a given github repo)

(Still TODO)

* Invoke the Ghallagher `[/backend/circleci/get-pipelines-of]` Endpoint, without authentication, to gat all pipeline executions of a given project (of a given github repo) , like this :

```bash
export ORG_NAME="gravitee-lab"
export ORG_NAME="gravitee-lab"
export REPO_NAME="release"
export BRANCH="3.1.x"
export PAGE_TOKEN="AARLwwWVKpqqyh-Glr5XOth49Uun4w3xcxOuGfR85-DA5eh_a2OBfDqpf_fxwubihhRJ1PM7xrtizzlhdr3hKahwRb7mSUC-aZxo_hcKc-9zWf0nwSMz6xobLd2X-be4v044cTSXDwem"

export JSON_PAYLOAD="{
    \"github_org\": \"${ORG_NAME}\",
    \"git_repo\": {
      \"name\": \"${REPO_NAME}\",
      \"branch\": \"${BRANCH}\"
    },
    \"page_token\": \"${PAGE_TOKEN}\"
}"

curl -iv -X GET -d "${JSON_PAYLOAD}" http://localhost:5000/backend/circleci/get-pipelines-of -H 'Content-Type: application/json' -H 'Accept: application/json' | tail -n 1 | jq .

```

* Which should do the same as the following `curl` :

```bash
SECRETHUB_ORG=gravitee-lab
SECRETHUB_REPO=cicd
# Nevertheless, I today think :
# Each team member should have his own personal secrethub repo in the [graviteeio] secrethub org.
# like this :
# a [graviteeio/${TEAM_MEMBER_NAME}] secrethub repo for each team member
# and the Circle CI Personal Access token stored with [graviteeio/${TEAM_MEMBER_NAME}/circleci/token]
# ---
export HUMAN_NAME=jblasselle
export CCI_TOKEN=$(secrethub read "${SECRETHUB_ORG}/${SECRETHUB_REPO}/humans/${HUMAN_NAME}/circleci/token")

export ORG_NAME="gravitee-lab"
export REPO_NAME="release"
export BRANCH="3.1.x"
export PAGE_TOKEN="AARLwwWVKpqqyh-Glr5XOth49Uun4w3xcxOuGfR85-DA5eh_a2OBfDqpf_fxwubihhRJ1PM7xrtizzlhdr3hKahwRb7mSUC-aZxo_hcKc-9zWf0nwSMz6xobLd2X-be4v044cTSXDwem"
export QUERY_PARAMETERS="branch=${BRANCH}"
export QUERY_PARAMETERS="branch=${BRANCH}&page-token=${PAGE_TOKEN}"
curl -iv -X GET "https://circleci.com/api/v2/project/gh/${ORG_NAME}/${REPO_NAME}/pipeline?${QUERY_PARAMETERS}" -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Circle-Token: ${CCI_TOKEN}" | tail -n 1 | jq .
```

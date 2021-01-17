# WhoamI Circle CI Endpoint Operational at [/backend/circleci/whoami]

In this version, a first endpoint is implemented, allowing to call the Circle CI API, from a browser, just as if you were executing the folowing `curl` :

```bash
curl -X GET https://circleci.com/api/v2/me -H 'Content-Type: application/json' -H 'Accept: application/json' -H "Circle-Token: ${CCI_TOKEN}" | jq .
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
* And invoke the Ghallagher `[/backend/circleci/whoami]` Endpoint, without authentication, like this :

```bash
curl -iv http://localhost:5000/backend/circleci/whoami | tail -n 1 | jq .
```

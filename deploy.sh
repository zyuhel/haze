#!/bin/bash

DEPLOY_SUBDOMAIN_UNFORMATTED_LIST=()
if [ "$TRAVIS_PULL_REQUEST" != "false" ]
then
  DEPLOY_SUBDOMAIN_UNFORMATTED_LIST+=(${TRAVIS_PULL_REQUEST}-pr)
elif [ -n "${TRAVIS_TAG// }" ] #TAG is not empty
then
  #sorts the tags and picks the latest
  #sort -V does not work on the travis machine
  #sort -V              ref: http://stackoverflow.com/a/14273595/689223
  #sort -t ...          ref: http://stackoverflow.com/a/4495368/689223
  #reverse with sed     ref: http://stackoverflow.com/a/744093/689223
  #git tags | ignore release candidates | sort versions | reverse | pick first line
  LATEST_TAG=`git tag | grep -v rc | sort -t. -k 1,1n -k 2,2n -k 3,3n -k 4,4n | sed '1!G;h;$!d' | sed -n 1p`
  echo $LATEST_TAG
  if [ "$TRAVIS_TAG" == "$LATEST_TAG" ]
  then
    DEPLOY_SUBDOMAIN_UNFORMATTED_LIST+=(latest)
  fi
  DEPLOY_SUBDOMAIN_UNFORMATTED_LIST+=(${TRAVIS_TAG}-tag)
else
  DEPLOY_SUBDOMAIN_UNFORMATTED_LIST+=(${TRAVIS_BRANCH}-branch)
fi


for DEPLOY_SUBDOMAIN_UNFORMATTED in "${DEPLOY_SUBDOMAIN_UNFORMATTED_LIST[@]}"
do
  echo $DEPLOY_SUBDOMAIN_UNFORMATTED
  # replaces "/", "+" or "." with "-"
  # sed -r is only supported in linux, ref http://stackoverflow.com/a/2871217/689223
  # Domain names follow the RFC1123 spec [a-Z] [0-9] [-]
  # The length is limited to 253 characters
  # https://en.wikipedia.org/wiki/Domain_Name_System#Domain_name_syntax
  SUBDOMAIN=`echo "$DEPLOY_SUBDOMAIN_UNFORMATTED" | sed -r 's/[\/|\.|\+]+/\-/g'`
done
touch ./dist/CORS
echo '*' > ./dist/CORS
cp ./dist/index.html ./dist/200.html


#! /bin/sh

functions_env="apps/functions/env/.runtimeconfig.json"
service_account="apps/functions/env/service-account.json"

echo "=== Setting up environment files for the project"

if [ ! -e $functions_env ]
then
  firebase functions:config:get > $functions_env
  echo "$functions_env => Runtime config pulled for functions"
fi

if [ ! -e $service_account ]
then
  echo -n "" > $service_account
  echo "$service_account => Created empty file. Download service account from Google Cloud and put inside"
fi

echo "=== Complete"

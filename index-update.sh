#!/bin/bash
docker run -it --rm --env-file=.env.local -e "CONFIG=$(cat ./doc-search.json | jq -r tostring)" algolia/docsearch-scraper
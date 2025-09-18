#!/bin/bash

# FrontEnd - emi composition
nvm use 12
nebulae compose-ui development --shell-type=FUSE_REACT --shell-repo=https://github.com/sofiaresttrepo/emi.git --frontend-id=emi --output-dir=emi  --setup-file=../etc/mfe-setup.json

# API - GateWay composition
nvm use 10
nebulae compose-api development --api-type=NEBULAE_GATEWAY --api-repo=https://github.com/sofiaresttrepo/emi-gateway.git --api-id=emi-gateway --output-dir=emi-gateway  --setup-file=../etc/mapi-setup.json
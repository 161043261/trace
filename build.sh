mkdir trace && cd ./trace
git init && pnpm init && tsc --init
echo "packages:
  - 'packages/*'" >./pnpm-workspace.yaml
echo "link-workspace-packages=true" >./.npmrc
mkdir ./packages/constants/src \
  ./packages/core/src \
  ./packages/performance/src \
  ./packages/types/src \
  ./packages/utils/src -p
cd ./packages/constants && pnpm init && cd -
cd ./packages/core && pnpm init && cd -
cd ./packages/performance && pnpm init && cd -
cd ./packages/types && pnpm init && cd -
echo "export function constants() { console.log('constants') }" >./packages/constants/src/index.ts
echo "export function core() { console.log('core') }" >./packages/core/src/index.ts
echo "export function performance() { console.log('performance') }" >./packages/performance/src/index.ts
echo "export function types() { console.log('types') }" >./packages/types/src/index.ts
echo "export function utils() { console.log('utils') }" >./packages/utils/src/index.ts

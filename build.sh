mkdir trace && cd ./trace
git init && pnpm init && tsc --init
echo "packages:
  - 'packages/*'" >./pnpm-workspace.yaml
echo "link-workspace-packages=true" >./.npmrc
mkdir ./packages/constants/src \
  ./packages/core/src \
  ./packages/performance/src \
  ./packages/screen-record/src \
  ./packages/types/src \
  ./packages/utils/src -p
cd ./packages/constants && pnpm init && cd -
cd ./packages/core && pnpm init && cd -
cd ./packages/performance && pnpm init && cd -
cd ./packages/screen-record && pnpm init && cd -
cd ./packages/types && pnpm init && cd -
echo "export function fn() { console.log('constants') }" >./packages/constants/src/index.ts
echo "export function fn2() { console.log('core') }" >./packages/core/src/index.ts
echo "export function fn3() { console.log('performance') }" >./packages/performance/src/index.ts
echo "export function fn4() { console.log('screen-record') }" >./packages/screen-record/src/index.ts
echo "export function fn5() { console.log('types') }" >./packages/types/src/index.ts
echo "export function fn6() { console.log('utils') }" >./packages/utils/src/index.ts

cd packages && rm -rf chahan
git clone git@github.com:161043261/chahan.git
rm -rf chahan/chahan-dev chahan/.git
pnpm add @trace-dev/core --filter @trace-dev/chahan
pnpm add @trace-dev/performance --filter @trace-dev/chahan
pnpm add @trace-dev/screen-record --filter @trace-dev/chahan

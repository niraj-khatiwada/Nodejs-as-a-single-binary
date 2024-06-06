# Running Node.js project as a single executable binary

Steps:

1. Make a single bundle file using `esbuild` inside as `bundle/bundle.js`

```
pnpm bundle
```

2. Package the bundled file into a single executable binary using `@yao-pkg/pkg`

```
pkg bundle/bundle.js -o ./bin/server-<your platform>)
```

OR

If you have Rust installed, you can just run:

```
pnpm package
```

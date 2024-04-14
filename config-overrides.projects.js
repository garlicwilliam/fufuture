const scope = process.env.BUILD_SCOPE;

const fufutureEntries = [
  {
    isReplaceMain: true,
    entry: 'src/components/shield-option-trade/entry/entry.tsx',
    template: 'public/fufuture/option-app.html',
    outPath: '/index.html',
  },
];


const entries = fufutureEntries;

module.exports = { entries };

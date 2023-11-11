
const i18n = require('esp-i18n');

i18n({
    // 扫描目录
    folders : ['src/'],
    // 忽略/排除目录，默认会忽略掉[target]参数指定的目录
    excludes: ['src/assets'],
    // 自定义工具，生成 import { formatMessage } from '~/localTools';
    // 使用[jsName]自定义工具名称
    localTools : 'locale/i18n',

    // 是否生成zh.ts，默认生成zh.js文件
    // tsExtension: false,

    // Default Name: formatMessage
    // jsName: 'formatMessage',

    // 需进行翻译的语言，如从中文翻译至英文、泰文等，默认为英文，即['en']
    translate: ['en'],

    // 指定zh.js en.ts 生成的目录，默认为'src/locale'
    // target: 'src/locale',
    // 是否打开浏览器，可查看自动抓取翻译等效果，若浏览器页面出现卡顿，在此模式下则可人工干预；默认为关闭
    headless: false,

    // 传递给浏览器参数： https://github.com/puppeteer/puppeteer/blob/master/docs/api.md#puppeteerlaunchoptions 之args参数
    // 如浏览器崩溃，可尝试开启如下参数解决
    // args:  ['--disable-gpu', '--no-sandbox', '--lang=en-US', '--disable-setuid-sandbox', '--disable-dev-shm-usage']

    // 代码为Flow类型，而非Typescript
    // isFlow: true,

    // 指定保存修改后的代码路径，默认为覆盖源文件
    //srcCopyFolder: 'dist',

    // 中文生成到Vue Data函数中，使用到属性名，命名遵循变量定义规则，默认值为'Lables'
    // idName: 'i18n',
})

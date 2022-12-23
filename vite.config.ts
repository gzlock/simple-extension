import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import IconsResolver from 'unplugin-icons/resolver'
import Icons from 'unplugin-icons/vite'

const INVALID_CHAR_REGEX = /[\x00-\x1F\x7F<>*#"{}|^[\]`;?:&=+$,]/g
const DRIVE_LETTER_REGEX = /^[a-z]:/i

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue'],
      resolvers: [
        ElementPlusResolver(),
        // 自动导入图标组件
        IconsResolver({
          prefix: 'Icon',
        }),
      ],
    }),
    Components({
      resolvers: [
        // 自动注册图标组件
        IconsResolver({
          enabledCollections: ['ep'],
        }),
        ElementPlusResolver(),
      ],
    }),
    Icons({
      autoInstall: true,
    }),
  ],
  build: {
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        entryFileNames: () => 'src/[name]/index.js',
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
        // 因为chrome扩展不能使用_开头的文件
        // 此处功能是将_plugin-vueexport-helper.js改名为plugin-vueexport-helper.js
        sanitizeFileName (name) {
          const match = DRIVE_LETTER_REGEX.exec(name)
          const driveLetter = match ? match[0] : ''
          return (
            driveLetter +
            name.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, '')
          )
        },
      },
      input: {
        background: resolve(__dirname, 'src/background/main.ts'),
        content: resolve(__dirname, 'src/content/main.ts'),
        options: resolve(__dirname, 'src/options/options.html'),
        // popup: resolve(__dirname, 'src/popup/popup.html'),
      },
    },

  },
})
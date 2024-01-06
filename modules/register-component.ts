import { addComponent, defineNuxtModule } from "@nuxt/kit";

export default defineNuxtModule({
  async setup() {
    // import { MyComponent as MyAutoImportedComponent } from 'my-npm-package'
    await addComponent({
      name: "QRCodeVue3",
      filePath: "qrcode-vue3",
    });
  },
});

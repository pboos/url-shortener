import { addComponent, defineNuxtModule } from "@nuxt/kit";

export default defineNuxtModule({
  setup() {
    // import { MyComponent as MyAutoImportedComponent } from 'my-npm-package'
    addComponent({
      name: "QRCodeVue3",
      filePath: "qrcode-vue3",
      mode: "client",
    });
  },
});

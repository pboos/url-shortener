import { addComponent, defineNuxtModule } from "@nuxt/kit";

export default defineNuxtModule({
  setup() {
    // import { MyComponent as MyAutoImportedComponent } from 'my-npm-package'
    addComponent({
      name: "QRCodeVue3",
      filePath: "qr-code-generator-vue3",
      mode: "client",
    });
  },
});

import { createApp } from "vue";
// import "./style.css";
import "@/assets/scss/all.scss";
import { createI18n } from "vue-i18n";
import App from "./App.vue";
import en from "@/locales/en.json";
import cn from "@/locales/cn.json";

const i18n = createI18n({
  legacy: false,
  locale: "en",
  globalInjection: true,
  messages: { en, cn },
});

// createApp(App).mount("#app");
const app = createApp(App);
app.use(i18n).mount("#app");

<script setup>
import { onBeforeMount, ref, computed, reactive, onMounted, watch } from "vue";
import dataUrl from "@/profiledata/index.json";
import { throttle, getImageUrl } from "./plugin/common.js";
import { listHashForFilter } from "./plugin/route.js";
import { LIST_SEO, DEFAULT_SEO, setPageMeta } from "./plugin/seo.js";
import Dialog from "@/components/Dialog.vue";
const bannerStatus = ref(false);
const dialogStatus = ref(false);
const props = defineProps({
  msg: String,
  projectName: {
    type: String,
    default: "allproject",
  },
  projectId: {
    type: String,
    default: "",
  },
});
const profile = reactive({
  pageContent: 6,
  pageNum: 1,
  type: "",
  originProfile: [],
  profileButton: true,
  currentProfile: computed(() => {
    let currentData = [];
    if (props.projectName === "workproject") {
      currentData = profile.originProfile.filter(
        (item) => item.type === "url" || item.type === "image"
      );
    } else if (props.projectName === "articlelink") {
      currentData = profile.originProfile.filter(
        (item) => item.type === "articlelink"
      );
    } else {
      currentData = profile.originProfile;
    }

    return currentData;
  }),
  displayProfile: computed(() => {
    let start = profile.pageNum * profile.pageContent;
    let newListData = [];
    let dataLen = profile.currentProfile.length;
    if (dataLen > start) {
      dataLen = start;
      profile.profileButton = true;
    } else {
      dataLen = profile.currentProfile.length;
      profile.profileButton = false;
    }

    for (let i = 0; i < dataLen; i++) {
      newListData.push(profile.currentProfile[i]);
    }

    return newListData;
  }),
  profileMore: () => {
    let start = profile.pageNum * profile.pageContent;
    let dataLen = profile.currentProfile.length;
    if (dataLen > start) {
      profile.pageNum++;
    }
  },
});

const applyListSeo = () => {
  const listMeta = LIST_SEO[props.projectName] || LIST_SEO.allproject;
  setPageMeta(listMeta || DEFAULT_SEO);
};

const openDialog = (item) => {
  const { name, title, link, img, type } = item;
  const detail = dataUrl.detail.find((entry) => entry.id === name) || {};
  const { jobDescription, detailPage, seo } = detail;

  dialogData.value = {
    name,
    title,
    link,
    img,
    type,
    jobDescription,
    detailPage,
    seo,
  };
  dialogStatus.value = true;
  setPageMeta({
    title: seo?.title,
    description: seo?.description,
    keywords: seo?.keywords,
    image: img,
  });
};

const dialogData = ref({});
const getDialogData = (item) => {
  openDialog(item);
  const nextHash = `#/workproject/${item.name}`;
  if (window.location.hash !== nextHash) {
    window.location.hash = nextHash;
  }
};

const syncDialogFromRoute = () => {
  if (!props.projectId) {
    dialogStatus.value = false;
    applyListSeo();
    return;
  }

  const item = profile.originProfile.find(
    (entry) => entry.name === props.projectId
  );
  if (item && (item.type === "url" || item.type === "image")) {
    openDialog(item);
    return;
  }

  dialogStatus.value = false;
  applyListSeo();
};

const isDialogVisible = (status) => {
  dialogStatus.value = status;
  if (status) return;

  applyListSeo();
  const listHash = listHashForFilter(props.projectName);
  if (window.location.hash !== listHash) {
    window.location.hash = listHash;
  }
};

onBeforeMount(() => {
  profile.originProfile = JSON.parse(JSON.stringify(dataUrl.events));
  syncDialogFromRoute();
});

watch(
  () => props.projectName,
  () => {
    profile.pageNum = 1;
    if (!props.projectId) {
      applyListSeo();
    }
  }
);

watch(
  () => props.projectId,
  () => {
    syncDialogFromRoute();
  }
);

const handleScroll = () => {
  bannerStatus.value = window.scrollY > 0;
};
onMounted(() => {
  window.addEventListener("scroll", throttle(handleScroll));
});
</script>

<template>
  <Dialog
    @dialogStaus="isDialogVisible"
    :dialogVisibility="dialogStatus"
    :dialogData="dialogData"
  ></Dialog>
  <div
    class="banner animated fadeIn"
    :class="{ fadeOut: bannerStatus || dialogStatus }"
  >
    <div id="index-banner-detail">
      <h1 class="sketch-title">
        <svg viewBox="0 0 720 90" role="img" aria-label="BRIAN LI DESIGN">
          <text x="100%" y="72%" text-anchor="end">BRIAN LI DESIGN</text>
        </svg>
      </h1>
      <h4>
        I am a
        <b class="change-title"></b>
        <b class="splite">|</b>
      </h4>
      <h6>2013 - 2026</h6>
    </div>
  </div>
  <div class="profile animated fadeIn" :class="{ fadeOut: dialogStatus }">
    <ul class="profile-article" v-show="!dialogStatus">
      <template v-for="(item, index) in profile.displayProfile" :key="index">
        <li v-if="item.type === 'samllproject' || item.type === 'articlelink'">
          <a :href="item.url" target="_blank">
            <img
              :src="
                item.type !== 'articlelink' ? item.img : getImageUrl(item.img)
              "
            />
          </a>
          <span>
            <b class="title"> {{ $t(item.title) }} </b>
            <b class="data">{{ item.data }}</b>
          </span>
        </li>
        <li v-else>
          <a @click="getDialogData(item)">
            <img
              :src="item.type === 'url' ? item.img : getImageUrl(item.img)"
            />
            <img :src="item.img" v-if="item.type === 'url'" alt="" />
          </a>
          <span>
            <b class="title"> {{ $t(item.title) }} </b>
            <b class="data">{{ item.data }}</b>
          </span>
        </li>
      </template>
    </ul>
  </div>
  <div
    class="more animated fadeIn"
    :class="{ fadeOut: dialogStatus }"
    v-if="profile.profileButton"
    @click="profile.profileMore"
  >
    MORE
  </div>
</template>

<style scoped></style>

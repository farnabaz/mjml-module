<template>
  <div class="nuxt_mjml_wrapper">
    <div class="nuxt_mjml_sidebar">
      <ul class="nuxt_mjml_template_list">
        <li
          v-for="template in templates"
          :key="template"
          class="nuxt_mjml_template"
          :class="template === selectedTemplate ? 'selected' : ''"
        >
          <nuxt-link :to="`/_mails/${template}`">
            {{ template }}
          </nuxt-link>
        </li>
      </ul>
    </div>
    <div :is="mjmlComponent" v-if="$route.params.slug" class="nuxt_mjml_inbox" />
  </div>
</template>

<script>
export default {
  layout: 'mjml',
  async asyncData ({ req }) {
    const host = req ? req.headers.host : window.location.host
    const templates = await fetch(`http://${host}/_mails/__templates_list`).then(res => res.json())
    return {
      selectedTemplate: '',
      templates
    }
  },
  computed: {
    mjmlComponent () {
      return async () => {
        const { slug } = this.$route.params
        const html = await (import(`~/mails/${slug}.mjml`).then(m => m.default))
        return {
          render (h) {
            return h('div', {
              domProps: { innerHTML: html }
            })
          }
        }
      }
    }
  }
}
</script>

<style>
body {
  margin: 0;
}
.nuxt_mjml_wrapper {
  display: flex;
  height: 100vh;
}
.nuxt_mjml_sidebar {
  padding: 1em;
  background: #f8f8f8;
  width: 200px;
}
.nuxt_mjml_iframe {
  width: 100%;
  border: none;
}
.nuxt_mjml_template_list {
  padding: 0;
}
.nuxt_mjml_template {
  list-style: none;
  margin: 0;
  cursor: pointer;
  border-radius: 5px;
  padding: 8px 10px;
}
.nuxt_mjml_template.selected {
  background: #eeeeee;
}
.nuxt_mjml_inbox {
  width: 100%;
}
</style>

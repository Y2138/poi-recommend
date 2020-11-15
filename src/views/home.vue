<template>
  <section class="main-content">
    <header class="content-head">铺设点位推荐</header>
    <section class="content-body">
      <map-search></map-search>
    </section>
  </section>
</template>

<script>
export default {
  name: 'home',
  data () {
    return {
      name: '',
      id: '',
    }
  },
  components: {
    mapSearch: () => import('./map')
  },
  mounted () {
    // this.init()
  },
  computed: {
    getUserNameAndId () {
      return this.$store.getters.userName + ': ' + this.$store.getters.userId
    }
  },
  methods: {
    init () {
      this.testApi()
    },
    testApi () {
      
      this.axiosGet('/api/').then(res => {
        console.log(res)
      }).catch(() => {})
    },
    handleCommitName () {
      this.$store.dispatch('setUserName', this.name)
      this.$store.dispatch('setUserId', this.id)
    }
  }
}
</script>

<style lang="scss" scoped>
.main-content {
  padding: 10px;
  .content-head {
    font-size: 32px;
    color: #21cfbb;
    padding: 5px;
    box-shadow: 0 1px 3px rgba(192,198,201,.4);
  }
}
</style>
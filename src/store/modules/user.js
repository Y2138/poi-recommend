const user = {
  state: {
    name: 'testName',
    id: 'testId'
  },
  mutations: {
    SET_USER_NAME (state, val) {
      state.name = val
    },
    SET_USER_ID (state, val) {
      state.id = val
    }
  },
  actions: {
    setUserName (state, val) {
      state.commit('SET_USER_NAME', val)
      window.localStorage.setItem('name', val)
    },
    setUserId (state, val) {
      state.commit('SET_USER_ID', val)
      window.localStorage.setItem('id', val)
    }
  }
}

export default user
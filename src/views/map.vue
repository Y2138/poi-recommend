<template>
  <section id="map">
    <div class="operate-container">
      <div class="flex-row" :class="{'pb25': !isSelect}">
        <el-button v-if="!isSelect" type="primary" @click="handleSelect">选择地图区域</el-button>
        <el-button v-if="isSelect" type="info" @click="handleCancel">取消选择</el-button>
        <el-button type="danger" @click="handleClear">清除所选</el-button>
        <el-button type="primary" @click="handleSendMap">确认选择</el-button>
        <el-button v-if="!showHeat && hasHeat" type="primary" @click="handleShowHeat">显示热力图</el-button>
        <el-button v-if="showHeat" type="info" @click="handleCloseHeat">关闭热力图</el-button>
      </div>
      <div v-if="isSelect" class="tips-text">鼠标拖动进行选择</div>
    </div>
    <div id="map-container"></div>
  </section>
  
</template>

<script>
import AMap from 'AMap'
export default {
  name: 'test1',
  data () {
    return {
      map: null, // 地图
      heatMap: null, // 热力图
      mouseTool: null, // 鼠标编辑工具
      isSelect: false,
      overlays: null, // 所选区域
      markerList: [], // 地图选点
      hasHeat: false, // 有热力图数据
      showHeat: false, // 显示热力图
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    // 初始化map
    initMap () {
      // let center = [120.19, 30.25]
      let center = [104.06, 30.64]
      this.map = new AMap.Map('map-container', {
        center, // 设置地图中心点坐标
        zoom: 10.5, // 设置地图缩放级别
      })
      this.map.on('click', this.handleClickMap)
      console.log('--------init map---------')
      this.marker = new AMap.Marker();
      this.infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});
    },
    // 初始化鼠标操作
    initMouseTool () {
      console.log('--------init mouse--------')
      this.mouseTool = new AMap.MouseTool(this.map);
      //使用鼠标工具，在地图上画标记点
      this.mouseTool.circle({
        fillColor:'#00b0ff',
        strokeColor:'#80d8ff'
      });
      this.mouseTool.on('draw', ({obj}) => {
        this.handleClear()
        this.overlays = obj
        console.log('北纬: ', obj.Ce.center.lat)
        console.log('东经: ', obj.Ce.center.lng)
        console.log('半径: ', obj.Ce.radius)
      })
    },
    // 鼠标绑定点击事件
    async handleClickMap (e) {
      if (!e) return

      console.log('click point: ', e.lnglat)
      let marker = new AMap.Marker({
        position: e.lnglat,
        map: this.map
      })
      let mContent = await this.getPotContent(e.lnglat)
      marker.content = `
        <p>门店数量：${mContent.shopCnt || ''}</p>
        <p>门店日均收益均值：${mContent.dailyAvgGmv || ''}</p>
        <p>门店日均订单量：${mContent.dailyAvgOrdQt || ''}</p>
        <p>单宝收益均值：${mContent.unitgmv || ''}</p>
      `
      // TODO 调接口查content
      marker.on('mouseover', this.openInfo)
      marker.on('mouseout', this.closeInfo)
      marker.on('click', this.newWindow)
      // 地图选点放入list便于清除
      this.markerList.push(marker)
    },
    // 获取选点详细信息
    getPotContent (lnglat) {
      const param = {
        lat: lnglat.getLat(),
        lon: lnglat.getLng(),
      }
      return new Promise((resolve, reject) => {
        this.axiosPost('/info', param).then(res => {
          if (res.success) {
            resolve(res.model || {})
          } else {
            reject(res.errorMessage)
          }
        }).catch(res => {
          reject(res.errorMessage)
        })
      })
    },
    // 生成详情弹框
    newWindow (e) {
      // 地图定位到选点
      this.map.setCenter(e.target.getPosition());
      this.map.setZoomAndCenter(15, e.target.getPosition());
      
      // let infoWindow = new AMap.InfoWindow({offset: new AMap.Pixel(0, -30)});
      this.infoWindow.setContent(e.target.content);
      this.infoWindow.open(this.map, e.target.getPosition());
    },
    // 开启弹框
    openInfo (e) {
      this.infoWindow.open(this.map, e.target.getPosition());
    },
    // 关闭弹框
    closeInfo (e) {
      this.infoWindow.setContent(e.target.content);
      this.infoWindow.close(this.map, e.target.getPosition());
    },
    // 开始选择
    handleSelect () {
      if (!this.mouseTool) {
        this.initMouseTool()
      } else {
        this.mouseTool.circle({
          fillColor:'#00b0ff',
          strokeColor:'#80d8ff'
        });
      }
      this.isSelect = true
    },
    // 取消选择
    handleCancel () {
      this.isSelect = false
      this.handleClear() // 清除所选
      this.mouseTool.close(false)
    },
    // 清除所选区域
    handleClear () {
      console.log('------clear-------')
      // 清除所选圆形
      if (this.overlays) {
        this.map.remove(this.overlays)
        this.overlays = {}
      }
      // 清除地图选点
      this.map.remove(this.markerList)
    },
    // 确认选择 发请求
    handleSendMap () {
      if (!(this.overlays && this.overlays.Ce)) {
        this.$message.error('请先选择区域')
        return
      }
      if (this.overlays.Ce.radius < 1000) {
        this.$message.error('半径不能小于1km')
        return
      }
      if (this.overlays.Ce.radius > 300000) {
        this.$message.error('半径不能大于10km')
        return
      }
      const param = {
        lat: this.overlays.Ce.center.lat,
        lon: this.overlays.Ce.center.lng,
        radius: this.overlays.Ce.radius
      }
      console.log('selected: ', param)
      this.axiosPost('/recommend', param).then(res => {
        if (res.success) {
          // 关闭选择图层便于选点拖拽操作
          this.handleCancel()
          // 若已有热力图直接set数据，否则创建热力图
          console.log('heatMapData: ', res.model)
          if (this.heatMap) {
            this.heatMap.setDataSet(res.model)
          } else {
            this.createHeatMap(res.model)
          }
        } else {
          this.$message.error(res.errorMessage)
        }
      }).catch(() => {})
    },
    /**
     * @feature 创建热力图
     * @data [{lng: Number, lat: Number, count: Number}]
     */
    createHeatMap (model) {
      this.hasHeat = true
      this.showHeat = true
      const heatMapData = JSON.parse(JSON.stringify(model))
      const _this = this
      this.map.plugin(["AMap.Heatmap"], () => {
        //初始化heatMap对象
        _this.heatMap = new AMap.Heatmap(_this.map, {
          visible: false,
          radius: 25, //给定半径
          opacity: [0, 0.8],
        });
        //设置数据集：该数据为北京部分“公园”数据
        _this.heatMap.setDataSet({
          data: heatMapData,
          max: 100
        });
      });
    },
    handleShowHeat () {
      this.showHeat = true
      this.heatMap.show()
    },
    handleCloseHeat () {
      this.showHeat = false
      this.heatMap.hide()
    }
  }
}
</script>

<style lang="scss" scoped>
#map-container {
  width: 100%;
  height: 560px;
}
.operate-container {
  width: 100%;
  .flex-row {
    padding: 15px 0 0 0;
    display: flex;
    align-items: center;
    // j
    justify-content: start;
  }
  .pb25 {
    padding-bottom: 25px;
  }
  .tips-text {
    height: 25px;
    font-size: 12px;
    color: rgba($color: #000000, $alpha: 0.4)
  }
}
</style>
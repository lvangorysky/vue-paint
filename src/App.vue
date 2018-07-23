<template>
  <div id="app">
    <select @change="changeSelect" v-model="selected">
      <option value="line">line</option>
      <option value="arrow">arrow</option>
      <option value="circle">circle</option>
    </select>
    <canvas width="800" height="600"
    @mousedown="mouseDown($event)" 
    @mousemove="mouseMove($event)"
    @mouseup="mouseUp($event)"
    ref="canvas"></canvas>
    <!-- <button :disabled="count > 19 || count < 15">
    </button> -->
  </div>
</template>

<script>

export default {
  name: 'App',
  data() {
    return {
      selected: 'circle',
      canvas: '',
      ctx: '',
      w: 0,
      h: 0,
      lock: false, //ismove
      status: {
        lineArr: [],
        arrowArr: [],
        circleArr: []
      },
      type: {
        line: false,
        arrow: false,
        circle: true
      },
      //画线参数
      clickDrag: [],
      lineX: [],
      lineY: [],
      //箭头参数
      beginPoint: {
        x: 0,
        y: 0
      },
      stopPoint: {
        x: 0,
        y: 0
      },
      //圆形参数
      storage: {
        x: 0,
        y: 0
      },
      polygonVertex: [],
      angle: 0,
    }
  },
  created() {
    this.$nextTick( () => {
      this.init();
    })    
  },
  methods: {
    changeSelect() {
      for (let i in this.type) {
        if (i == this.selected) {
          this.type[i] = true
        }else {
          this.type[i] = false
        }
      }
    },
    init() {
      this.canvas = this.$refs['canvas'];
      this.ctx = this.$refs['canvas'].getContext('2d');
      this.w = this.canvas.width;
      this.h = this.canvas.height;
    },
    mouseDown(e) {
      this.lock = true;
      if (this.type.line) {
        this.movePoint(e.offsetX, e.offsetY);
        this.drawPoint(this.lineX, this.lineY, this.clickDrag, 3, '#000000');
      }else if (this.type.arrow) {
        this.beginPoint.x = e.offsetX;
        this.beginPoint.y = e.offsetY;
      }else if (this.type.circle) {
        this.storage.x = e.offsetX;
        this.storage.y = e.offsetY;
      } 
    },
    mouseMove(e) {
      if (this.lock) {
        if (this.type.line) {
          this.movePoint(e.offsetX, e.offsetY);
          this.drawPoint(this.lineX, this.lineY, this.clickDrag, 3, '#000000');
        }else if (this.type.arrow) {
          this.stopPoint.x = e.offsetX;
          this.stopPoint.y = e.offsetY;
          this.clearCanvas();
          this.redrawAll();
          this.arrowCoord(this.beginPoint, this.stopPoint, 10, 25, 15);
          this.sideCoord();
          this.drawArrow('#DC143C');
        }else if (this.type.circle) {
          let pointX;
          let pointY;
          let lineX;
          let lineY;
          if (this.storage.x > e.offsetX) {
            pointX = this.storage.x - Math.abs(this.storage.x - e.offsetX) / 2
          }else {
            pointX = Math.abs(this.storage.x - e.offsetX) / 2 + this.storage.x;
          }
          if (this.storage.y > e.offsetY) {
            pointY = this.storage.y - Math.abs(this.storage.y - e.offsetY) / 2;
          } else {
            pointY = Math.abs(this.storage.y - e.offsetY) / 2 + this.storage.y;
          }
          lineX = Math.abs(this.storage.x - e.offsetX) / 2;
          lineY = Math.abs(this.storage.y - e.offsetY) / 2;
          this.clearCanvas();
          this.redrawAll();
          this.drawEllipse(pointX, pointY, lineX, lineY, 3, '#3300CC');
        }
        
      }
    },
    mouseUp(e) {
      if (this.type.line) {
        this.status.lineArr.push({ x: this.lineX, y: this.lineY, clickDrag: this.clickDrag, lineWidth: 3, color: '#000000'})
        this.lineX = [];
        this.lineY = [];
        this.clickDrag = [];
      }else if (this.type.arrow) {
        var tempObj = {
          beginPoint: this.beginPoint,
          stopPoint: { x: e.offsetX, y: e.offsetY },
          range: 10,
          color: '#DC143C'
        }
        this.status.arrowArr.push(tempObj);
        this.beginPoint = {
          x: 0,
          y: 0
        };
      }else if (this.type.circle) {
        let pointX;
        let pointY;
        let lineX;
        let lineY;
        if (this.storage.x > e.offsetX) {
          pointX = this.storage.x - Math.abs(this.storage.x - e.offsetX) / 2
        }else {
          pointX = Math.abs(this.storage.x - e.offsetX) / 2 + this.storage.x;
        }
        if (this.storage.y > e.offsetY) {
          pointY = this.storage.y - Math.abs(this.storage.y - e.offsetY) / 2;
        } else {
          pointY = Math.abs(this.storage.y - e.offsetY) / 2 + this.storage.y;
        }
        lineX = Math.abs(this.storage.x - e.offsetX) / 2;
        lineY = Math.abs(this.storage.y - e.offsetY) / 2;
        this.status.circleArr.push({
          x: pointX,
          y: pointY,
          a: lineX,
          b: lineY,
          color: '#3300CC',
          lineWidth: 3
        });
        this.storage = {
        };
      }
      this.lock = false;
    },
    //绘制线
    movePoint(x, y) {
      this.lineX.push(x);
      this.lineY.push(y);
      this.clickDrag.push(y);
    },
    drawPoint(x, y, clickDrag, lineWidth, color) {
      this.ctx.lineWidth = lineWidth;
      this.ctx.strokeStyle = color;
      for(let i = 0; i < x.length; i++ ) {
        this.ctx.beginPath();
        if (clickDrag[i] && i) {
          this.ctx.moveTo(x[i-1], y[i-1]);
        }else {
          this.ctx.moveTo(x[i] - 1, y[i]);
        }
        this.ctx.lineTo(x[i], y[i]);
        this.ctx.closePath();
        this.ctx.stroke();
      }      
    },
    //绘制箭头
    arrowCoord(beginPoint, stopPoint, range, edgeLen, angle) {
      this.polygonVertex[0] = beginPoint.x;
      this.polygonVertex[1] = beginPoint.y;
      this.polygonVertex[6] = stopPoint.x;
      this.polygonVertex[7] = stopPoint.y;
      this.getRadian(beginPoint, stopPoint);
      this.polygonVertex[8] = stopPoint.x - edgeLen * Math.cos(Math.PI / 180 * (this.angle + range));
      this.polygonVertex[9] = stopPoint.y - edgeLen * Math.sin(Math.PI / 180 * (this.angle + range));
      this.polygonVertex[4] = stopPoint.x - edgeLen * Math.cos(Math.PI / 180 * (this.angle - range));
      this.polygonVertex[5] = stopPoint.y - edgeLen * Math.sin(Math.PI / 180 * (this.angle - range));
    },  
   sideCoord() {
      var midpoint = {};
      midpoint.x = (this.polygonVertex[4] + this.polygonVertex[8]) / 2;
      midpoint.y = (this.polygonVertex[5] + this.polygonVertex[9]) / 2;
      this.polygonVertex[2] = (this.polygonVertex[4] + midpoint.x) / 2;
      this.polygonVertex[3] = (this.polygonVertex[5] + midpoint.y) / 2;
      this.polygonVertex[10] = (this.polygonVertex[8] + midpoint.x) / 2;
      this.polygonVertex[11] = (this.polygonVertex[9] + midpoint.y) / 2;
    },
    getRadian(beginPoint, stopPoint) {
      this.angle = Math.atan2(stopPoint.y - beginPoint.y, stopPoint.x - beginPoint.x) / Math.PI * 180;
    },
    drawArrow(color) {
      this.ctx.fillStyle = color;
      this.ctx.beginPath();
      this.ctx.moveTo(this.polygonVertex[0], this.polygonVertex[1]);
      this.ctx.lineTo(this.polygonVertex[2], this.polygonVertex[3]);
      this.ctx.lineTo(this.polygonVertex[4], this.polygonVertex[5]);
      this.ctx.lineTo(this.polygonVertex[6], this.polygonVertex[7]);
      this.ctx.lineTo(this.polygonVertex[8], this.polygonVertex[9]);
      this.ctx.lineTo(this.polygonVertex[10], this.polygonVertex[11]);
      this.ctx.closePath();
      this.ctx.fill();
    },
    //绘制圆圈
    drawEllipse(x, y, a, b, lineWidth, color) {
      this.ctx.beginPath();
      this.ctx.ellipse(x, y, a, b, 0, 0, 2 * Math.PI);
      this.ctx.lineWidth = lineWidth;
      this.ctx.fillStyle = 'rgba(0,0,0,0)';
      this.ctx.strokeStyle = color;
      this.ctx.fill();
      this.ctx.stroke();
    },
    //重绘canvas
    redrawAll() {
      let arrow = this.status.arrowArr;
      let line = this.status.lineArr;
      let circle = this.status.circleArr;

      if (arrow.length) {
        arrow.forEach(val => {
          if (val.beginPoint != {}) {
            this.arrowCoord(val.beginPoint, val.stopPoint, val.range, 25, 15);
            this.sideCoord();
            this.drawArrow(val.color);
          }
        })
      };
      if (line.length) {
        line.forEach(val => {
          this.drawPoint(val.x, val.y, val.clickDrag, val.lineWidth, val.color)
        })
      };
      if(circle.length) {
        circle.forEach(val => {
          this.drawEllipse(val.x, val.y, val.a, val.b, val.lineWidth, val.color)
        })
      }
    },
    //清空画布
    clearCanvas() {
      this.ctx.clearRect(0,0,this.w,this.h)
    }
  }
}
</script>

<style>
  #app {
    margin: auto
  }
  select {
    display: block
  }
  canvas {
    border: 1px solid #000; 
    margin: auto;
    height: 600px;
  }
</style>

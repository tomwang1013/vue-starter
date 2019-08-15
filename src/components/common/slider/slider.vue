<style lang="scss">
  .see-slider {
    position: relative;
    &::after {
      content: "";
      display: table;
      clear: both;
    }
    .slider-dnd {
      float: left;
      width: 160px;
    }
    .dnd-box {
      position: relative;
      margin-top: 9px;
      width: 100%;
      height: 4px;
      background: #d8d8d8;
      border-radius: 8px;
      cursor: pointer;
    }
    .dnd-inspect {
      width: 0;
      height: 100%;
      background: #1f85ec;
      border-radius: 8px;
    }
    .dnd-btn {
      position: absolute;
      top: -3px;
      left: 0;
      width: 10px;
      height: 10px;
      margin-left: -5px;
      background: #f5f5f5;
      box-shadow: 0 0 5px 0 rgba(0, 0, 0, 0.5);
      border-radius: 50%;
      cursor: pointer;
    }
    .dnd-ruler {
      position: relative;
      margin-top: 5px;
      width: 160px;
      height: 5px;
    }
    .ruler-point {
      position: absolute;
      top: 0;
      left: 0;
      width: 5px;
      height: 100%;
      margin-left: -3px;
      padding: 0 2px;
      cursor: pointer;
      &:first-child {
        margin-left: -2px;
      }
      &::after {
        content: "";
        display: block;
        width: 1px;
        height: 100%;
        background: #d4d4d4;
      }
    }
    .key-point {
      &::after {
        background: #979797;
      }
    }
    .slider-input {
      float: left;
      margin-left: 10px;
      width: 60px;
      font-size: 14px;
      color: #333333;
      > input {
        width: 43px;
        height: 30px;
        outline: none;
        margin: 0;
        padding: 0;
        border: 1px solid #d4d4d4;
        border-radius: 4px;
        font-size: 14px;
        color: #333333;
        text-align: center;
        -webkit-appearance: none;
        &::-webkit-inner-spin-button {
          display: none;
        }
      }
    }
  }
  body.slider-dragging {
    cursor: ew-resize !important;
    * {
      cursor: ew-resize !important;
    }
  }
</style>

<template>
  <div class="see-slider">
    <div class="slider-dnd">
      <div class="dnd-box"
           ref="rail"
           @click="onSlideTo">
        <div class="dnd-inspect"
             :style="{ width: slidePercent }"></div>
        <div class="dnd-btn"
             :style="{ left: slidePercent }"
             @click.stop
             @mousedown.left="onSlideBoot"></div>
      </div>
      <div class="dnd-ruler">
        <b v-for="index in 11"
           class="ruler-point"
           :key="'ruler' + index"
           :class="{ 'key-point': (index - 1) % 5 === 0 }"
           :style="{ left: (index - 1) * 10 + '%' }"
           v-tooltip="{ content: (index - 1) * max / 10 + '%' }"
           @click="slideTo((index - 1) * max / 10)"></b>
      </div>
    </div>
    <div class="slider-input">
      <input type="number"
             :maxlength="(max + '').length"
             v-model="value" />
      <span>%</span>
    </div>
  </div>
</template>

<script>
  import $ from 'jquery'
  import Dragger from 'lib/Dragger'

  export default {
    name: 'see-slider',

    props: {
      min: {
        type: Number,
        default: 0
      },
      max: {
        type: Number,
        default: 100
      },
      init: {
        type: Number,
        default: 50
      }
    },

    data() {
      return {
        value: this.init
      }
    },

    computed: {
      slidePercent() {
        return this.value / this.max * 100 + '%';
      }
    },

    watch: {
      init(newVal) {
        this.value = newVal;
      },

      value(newVal, oldValue) {
        let val = parseInt(newVal) || 0;
        val = Math.max(this.min, Math.min(this.max, val));
        if (val !== newVal) {
          this.value = val;
        }
        if (typeof oldValue === 'number' && oldValue !== val) {
          this.$emit('change', this.value);
        }
      }
    },

    /*mounted() {
      this.value = this.init;
    },*/

    methods: {
      slideTo(val) {
        this.value = val;
      },

      // ==================================
      // drag handles
      // ==================================

      onSlideBoot(e) {
        this.dragger = new Dragger(e, this);
        const { state } = this.dragger;
        state.initValue = this.value;
        state.railWidth = this.$refs.rail.offsetWidth;
      },

      onDragStart() {
        $('body').addClass('slider-dragging');
      },

      onDragMove(e) {
        const { state } = this.dragger;
        const dx = e.clientX - state.clientX;
        let value = state.initValue + dx / state.railWidth * 100;
        value = Math.max(this.min, Math.min(this.max, value));
        this.value = Math.round(value);
      },

      onDragEnd(e) {
        const { state } = this.dragger;
        const dx = e.clientX - state.clientX;
        const oldValue = this.value;
        let value = state.initValue + dx / state.railWidth * 100;
        value = Math.max(this.min, Math.min(this.max, value));
        this.value = Math.round(value);
        $('body').removeClass('slider-dragging');
      },

      onSlideTo(e) {
        const rail = $(this.$refs.rail);
        const offset = rail.offset();
        const railWidth = rail.outerWidth();
        let value = (e.pageX - offset.left) / railWidth * 100;
        value = Math.max(this.min, Math.min(this.max, value));
        this.value = Math.round(value);
      }
    }
  }
</script>

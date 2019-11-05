<template>
  <div class="c-wrapper">
    <div class="calendar" @mouseup="mouseUp" @mouseleave.stop="mouseUp">
      <div class="calendar__title">{{ monthTitle }}</div>
      <div class="calendar__body">
        <div
          v-for="(day, key) in 7"
          :key="`title${day}`"
          class="calendar__day day__weektitle"
          :style="{fontSize: weekTitleFontSizeAdjustLang}"
        >{{ showDayTitle(key) }}</div>
        <div v-for="(dayObj, key) in showDays" class="calendar__day" :key="`day${key}`">
          <div
            @mouseover="dragDay(dayObj)"
            @mousedown="mouseDown(dayObj)"
            class="day"
            :class="classList(dayObj)"
          >{{ dayObj.value }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from "dayjs";
export default {
  data() {
    return {
      showDays: [],
      isMouseDown: false
    };
  },
  props: {
    activeDates: {
      type: Array,
      default: () => []
    },
    month: {
      type: [String, Number],
      default: () => dayjs().month() + 1
    },
    year: {
      type: [String, Number],
      default: () => dayjs().year()
    },
    lang: {
      type: String,
      default: "en"
    },
    activeClass: {
      type: String,
      default: () => "WD"
    },
    prefixClass: {
      type: String
    }
  },
  computed: {
    weekTitleFontSizeAdjustLang() {
      const fontSizeMapping = {
        tw: "16px"
      };
      return fontSizeMapping[this.lang];
    },
    monthTitle() {
      const monthMapping = {
        tw: [
          "一月",
          "二月",
          "三月",
          "四月",
          "五月",
          "六月",
          "七月",
          "八月",
          "九月",
          "十月",
          "十一月",
          "十二月"
        ]
      };
      return monthMapping[this.lang][this.month - 1];
    }
  },
  watch: {
    year(val) {
      this.initCalendar();
    },

    activeDates(after, before) {
      this.initCalendar();
    }
  },
  methods: {
    initCalendar() {
      if (!this.year || !this.month) return [];
      const activeMonth = dayjs()
        .set("date", 1)
        .set("year", this.year)
        .set("month", this.month - 1);
      let firstDay = activeMonth.startOf("month").day() - 1;
      if (firstDay < 0) firstDay += 7;
      const lastDate = activeMonth.endOf("month").date();
      const weekRow = firstDay >= 5 ? 6 : 5;
      const WEEK = 7;
      let day = 0;
      const fullCol = Array.from(Array(weekRow * WEEK).keys()).map(i => {
        let value = firstDay <= i ? (day++ % lastDate) + 1 : "";
        return {
          value,
          active: false,
          isOtherMonth: firstDay > i || day > lastDate
        };
      });
      this.showDays = fullCol;
      this.activeDates.forEach(date => {
        let oDate;
        if (typeof date === "string") {
          oDate = {
            date: date,
            className: this.activeClass
          };
        } else if (typeof date === "object") {
          oDate = date;
        }

        let dayjsObj = dayjs(oDate.date);
        if (dayjsObj.year() !== this.year) return;
        let activeDate = dayjsObj.date();
        let row = Math.floor(activeDate / 7);
        let activeArrayKey = (activeDate % 7) - 1 + firstDay + 7 * row;
        this.showDays[activeArrayKey].active = true;
        this.showDays[activeArrayKey].className = oDate.className;
      });
    },
    showDayTitle(day) {
      const dayMapping = {
        tw: ["一", "二", "三", "四", "五", "六", "日"]
      };
      return dayMapping[this.lang][day];
    },
    toggleDay(dayObj) {
      if (dayObj.isOtherMonth) return;
      this.$emit("toggleDate", {
        month: this.month,
        date: dayObj.value,
        selected: !dayObj.active,
        className: this.activeClass
      });
    },
    dragDay(dayObj) {
      if (this.isMouseDown) this.toggleDay(dayObj);
    },
    mouseDown(dayObj) {
      this.toggleDay(dayObj);
      this.isMouseDown = true;
    },
    mouseUp() {
      this.isMouseDown = false;
    },
    classList(dayObj) {
      let oClassList = {
        "calendar__day--otherMonth": dayObj.isOtherMonth,
        [this.prefixClass]: dayObj.active
      };

      if (dayObj.active) oClassList[dayObj.className] = true;

      return oClassList;
    }
  },
  created() {
    this.initCalendar();
  }
};
</script>

<style lang="less" scoped>
.c-wrapper {
  padding: 10px;
}

.calendar {
  background-color: #fff;
  min-height: 295px;
  text-align: center;
  border-radius: 2px;
  min-width: 0;
  position: relative;
  text-decoration: none;
  box-shadow: 0 2px 1px -1px rgba(0, 0, 0, 0.2), 0 1px 1px 0 rgba(0, 0, 0, 0.14),
    0 1px 3px 0 rgba(0, 0, 0, 0.12);
  transition: transform 0.3s ease;

  .calendar__title {
    font-weight: bold;
    flex: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    height: 50px;
    margin-bottom: 12px;
    border-bottom: 1px solid #000;
  }

  .calendar__body {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-content: flex-start;
    padding: 0px 20px;
    min-width: 194px;
  }

  .calendar__day {
    flex: 14.28%;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    height: 31px;
    color: #000;
  }

  .day__weektitle {
    color: #353c46;
    opacity: 0.8;
  }

  .day {
    font-size: 14px;
    cursor: pointer;
    user-select: none;
    width: 22px;
    height: 22px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    border-radius: 5px;

    &:after {
      content: "";
      display: block;
      height: 10px;
      width: 10px;
      position: absolute;
      top: -5px;
      right: -5px;
      border-radius: 50%;
      z-index: 1;
      background-color: transparent;
    }

    &.calendar--active:after {
      background-size: 100% 100%;
    }

    &:not(.calendar__day--otherMonth):hover {
      background-color: #666;
      opacity: 0.1;
      border-radius: 5px;
    }

    &.HD {
      background: #ff6565;
      color: #fff;
    }
    &.TNS {
      background: #8566e1;
      color: #fff;
    }
    &.SNT {
      background: #ffff5c;
      color: #000;
    }
    &.HDB {
      background: #ff5cbd;
      color: #fff;
    }
    &.HGD {
      background: #853333;
      color: #fff;
    }
  }

  & .calendar__day--otherMonth {
    color: #eaeaea;
    cursor: auto;
  }
}
</style>

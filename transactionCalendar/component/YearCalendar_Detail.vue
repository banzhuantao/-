<template>
  <div class="vue-calendar__container">
    <div class="container__year"></div>
    <Form :label-width="113" inline style="margin-top:20px;">
      <FormItem label="所属年份:" style="width: 30%;">
        <Input v-model="singleData.year" style="width: 100%;margin-right:8px;" disabled />
      </FormItem>
      <FormItem label="交易市场:" style="width: 30%;">
        <Input v-model="singleData.marketCode" style="width: 100%;margin-right:8px;" disabled />
      </FormItem>
    </Form>

    <div class="container__months">
      <month-calendar
        class="container__month"
        v-for="n in 12"
        :key="`month-${n}`"
        :year="activeYear"
        :month="n"
        :activeDates="month[n]"
        :activeClass="activeClass"
        @toggleDate="toggleDate"
        :lang="lang"
        :prefixClass="prefixClass"
      ></month-calendar>
    </div>

    <Form ref="createForm" :label-width="120" inline style="margin-top:20px;" v-if="isCalenderIn">
      <FormItem label="制作人:" style="width: 30%;">
        <Input disabled style="width: 100%" v-model="singleData.createUser" />
      </FormItem>
      <FormItem label="制作时间:" style="width: 30%;">
        <Input disabled style="width: 100%" v-model="singleData.createTime" />
      </FormItem>
      <br />
      <FormItem label="审核人:" style="width: 30%;">
        <Input disabled style="width: 100%" v-model="singleData.reviewer" />
      </FormItem>
      <FormItem label="审核时间:" style="width: 30%;">
        <Input disabled style="width: 100%" v-model="singleData.reviewTime" />
      </FormItem>
    </Form>
  </div>
</template>

<script>
import dayjs from "dayjs";
import MonthCalendar from "./MonthCalendar_Detail";
export default {
  data() {
    return {
      // isUsingString: true,

      marketId: "TIF"
    };
  },
  props: {
    activeDates: {
      type: Array,
      default: () => [],
      validator: dateArray => {
        let isGood = true;
        let curDate = null;

        dateArray.forEach(date => {
          if (typeof date === "string") {
            curDate = date;
          } else if (typeof date === "object" && date.hasOwnProperty("date")) {
            curDate = date.date;
          }

          if (!/^\d{4}\-\d{1,2}\-\d{1,2}$/.test(curDate)) {
            isGood = false;
          }
          var parts = curDate.split("-");
          var day = parseInt(parts[2], 10);
          var month = parseInt(parts[1], 10);
          var year = parseInt(parts[0], 10);

          if (year < 1000 || year > 3000 || month === 0 || month > 12)
            isGood = false;
          let monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
          if (year % 400 === 0 || (year % 100 !== 0 && year % 4 === 0))
            monthLength[1] = 29;
          if (!(day > 0 && day <= monthLength[month - 1])) isGood = false;
        });
        return isGood;
      }
    },
    value: {
      type: [String, Number],
      default: dayjs().year()
    },
    lang: {
      type: String,
      default: "tw"
    },
    activeClass: {
      type: String,
      default: () => ""
    },
    prefixClass: {
      type: String
    },
    singleData: {
      type: Object
    },
    isCalenderIn: {
      type: Boolean
    }
  },
  components: {
    MonthCalendar
  },
  computed: {
    month() {
      const month = {};
      this.activeDates.forEach(date => {
        let oDate;

        if (typeof date === "string") {
          oDate = {
            date: date,
            className: this.activeClass
          };
        } else {
          oDate = {
            date: date.date,
            className: date.className || ""
          };
        }
        if (dayjs(oDate.date).year() !== this.value) return;
        let m = (dayjs(oDate.date).month() + 1).toString();
        if (!month[m]) month[m] = [];
        month[m].push(oDate);
      });
      return month;
    },
    activeYear: {
      get() {
        return parseInt(this.value);
      },
      set(val) {
        this.$emit("input", val);
      }
    }
  },
  watch: {
    marketId() {
      this.$emit("setMarkId", this.marketId);
    }
  },
  methods: {
    toggleDate(dateObj) {
      const activeDate = dayjs()
        .set("year", this.value)
        .set("month", dateObj.month - 1)
        .set("date", dateObj.date)
        .format("YYYY-MM-DD");
      this.$emit("toggleDate", {
        date: activeDate,
        selected: dateObj.selected,
        className: dateObj.className
      });
    },
    modifiedActiveDates(dateIndex, activeDate) {
      let newDates = [...this.activeDates];
      if (dateIndex === -1) {
        newDates.push(activeDate);
      } else {
        newDates.splice(dateIndex, 1);
      }
      return newDates;
    }
  },
  created() {
    // this.isUsingString =
    //   this.activeDates.length && typeof this.activeDates[0] === "string";
  }
};
</script>


<style lang="less" scoped>
.footerBtn {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  button {
    margin-left: 8px;
  }
}
.vue-calendar__container {
  width: 80%;
  box-sizing: border-box;
  border-radius: 2px;
  position: relative;
  text-decoration: none;
  .container__months {
    flex-wrap: wrap;
    display: flex;
    padding: 15px;
  }

  .container__month {
    padding: 8px;
    flex: 1;
  }

  .p-0 {
    padding: 0px;
  }
}
</style>

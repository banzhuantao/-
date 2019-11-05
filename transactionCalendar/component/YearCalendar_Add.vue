<template>
  <div class="vue-calendar__container">
    <div class="container__year"></div>
    <Form :label-width="113" inline style="margin-top:20px;">
      <FormItem label="所属年份:" style="width: 30%;">
        <DatePicker type="year" v-model="yearMsg" style="width: 100%" @on-change="changeYear"></DatePicker>
      </FormItem>
      <FormItem label="交易市场:" style="width: 30%;">
        <Select
          style="width:100%;"
          :clearable="true"
          :filterable="true"
          placeholder
          v-model="marketId"
          @on-change="noticeMsg"
        >
          <Option
            v-for="(item, index) of markList"
            :value="item.dicCode"
            :key="index"
          >{{ item.dicName }}</Option>
        </Select>
      </FormItem>
      <Button type="primary" @click="copyCalendar" style="margin-left:50px">复制</Button>
    </Form>

    <Modal
      title
      v-model="showCopyCalendar"
      style="width: 60%"
      :closable="false"
      :mask-closable="false"
    >
      <Form :label-width="80" inline style="margin-top:20px;">
        <FormItem label="所属年份:" style="width: 45%;">
          <DatePicker type="year" v-model="copyYear" style="width: 100%"></DatePicker>
        </FormItem>
        <FormItem label="交易市场:" style="width: 50%;">
          <Select
            style="width:100%;"
            :clearable="true"
            :filterable="true"
            placeholder
            v-model="copyMark"
          >
            <Option
              v-for="(item, index) of markList"
              :value="item.dicCode"
              :key="index"
            >{{ item.dicName }}</Option>
          </Select>
        </FormItem>
      </Form>
      <div slot="footer" class="footerBtn">
        <Button type="primary" @click="onConfirm">确定</Button>
        <Button type="error" @click="onCancel">取消</Button>
      </div>
    </Modal>

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
  </div>
</template>

<script>
import dayjs from "dayjs";
import MonthCalendar from "./MonthCalendar_Add";
export default {
  data() {
    return {
      isUsingString: true,

      marketId: "",
      yearMsg: 0,
      // 复制模态框
      showCopyCalendar: false,
      copyYear: "",
      copyMark: "TIF"
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
      default: () => "WD"
    },
    prefixClass: {
      type: String
    },
    markList: {
      type: Array
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
    yearMsg() {
      if (this.yearMsg == "") {
        let d = new Date();
        this.yearMsg = new Date(d).Format("yyyy");
      }
    },
    marketId() {
      if (this.marketId == "") {
        this.marketId = "";
      }
    },
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
    },

    changeYear() {
      this.activeYear = Number(new Date(this.yearMsg).Format("yyyy"));
      this.noticeMsg();
    },

    // 复制
    copyCalendar() {
      this.showCopyCalendar = true;
    },
    onConfirm() {
      let data = {
        copyYear: this.copyYear,
        copyMark: this.copyMark
      };

      this.$emit("getAllActiveDates", data);

      this.showCopyCalendar = false;
    },
    onCancel() {
      this.showCopyCalendar = false;
    },
    // 提示信息
    noticeMsg() {
      let data = {
        year: new Date(this.yearMsg).Format("yyyy"),
        marketCode: this.marketId
      };
      this.$http
        .get("holidays/year/marketId", { params: data, root: "CORE" })
        .then(res => {
          if (res.body.code == 0) {
            if (res.body.data != "") {
              if (
                res.body.data[0].year == data.year &&
                res.body.data[0].marketCode == this.marketId
              ) {
                this.$Notice.warning({
                  desc: data.year + "年该交易市场信息已存在,请勿重复添加"
                });
                // 不允许新增
                this.$emit("setConfirmFlag", false);
              }
            } else {
              // 允许新增
              this.$emit("setConfirmFlag", true);
            }
          }
        });
    }
  },
  created() {
    this.isUsingString =
      this.activeDates.length && typeof this.activeDates[0] === "string";
    // 初始化页面，将输入框内年份设置为当前年份
    this.yearMsg = dayjs()
      .year()
      .toString();
    this.copyYear = dayjs()
      .year()
      .toString();

    this.noticeMsg();
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

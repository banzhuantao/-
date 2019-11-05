<template>
  <div>
    <div class="ibox-content example public_calender">
      <year-calendar
        v-model="year"
        :activeDates.sync="activeDates"
        @toggleDate="toggleDate"
        :lang="lang"
        prefixClass="your_customized_wrapper_class"
        :activeClass="activeClass"
        :markList="markList"
        @setMarkId="setMarkId"
        @getAllActiveDates="getAllActiveDates"
        @setConfirmFlag="setConfirmFlag"
      ></year-calendar>

      <div class="public_calendar_reference">
        <ul>
          <li v-for="(item, index) of colorReference" :key="index">
            <p :class="item.dicCode"></p>
            <span>{{ item.dicName }}</span>
          </li>
        </ul>
      </div>
    </div>
    <div slot="footer" class="footerBtn">
      <Button type="primary" @click="onSave" :disabled="btnDisabled">保存</Button>
      <Button type="error" @click="onCancel">关闭</Button>
    </div>

    <Modal
      title
      v-model="showChangeMKTModalFlag"
      style="width: 40%"
      :closable="false"
      :mask-closable="false"
    >
      <Form ref="createForm" :label-width="120" inline>
        <FormItem label="类型:" style="width: 70%;">
          <Select :clearable="true" :filterable="true" placeholder v-model="mktType">
            <Option
              v-for="(item, index) of calenderDescribe"
              :value="item.dicCode"
              :key="index"
            >{{ item.dicName }}</Option>
          </Select>
        </FormItem>
        <FormItem label="备注:" style="width: 70%;">
          <textarea cols="33" rows="2" v-model="remarksMsg"></textarea>
        </FormItem>
      </Form>
      <div slot="footer" class="footerBtn">
        <Button type="primary" @click="confirmChangeMKTModal">确定</Button>
        <Button type="error" @click="cancelChangeMKTModal">取消</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import YearCalendar from "./YearCalendar_Add";
import dayjs from "dayjs";
export default {
  components: {
    YearCalendar
  },
  data() {
    return {
      lang: "tw",
      year: "",
      activeDates: [],
      activeClass: "HD",

      markList: [],
      // 类型
      mktType: "",
      // 备注信息
      remarksMsg: "",
      showChangeMKTModalFlag: false,
      calenderDescribe: [],

      // 页面右侧参考
      colorReference: [],

      // 临时存放dateInfo,用于点击时修改数据
      lsDateInfo: null,
      getMarkId: "",

      confirmFlag: false,

      btnDisabled: false
    };
  },
  watch: {
    year() {
      if (this.year) {
        // 切换年份时将activeDates数据情况
        this.activeDates = [];
        // 年份变动计算出双休，添加class
        this.add_sat_and_sun_of_year();
      }
    }
  },
  methods: {
    // 日期点击事件
    toggleDate(dateInfo) {
      this.lsDateInfo = dateInfo;
      this.showChangeMKTModal();
    },
    add_sat_and_sun_of_year() {
      let theDate = dayjs(`${this.year}-01-01`);

      var lsActiveDates = [];
      let lsWorkDate = [];

      for (let i = theDate.diff(theDate.endOf("year"), "day") - 1; i < 0; i++) {
        // while (theDate.diff(theDate.endOf("year"), "day") !== 0) { // 用此代码导致12-31日期无法获取
        if (theDate.day() === 6 || theDate.day() === 0) {
          lsActiveDates.push(theDate.format("YYYY-MM-DD"));
        } else {
          lsWorkDate.push(theDate.format("YYYY-MM-DD"));
        }

        theDate = theDate.add(1, "day");
        // lsWorkDate = theDate;
      }
      lsActiveDates = lsActiveDates
        .filter(function(item, pos, self) {
          return self.indexOf(item) === pos;
        })
        .sort();

      for (let item of lsWorkDate) {
        this.activeDates.push({
          date: item,
          selected: true,
          className: "WD",
          remarksMsg: ""
        });
      }

      // setTimeout(() => {
      for (let item of lsActiveDates) {
        this.activeDates.push({
          date: item,
          selected: true,
          className: "HD",
          remarksMsg: ""
        });
      }
      // }, 0);
    },

    getMKT() {
      this.$http
        .get("dict/getAdminDicList", {
          params: {
            dicTypeName: "MKT"
          },
          root: "CORE"
        })
        .then(res => {
          this.markList = res.body.data;
        });
    },

    getDayType() {
      this.$http
        .get("dict/getAdminDicList", {
          params: {
            dicTypeName: "DAY_TYPE"
          },
          root: "CORE"
        })
        .then(res => {
          this.colorReference = JSON.parse(JSON.stringify(res.body.data));
          this.calenderDescribe = JSON.parse(JSON.stringify(res.body.data));

          for (let item of this.colorReference) {
            if (item.dicName == "工作日") {
              let startNum = this.colorReference.indexOf(item);
              this.colorReference.splice(startNum, 1);
            }
          }
        });
    },

    onCancel() {
      this.$router.push({ name: "transCalendar" });
    },
    setConfirmFlag(bool) {
      this.confirmFlag = bool;
    },
    onSave() {
      if (this.getMarkId && this.year) {
        this.$Modal.confirm({
          title: " ",
          content: "是否确定保存提交",
          onOk: () => {
            this.btnDisabled = true;
            if (this.confirmFlag) {
              let data = [];
              let d = new Date();
              for (let item of this.activeDates) {
                data.push({
                  comments: item.remarksMsg,
                  day: item.date,
                  dayType: item.className,
                  marketCode: this.getMarkId,
                  year: this.year
                });
              }
              this.$http
                .post("holidays", data, { root: "CORE", timeout: 0 })
                .then(res => {
                  if (res.body.code == 0) {
                    this.$Notice.success({
                      desc: "新增任务启动成功"
                    });
                    this.$router.push({
                      name: "taskSelect"
                    });
                  }
                });
            } else {
              this.$Notice.warning({
                desc: "此条年份交易市场信息已存在,请勿重复添加"
              });
            }
          }
        });
      } else {
        this.$Notice.warning({
          desc: "请确保年份和交易市场已经选择"
        });
      }
    },
    confirmChangeMKTModal() {
      let replaceNum = "";
      for (let item in this.activeDates) {
        if (this.activeDates[item].date == this.lsDateInfo.date) {
          replaceNum = item;
          this.activeDates.splice(replaceNum, 1, {
            date: this.lsDateInfo.date,
            selected: true,
            className: this.mktType,
            remarksMsg: this.remarksMsg
          });
        }
      }
      this.showChangeMKTModalFlag = false;
    },
    cancelChangeMKTModal() {
      this.showChangeMKTModalFlag = false;
      this.mktType = "";
      this.remarksMsg = "";
    },
    showChangeMKTModal() {
      this.showChangeMKTModalFlag = true;

      this.activeDates.forEach(value => {
        if (value.date == this.lsDateInfo.date) {
          this.mktType = value.className;
          this.remarksMsg = value.remarksMsg;
        }
      });
    },
    setMarkId(str) {
      this.getMarkId = str;
    },
    getAllActiveDates(obj) {
      this.getActiveDatesList(obj);
    },
    getActiveDatesList(obj) {
      let data = {
        "year-id": obj.copyYear,
        "market-id": obj.copyMark
      };
      this.$http.get("holidays", { params: data, root: "CORE" }).then(res => {
        if (res.body.code == 0) {
          let lsData = [];
          res.body.data.forEach(value => {
            lsData.push({
              date: new Date(value.day).Format("yyyy-MM-dd"),
              className: value.dayType,
              remarksMsg: value.comments
            });
          });
          this.activeDates = lsData;
        }
      });
    }
  },
  created() {
    let d = new Date();
    this.year = Number(new Date(d).Format("yyyy"));
    this.getDayType();
    this.add_sat_and_sun_of_year();
    // 获取交易市场
    this.getMKT();
  }
};
</script>

<style lang="less" scoped>
.footerBtn {
  display: flex;
  justify-content: center;
  margin-bottom: 50px;
  button {
    margin-left: 8px;
  }
}
.public_calender {
  display: flex;
  justify-content: space-between;

  .public_calendar_reference {
    display: block;
    width: 20%;
    display: flex;
    align-items: center;
    ul {
      li {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        p {
          width: 50px;
          height: 50px;
          display: inline-block;
        }
        span {
          font: 18px/50px "";
          margin-left: 22px;
        }
        .HD {
          background: #ff6565;
        }
        .TNS {
          background: #8566e1;
        }
        .SNT {
          background: #ffff5c;
        }
        .HDB {
          background: #ff5cbd;
        }
        .HGD {
          background: #853333;
        }
      }
    }
  }
}
.your_customized_wrapper_class {
  &.WD {
    background: #fff;
    color: #000;
  }
  &.HD {
    background: #ff6565;
    color: white;
  }
  &.TNS {
    background: #8566e1;
    color: white;
  }
  &.SNT {
    background: #ffff5c;
    color: white;
  }
  &.HDB {
    background: #ff5cbd;
    color: white;
  }
  &.HGD {
    background: #853333;
    color: white;
  }
}
</style>

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
        @setMarkId="setMarkId"
        :singleData="singleData"
        :markList="markList"
        @getAllActiveDates="getAllActiveDates"
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
        <Button type="error" @click="cancelChangeMKTModal">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import YearCalendar from "./YearCalendar_Modify";
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
      activeClass: "",

      // 类型
      mktType: "",
      // 备注信息
      remarksMsg: "",
      showChangeMKTModalFlag: false,
      calenderDescribe: [],

      // 临时存放dateInfo,用于点击时修改数据
      lsDateInfo: null,
      getMarkId: "",

      getListDate: null,
      singleData: {},
      markList: [],

      // 页面右侧参考
      colorReference: [],

      btnDisabled: false
    };
  },
  methods: {
    // 日期点击事件
    toggleDate(dateInfo) {
      this.lsDateInfo = dateInfo;
      this.showChangeMKTModal();
    },

    onCancel() {
      this.$router.push({ name: "transCalendar" });
    },

    onSave() {
      this.$Modal.confirm({
        title: " ",
        content: "请确认是否修改",
        onOk: () => {
          this.btnDisabled = true;
          let data = [];
          let d = new Date();
          for (let item of this.activeDates) {
            data.push({
              comments: item.comments,
              day: item.date,
              dayType: item.className,
              holidayId: item.holidayId,
              marketCode: this.getListDate.marketCode,
              year: this.year
            });
          }
          this.$http
            .put("holidays", data, { root: "CORE", timeout: 0 })
            .then(res => {
              if (res.body.code == 0) {
                this.$Notice.success({
                  desc: "修改任务启动成功"
                });
                this.$router.push({
                  name: "taskSelect"
                });
              }
            });
        }
      });
    },

    confirmChangeMKTModal() {
      this.showChangeMKTModalFlag = false;

      let myIndex = 1000;
      // 如果没有改变类型，activeDates不添加数据
      if (this.mktType || this.remarksMsg) {
        for (let item in this.activeDates) {
          if (this.activeDates[item].date == this.lsDateInfo.date) {
            myIndex = item;
          }
        }
        if (myIndex == 1000) {
          this.activeDates.push({
            date: this.lsDateInfo.date,
            selected: true,
            className: this.mktType,
            comments: this.remarksMsg,
            holidayId: ""
          });
        } else {
          this.activeDates.splice(myIndex, 1, {
            date: this.lsDateInfo.date,
            selected: true,
            className: this.mktType,
            comments: this.remarksMsg,
            holidayId: this.activeDates[myIndex].holidayId
          });
        }
      }
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
          this.remarksMsg = value.comments;
        }
      });
    },
    setMarkId(str) {
      this.getMarkId = str;
    },

    // 详情页数据
    getList() {
      let data = {
        "market-id": this.getListDate.marketCode,
        "year-id": this.getListDate.year
      };
      this.$http.get("holidays", { params: data, root: "CORE" }).then(res => {
        if (res.body.code == 0) {
          this.singleData = res.body.data[0];
          for (let item of this.markList) {
            if (item.dicCode == this.singleData.marketCode) {
              this.singleData.marketCode = item.dicName;
            }
          }

          res.body.data.forEach(value => {
            this.activeDates.push({
              date: new Date(value.day).Format("yyyy-MM-dd"),
              className: value.dayType,
              comments: value.comments,
              holidayId: value.holidayId
            });
          });
        }
      });
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
              comments: value.comments
            });
          });
          this.activeDates = lsData;
        }
      });
    }
  },
  created() {
    this.getDayType();
    this.getMKT();
    this.getListDate = this.$route.query;
    this.year = this.getListDate.year;
    this.getList();
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

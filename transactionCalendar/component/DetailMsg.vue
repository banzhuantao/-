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
        :isCalenderIn="isCalenderIn"
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
    <div slot="footer" class="footerBtn" v-if="isCalenderIn">
      <Button type="error" @click="onCancel">关闭</Button>
    </div>
    <div slot="footer" class="footerBtn" v-if="isTaskIn">
      <Button type="primary" @click="confirmTask">审核</Button>
      <Button type="error" @click="concalTask">关闭</Button>
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
          <Input disabled style="width: 100%" v-model="showDeatilMsg_Modal.className" />
        </FormItem>
        <FormItem label="备注:" style="width: 70%;">
          <textarea cols="33" rows="2" v-model="showDeatilMsg_Modal.comments" disabled></textarea>
        </FormItem>
      </Form>

      <div slot="footer" class="footerBtn">
        <Button type="error" @click="cancelChangeMKTModal">关闭</Button>
      </div>
    </Modal>
  </div>
</template>

<script>
import YearCalendar from "./YearCalendar_Detail";
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
      // mktType: "",
      // 备注信息
      remarksMsg: "",
      showChangeMKTModalFlag: false,
      calenderDescribe: [],

      // 临时存放dateInfo,用于点击时修改数据
      lsDateInfo: null,
      getMarkId: "TIF",

      // 模态框详细信息
      showDeatilMsg_Modal: {},

      getListDate: null,
      singleData: {},

      // dayTypeList: []
      markList: [],

      // 交易日历主页进入的页面状态
      isCalenderIn: false,
      // 任务领取页面进入状态
      isTaskIn: false,

      // 页面右侧参考
      colorReference: []
    };
  },
  methods: {
    // 日期点击事件
    toggleDate(dateInfo) {
      this.lsDateInfo = dateInfo;
      this.showChangeMKTModal();
    },

    onCancel() {
      let setSearchMsg = JSON.parse(JSON.stringify(this.getListDate.searchMsg));
      this.$router.push({
        name: "transCalendar",
        params: {
          searchMsg: setSearchMsg
        }
      });
    },
    cancelChangeMKTModal() {
      this.showChangeMKTModalFlag = false;

      this.calenderDescribe.forEach(value => {
        if (value.dicName == this.showDeatilMsg_Modal.className) {
          this.showDeatilMsg_Modal.className = value.dicCode;
        }
      });
      this.showDeatilMsg_Modal = {};
    },
    showChangeMKTModal() {
      this.showChangeMKTModalFlag = true;

      this.activeDates.forEach(value => {
        if (value.date == this.lsDateInfo.date) {
          this.showDeatilMsg_Modal = value;
        }
      });
      this.calenderDescribe.forEach(value => {
        if (value.dicCode == this.showDeatilMsg_Modal.className) {
          this.showDeatilMsg_Modal.className = value.dicName;
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
          this.singleData.createTime = new Date(
            this.singleData.createTime
          ).Format("yyyy-MM-dd");
          this.singleData.reviewTime = new Date(
            this.singleData.reviewTime
          ).Format("yyyy-MM-dd");
          res.body.data.forEach(value => {
            this.activeDates.push({
              date: new Date(value.day).Format("yyyy-MM-dd"),
              className: value.dayType,
              comments: value.comments
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

    // 任务领取页面进入相关方法
    concalTask() {
      this.$router.push({
        name: "taskSelect"
      });
    },

    confirmTask() {
      this.$Modal.confirm({
        title: " ",
        content: "请确认数据审核无误",
        onOk: () => {
          this.getListDate.year = this.getListDate.year.toString();
          this.$http
            .post(
              "holidays/" +
                this.getListDate.year +
                "/" +
                this.getListDate.marketCode +
                "/review/task/" +
                this.getListDate.taskId,
              {},
              {
                root: "CORE",
                timeout: 0
              }
            )
            .then(res => {
              this.$Notice.success({
                desc: "成功"
              });
              this.$router.push({
                name: "taskSelect"
              });
            });
        }
      });
    }
  },
  created() {
    this.getDayType();
    this.getMKT();

    if (!this.$route.query.taskId) {
      this.year = this.$route.query.year;
      this.isCalenderIn = true;
      this.getListDate = this.$route.query;
      this.getList();
    } else if (this.$route.query.taskId) {
      this.isTaskIn = true;

      let taskId = this.$route.query.taskId;
      let businessData = {};

      this.$http.get("task/" + taskId).then(res => {
        if (res.data.code == 0) {
          businessData = JSON.parse(res.body.data.businessData);

          this.year = businessData.year;

          this.getListDate = {
            marketCode: businessData.mkt,
            year: businessData.year,
            taskId: taskId
          };
          this.getList();
        }
      });
    }
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

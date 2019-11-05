<template>
  <div class="float-e-margins">
    <div class="titleAll ibox-title">
      <h5 class="titleAll">公用信息管理/节假日管理/节假日维护</h5>
    </div>
    <div class="ibox-content example">
      <Form ref="createForm" :label-width="113" inline style="margin-top:20px;">
        <Button @click="searchMethod" style="margin-right: 8px;">
          <Icon type="md-sync" size="12" />
        </Button>
        <DatePicker
          type="year"
          v-model="searchMsg.yearId"
          style="width:150px;margin-right:8px;"
          @on-change="searchMethod"
          @on-clear="searchMethod"
          placeholder="请选择所属年份"
        ></DatePicker>
        <Select
          style="width:150px;margin-right:8px;"
          :clearable="true"
          :filterable="true"
          placeholder="请选择交易市场"
          v-model="searchMsg.marketId"
          @on-change="searchMethod"
        >
          <Option
            v-for="(item, index) of markList"
            :value="item.dicCode"
            :key="index"
          >{{ item.dicName }}</Option>
        </Select>
        <Select
          style="width:150px;margin-right:8px;"
          :clearable="true"
          :filterable="true"
          placeholder="请选择审核状态"
          v-model="searchMsg.checkStatus"
          @on-change="searchMethod"
        >
          <Option v-for="(item, index) of yesOrNo" :value="item.code" :key="index">{{ item.name }}</Option>
        </Select>
        <Button type="primary" style="margin-right:8px;" @click="searchMethod">查询</Button>
        <Button type="error" @click="restSearchParam">重置</Button>
      </Form>

      <div class="showInput">
        <Button type="primary" @click="toDetailMsg">详细信息</Button>
        <Button type="primary" @click="toAddModal">新增</Button>
        <Button type="primary" @click="toModify">修改</Button>
        <Button type="primary" @click="showCounterAuditModal">反审核</Button>
        <Button type="primary" @click="exportCurrentMsg">导出</Button>
        <Button type="error" @click="deleteCurrentMsg">删除</Button>
      </div>

      <Table border :columns="mainTableColumns" :data="mainTableData" ref="selection"></Table>
      <Table
        border
        :columns="exportColumns"
        :data="exportData"
        ref="exportSelection"
        style="display: none;"
      ></Table>
      <!-- v-if="exportFlag" -->
      <div class="m-tb-15">
        <Page
          :total="total"
          :page-size="pageSize"
          :current.sync="currentPage"
          v-on:on-change="changePage"
          show-total
          show-sizer
          :page-size-opts="pageSizeOpts"
          placement="top"
          @on-page-size-change="changePageSize"
          class-name="pageToolStyle"
        ></Page>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      searchMsg: {
        yearId: "0",
        marketId: "",
        checkStatus: ""
      },
      currentYear: "",
      markList: [],
      yesOrNo: [
        {
          code: "Y",
          name: "已审核"
        },
        {
          code: "N",
          name: "待审核"
        }
      ],
      currentId: "",

      mainTableData: [],
      mainTableColumns: [
        {
          title: " ",
          width: 42,
          key: "chose",
          align: "center",
          render: (h, params) => {
            let id = params.index;
            let defaultS = false;
            if (this.currentId === id) {
              defaultS = true;
            } else {
              defaultS = false;
            }
            let self = this;
            return h("div", [
              h("Radio", {
                props: {
                  value: defaultS
                },
                on: {
                  "on-change": () => {
                    self.currentId = id;
                    this.holidayId = params.index;
                    this.getSelectData(params.row);
                  }
                }
              })
            ]);
          }
        },
        {
          title: "所属年份",
          key: "year",
          align: "center"
        },
        {
          title: "交易市场",
          key: "marketCode",
          align: "center"
        },
        {
          title: "审核状态",
          key: "checkStatus",
          align: "center"
        },
        {
          title: "制作人",
          key: "createUser",
          align: "center"
        },
        {
          title: "制作时间",
          key: "createTime",
          align: "center"
        },
        {
          title: "审核人",
          key: "reviewer",
          align: "center"
        },
        {
          title: "审核时间",
          key: "reviewTime",
          align: "center"
        }
      ],
      pageSize: 5,
      pageSizeOpts: [5, 10, 20, 50],
      currentPage: 1,
      total: 0,
      offset: 1,

      selectData: {},
      // 导出页面
      dayTypeList: [],
      exportFlag: false,
      exportData: [],
      exportColumns: [
        {
          title: "交易市场",
          key: "marketCode"
        },
        {
          title: "日期",
          key: "day"
        },
        {
          title: "审核状态",
          key: "checkStatus"
        },
        {
          title: "制作人",
          key: "createUser"
        },
        {
          title: "制作时间",
          key: "createTime"
        },
        {
          title: "审核人",
          key: "reviewer"
        },
        {
          title: "审核时间",
          key: "reviewTime"
        },
        {
          title: "节假日类型",
          key: "dayType"
        },
        {
          title: "备注",
          key: "comments"
        }
      ]

      // getListDate: null
    };
  },
  methods: {
    //搜索
    searchMethod() {
      // if (this.searchMsg.yearId) {
      //   this.searchMsg.yearId = new Date(this.searchMsg.yearId).Format("yyyy");
      // } // 导致清空年份数据需要两次点击
      this.getMainTableData();
    },
    //重置
    restSearchParam() {
      this.searchMsg = {
        yearId: this.currentYear,
        marketId: "TIF",
        checkStatus: "Y"
      };
      this.pageSize = 5;
      this.pageNum = 1;
      this.getMainTableData();
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

          this.setSearchMsg();
        });
    },

    setSearchMsg() {
      let listDate = null;
      if (this.$route.params.searchMsg) {
        listDate = JSON.parse(this.$route.params.searchMsg);
      }
      if (listDate) {
        this.searchMsg = listDate;
        if (this.searchMsg.yearId == "NAN") {
          this.searchMsg.yearId = "0";
        }
        this.searchMethod();
      } else {
        this.searchMsg = {
          yearId: this.currentYear,
          marketId: "TIF",
          checkStatus: "Y"
        };
        this.searchMethod();
      }
    },

    // 详情页面
    toDetailMsg() {
      if (this.selectData.year) {
        this.markList.forEach(value => {
          if (value.dicName == this.selectData.marketCode) {
            this.selectData.marketCode = value.dicCode;
          }
        });
        let postMsg = JSON.stringify({
          yearId: new Date(this.searchMsg.yearId).Format("yyyy"),
          marketId: this.searchMsg.marketId,
          checkStatus: this.searchMsg.checkStatus
        });
        this.$router.push({
          name: "calendarDetail",
          query: {
            year: this.selectData.year,
            marketCode: this.selectData.marketCode,
            holidayId: this.selectData.holidayId,
            searchMsg: postMsg
          }
        });
      } else {
        this.$Notice.warning({
          desc: "请选择一条节假日数据"
        });
      }
    },
    // 新增页面
    toAddModal() {
      this.$router.push({ name: "calendarAdd" });
    },

    // 修改页面
    toModify() {
      if (this.selectData.checkStatus) {
        if (this.selectData.checkStatus == "待审核") {
          this.markList.forEach(value => {
            if (value.dicName == this.selectData.marketCode) {
              this.selectData.marketCode = value.dicCode;
            }
          });
          this.$router.push({
            name: "calendarModify",
            query: {
              year: this.selectData.year,
              marketCode: this.selectData.marketCode
            }
          });
        } else {
          this.$Notice.warning({
            desc: "请确认选择数据审核状态为待审核"
          });
        }
      } else {
        this.$Notice.warning({
          desc: "请选择一条节假日数据"
        });
      }
    },

    // 反审核
    showCounterAuditModal() {
      if (this.selectData.checkStatus) {
        if (this.selectData.checkStatus == "已审核") {
          this.$Modal.confirm({
            title: " ",
            content: "是否确认将该审核状态置为待审核",
            onOk: () => {
              for (let markItem of this.markList) {
                if (this.selectData.marketCode == markItem.dicName) {
                  this.selectData.marketCode = markItem.dicCode;
                }
              }
              this.$http
                .post(
                  "holidays/" +
                    this.selectData.year +
                    "/" +
                    this.selectData.marketCode +
                    "/anti-review",
                  {},
                  {
                    root: "CORE"
                  }
                )
                .then(res => {
                  if (res.body.code == 0) {
                    this.searchMethod();
                    this.currentId = "";
                    this.$Notice.success({
                      desc: "成功"
                    });
                  }
                });
            }
          });
        } else {
          this.$Notice.warning({
            desc: "请确认选择数据审核状态为已审核"
          });
        }
      } else {
        this.$Notice.warning({
          desc: "请选择一条节假日数据"
        });
      }
    },
    // 删除
    deleteCurrentMsg() {
      if (this.selectData.year) {
        this.$Modal.confirm({
          title: " ",
          content: "是否确认删除此条信息",
          onOk: () => {
            for (let markItem of this.markList) {
              if (this.selectData.marketCode == markItem.dicName) {
                this.selectData.marketCode = markItem.dicCode;
              }
            }
            this.$http
              .delete(
                "holidays/" +
                  this.selectData.year +
                  "/" +
                  this.selectData.marketCode,
                { root: "CORE" }
              )
              .then(res => {
                if (res.body.code == 0) {
                  this.searchMethod();
                  this.currentId = "";
                  this.$Notice.success({
                    desc: "删除成功"
                  });
                }
              });
          }
        });
      } else {
        this.$Notice.warning({
          desc: "请选择一条节假日数据"
        });
      }
    },
    // 导出
    exportCurrentMsg() {
      let lsCode = this.selectData.marketCode;
      let lsName = "";
      for (let item of this.markList) {
        if (this.selectData.marketCode == item.dicName) {
          lsName = item.dicCode;
        }
      }
      if (this.selectData.year) {
        this.$Modal.confirm({
          title: " ",
          content: "是否确认导出此年份市场信息",
          onOk: () => {
            let data = {
              "market-id": lsName,
              "year-id": this.selectData.year
            };
            this.$http
              .get("holidays", { params: data, root: "CORE" })
              .then(res => {
                if (res.body.code == 0) {
                  let lsData = res.body.data;

                  for (let item of lsData) {
                    item.marketCode = lsCode;
                    for (let statusItem of this.yesOrNo) {
                      if (item.checkStatus == statusItem.code) {
                        item.checkStatus = statusItem.name;
                      }
                    }
                    for (let dayTypeItem of this.dayTypeList) {
                      if (dayTypeItem.dicCode == item.dayType)
                        item.dayType = dayTypeItem.dicName;
                    }
                    item.createTime = new Date(item.createTime).Format(
                      "yyyy-MM-dd hh:mm:ss"
                    );
                    item.reviewTime = new Date(item.reviewTime).Format(
                      "yyyy-MM-dd hh:mm:ss"
                    );
                    item.day = new Date(item.day).Format("yyyy-MM-dd");
                    this.exportData.push({
                      marketCode: item.marketCode,
                      day: item.day,
                      checkStatus: item.checkStatus,
                      createUser: item.createUser,
                      createTime: item.createTime,
                      reviewer: item.reviewer,
                      reviewTime: item.reviewTime,
                      dayType: item.dayType,
                      comments: item.comments
                    });
                  }
                  setTimeout(() => {
                    this.$refs.exportSelection.exportCsv({
                      filename: this.selectData.year + "--" + lsCode
                    });
                  }, 0);
                }
              });
          }
        });
        this.exportData = [];
      } else {
        this.$Notice.warning({
          desc: "请选择一条节假日数据"
        });
      }
    },
    // 主页表格数据
    getMainTableData() {
      this.currentId = "";

      let data = {
        year: new Date(this.searchMsg.yearId).Format("yyyy"),
        checkStatus: this.searchMsg.checkStatus,
        marketCode: this.searchMsg.marketId,
        page: true,
        pageNum: this.currentPage,
        pageSize: this.pageSize
      };
      if (data.year == "NaN") {
        data.year = "";
      }
      this.$http
        .get("holidays/year/marketId", { params: data, root: "CORE" })
        .then(res => {
          for (let resItem of res.body.data.list) {
            for (let markItem of this.markList) {
              if (resItem.marketCode == markItem.dicCode) {
                resItem.marketCode = markItem.dicName;
              }
            }
            for (let checkItem of this.yesOrNo) {
              if (resItem.checkStatus == checkItem.code) {
                resItem.checkStatus = checkItem.name;
              }
            }

            resItem.createTime = new Date(resItem.createTime).Format(
              "yyyy-MM-dd"
            );
            resItem.reviewTime = new Date(resItem.reviewTime).Format(
              "yyyy-MM-dd"
            );
          }
          this.total = res.body.data.total;
          this.mainTableData = res.body.data.list;
        });
    },
    // 分页
    changePage(page) {
      this.currentPage = page;
      this.offset = this.pageSize * (page - 1) + 1;
      this.getMainTableData();
    },
    changePageSize(pageSize) {
      this.currentPage = 1;
      this.pageSize = pageSize;
      this.offset = pageSize * (this.currentPage - 1) + 1;
      this.getMainTableData();
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
          this.dayTypeList = res.body.data;
        });
    },

    // 选择
    getSelectData(data) {
      this.selectData = JSON.parse(JSON.stringify(data));
    }
  },
  created() {
    // 获取当前年份数据
    // this.getListDate = this.$route.params;

    let d = new Date();
    this.currentYear = new Date(d).Format("yyyy");
    // 获取市场数据
    this.getMKT();
    // 获取日期类型数据
    this.getDayType();
  }
};
</script>

<style lang="less" scoped>
.showInput {
  margin-top: 50px;
  button {
    margin-right: 10px;
  }
}
</style>
此仓库用于存储插件

1. LunarCalendar.js   --    获取农历日期；


2. memoryStrorage.js -- 存储；
用法： 
    window.memoryStorage.getItem("TOKEN")
    window.memoryStorage.setItem("TOKEN",token)
    window.memoryStorage.clear();
 配置：
    在main.js里 配置 import memory  from '路径/memoryStrorage';
    window.memoryStorage = memory();


3. utils.js -- 格式化日期 + 加减乘除；
配置：
    main.js --- Date.prototype.Format = Utils.Format;

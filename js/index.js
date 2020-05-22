// 数据
let data = {
  id: "7",
  imgs: [
    {
      index: "0",
      imgsrc: "images/data/15641034359142t9.PNG",
      hotspot: [
        {
          title: "aa",
          x: 40,
          y: 50,
          html: "<p>aa</p>",
        },
      ],
    },
    {
      index: "1",
      imgsrc: "images/data/1564103435916gdq.PNG",
    },
    {
      index: "2",
      imgsrc: "images/data/1564103435918yaw.PNG",
    },
    {
      index: "3",
      imgsrc: "images/data/1564103435919qyo.PNG",
    },
    {
      index: "4",
      imgsrc: "images/data/156410343592039i.PNG",
    },
    {
      index: "5",
      imgsrc: "images/data/15641034359227mw.PNG",
    },
    {
      index: "6",
      imgsrc: "images/data/1564103435924dwd.PNG",
    },
    {
      index: "7",
      imgsrc: "images/data/156410343592609p.PNG",
    },
  ],
  name: "test",
  view_num: "60",
  pk_user_main: "1232",
  thumb_path:
    "//www.zhzgvr.com/storage/1232/obj3d/20190919/1568857503647y21.PNG",
  create_time: "2019-09-19 09:45:36",
  flag_publish: "1",
};

// 从后台获取数据
fetch("/data/data.json", {
  method: "POST",
  body: objectToUrlParams({
    act: "get",
  }),
  headers: {
    "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
  },
})
  .then((res) => {
    if (res.status == 200) {
      return res.json();
    }
  })
  .then((res) => {
    if (res && res.imgs && res.imgs.length > 0) {
      data = res;
      init(); // 执行初使化
    }
  });

let isShowImageText = false; // 已显示图文
// 初使化函数
function init() {
  let loaded = false;
  // 设置图片占比
  {
    let width = 1000;
    let ratio = window.innerWidth / width;
    let elImgsUl = document.querySelector("#imgsUl");
    elImgsUl.style.width = ratio * 80 + "%";
    elImgsUl.style.height = ratio * 80 + "%";
  }
  // 设置图片列表
  {
    let liStr = "";
    let totalImages = data.imgs.length;
    // 提前加载图片以关闭加载动画
    data.imgs.map((item) => {
      let imgEl = new Image();
      imgEl.src = item.imgsrc;
      imgEl.addEventListener("load", (e) => {
        if (--totalImages <= 0) {
          document.querySelector("#loading").style.display = "none";
          loaded = true;
        }
        imgEl = null;
      });
    });
    data.imgs.map((item, index) => {
      let hotspot = "";
      if (item.hotspot && item.hotspot.length > 0) {
        item.hotspot.map((item2, index2) => {
          hotspot += `<div class="hotspot" style="left:${item2.x}%;top:${item2.y}%;"> 
        <div class="title" onclick="clickHotspot(${index},${index2})">${item2.title}</div> 
        <div class="icon" onclick="clickHotspot(${index},${index2})"> 
            <img src="images/point.png" alt=""> 
        </div> 
    </div> `;
        });
      }
      liStr += `<li class="${index == 0 ? "show" : ""}">
        <img class="img" src="${item.imgsrc}" alt="" draggable="false"> 
        ${hotspot}
    </li>`;
    });
    document.querySelector("#imgsUl").innerHTML = liStr;
  }
  //   鼠标滚轮事件
  {
    // 滚轮事件
    document.addEventListener("mousewheel", (e) => {
      let imgsUlEl = document.querySelector("#imgsUl"); //当前显示的元素
      let width = parseFloat(imgsUlEl.style.width) || 0;
      let height = parseFloat(imgsUlEl.style.height) || 0;
      let step = 0.3;
      let minWidth = 10;
      let afterWidth = 0;
      let afterHeight = 0;

      if (e.deltaY > 0) {
        afterWidth = width * (1 - step);
        afterHeight = height * (1 - step);
        if (afterWidth < minWidth) {
          afterWidth = minWidth;
          afterHeight = minWidth;
        }
      } else {
        afterWidth = width * (1 + step);
        afterHeight = height * (1 + step);
      }
      imgsUlEl.style.width = afterWidth + "%";
      imgsUlEl.style.height = afterHeight + "%";
    });
  }
  //   旋转
  {
    let startX = -1;
    document.addEventListener("mousedown", funStart);
    document.addEventListener("mousemove", funMove);
    document.addEventListener("mouseup", funEnd);

    // 开始时
    function funStart(e) {
      if (e.which == 1) {
        startX = e.pageX;
      } else if (e.targetTouches && e.touches.length == 1) {
        startX = e.targetTouches[0].pageX;
      } else {
        startX = -1;
      }
    }
    // 移动时
    function funMove(e) {
      let currentX =
        e.targetTouches && e.touches.length == 1
          ? e.targetTouches[0].pageX
          : e.pageX;
      if (startX >= 0 && Math.abs(currentX - startX) > 10) {
        if (currentX - startX > 0) {
          toggleImage("prev");
        } else {
          toggleImage();
        }
        startX = currentX;
      }
    }
    // 结束时
    function funEnd(e) {
      startX = -1;
    }
  }
  // 图文
  {
    // 关闭图文
    document.querySelector("#closeModalMask").addEventListener("click", (e) => {
      imageTextEl.style.display = "none";
      isShowImageText = false;
    });
  }
  // 右键拖动
  {
    let startX = -1;
    let startY = -1;
    let imgsUlEl = document.querySelector("#imgsUl");
    let marginTop = 0;
    let marginLeft = 0;

    // 屏蔽页面右键
    document.oncontextmenu = () => false;

    document.addEventListener("mousedown", (e) => {
      if (e.which == 3) {
        startX = e.pageX;
        startY = e.pageY;
        marginTop = parseFloat(imgsUlEl.style.marginTop) || 0;
        marginLeft = parseFloat(imgsUlEl.style.marginLeft) || 0;
      }
    });
    document.addEventListener("mousemove", (e) => {
      if (startX >= 0 || startY >= 0) {
        let diffX = e.pageX - startX;
        let diffY = e.pageY - startY;
        imgsUlEl.style.marginTop = marginTop + diffY + "px";
        imgsUlEl.style.marginLeft = marginLeft + diffX + "px";
      }
    });
    document.addEventListener("mouseup", (e) => {
      startX = -1;
      startY = -1;
    });
  }
  // 自动旋转
  {
    let isRotate = true;
    let isBtnRotate = true;
    let timerPrevent = null;
    let hotspotEl = document.querySelectorAll(".hotspot"); // 所有热点
    let loopCount = 0;
    setInterval(() => {
      // 循环执行
      loaded && (++loopCount)>5 && !isShowImageText && isRotate && isBtnRotate && toggleImage();
    }, 1000);
    // 暂停、开始逻辑
    document.addEventListener("mousedown", stopRotate);
    document.addEventListener("mouseup", startRotate);
    document.addEventListener("touchstart", stopRotate);
    document.addEventListener("touchend", startRotate);
    for (let item of hotspotEl) {
      item.addEventListener("mouseenter", stopRotate);
      item.addEventListener("mouseleave", startRotate);
    }
    // 将要开始时
    function startRotate() {
      clearTimeout(timerPrevent);
      timerPrevent = setTimeout(() => {
        isRotate = true;
      }, 5000);
    }
    // 暂停
    function stopRotate() {
      clearTimeout(timerPrevent);
      isRotate = false;
    }
    //   点击自动旋转
    document
      .querySelector("#autoRotate")
      .addEventListener("click", function (e) {
        if (isBtnRotate) {
          this.querySelector(".icon").src = "images/btn-ani-pause.png";
          isBtnRotate = false;
          isRotate = false;
        } else {
          this.querySelector(".icon").src = "images/btn-ani-play.png";
          isBtnRotate = true;
          isRotate = true;
        }
      });
  }
  // 移动端手势
  {
    // let isTrusted = false;
    let startX = -1; // 旋转 开始位置
    let distance = -1; // 缩放 初使 距离
    let midpoint = { x: -1, y: -1 }; // 双指中点位置
    let imgsUlEl = document.querySelector("#imgsUl"); //当前显示的元素
    let marginLeft = 0;
    let marginTop = 0;
    let isMove = false; // 标记是移动
    document.addEventListener("touchstart", funStart);
    document.addEventListener("touchmove", funMove);
    document.addEventListener("touchend", funEnd);
    // 开始时
    function funStart(e) {
      if (e.touches.length == 1) {
        // 单指
        startX = e.changedTouches[0].pageX;
        distance = -1; // 屏蔽双指
        isMove = false;
      } else if (e.touches.length == 2) {
        // 双指
        let diffX = Math.abs(e.touches[0].pageX - e.touches[1].pageX);
        let diffY = Math.abs(e.touches[0].pageY - e.touches[1].pageY);
        distance = Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2)); // 开始时的距离
        midpoint = {
          x: Math.abs(e.touches[0].pageX + e.touches[1].pageX) / 2,
          y: Math.abs(e.touches[0].pageY + e.touches[1].pageY) / 2,
        };
        marginLeft = parseFloat(imgsUlEl.style.marginLeft) || 0;
        marginTop = parseFloat(imgsUlEl.style.marginTop) || 0;
        startX = -1; // 屏蔽单指
      } else {
        // 其他指数 不操作
        startX = -1;
        distance = -1;
        isMove = false;
      }
    }
    // 移动时
    function funMove(e) {
      let currentX = e.targetTouches[0].pageX; // 当前x位置
      if (startX >= 0 && Math.abs(currentX - startX) > 10) {
        if (currentX - startX > 0) {
          toggleImage("prev");
        } else {
          toggleImage();
        }
        startX = currentX;
      } else if (distance > 0) {
        // 记录了初使缩放距离
        // 开始为双指
        let diffX = Math.abs(e.touches[0].pageX - e.touches[1].pageX);
        let diffY = Math.abs(e.touches[0].pageY - e.touches[1].pageY);
        let diff =
          Math.sqrt(Math.pow(diffX, 2) + Math.pow(diffY, 2)) - distance; // 距开始的差距
        let step = 0.5;
        let minWidth = 10;
        let afterWidth = 0;
        let afterHeight = 0;
        let width = parseFloat(imgsUlEl.style.width) || 0;
        let height = parseFloat(imgsUlEl.style.height) || 0;

        // 当前中点
        let tempMidpoint = {
          x: Math.abs(e.touches[0].pageX + e.touches[1].pageX) / 2,
          y: Math.abs(e.touches[0].pageY + e.touches[1].pageY) / 2,
        };

        let moveDiff = Math.sqrt(
          Math.pow(tempMidpoint.x - midpoint.x, 2) +
            Math.pow(tempMidpoint.y - midpoint.y, 2)
        ); // 中点移动的距离

        if (moveDiff > 30) {
          // 如果双指移动距离过number
          isMove = true; // 当前操作设为移动
          imgsUlEl.style.marginLeft =
            marginLeft + (tempMidpoint.x - midpoint.x) + "px";
          imgsUlEl.style.marginTop =
            marginTop + (tempMidpoint.y - midpoint.y) + "px";
        } else if (!isMove) {
          // 不是移动时 即为缩放
          if (diff > 50) {
            // 差距大于正number
            afterWidth = width * (1 + step);
            afterHeight = height * (1 + step);
            imgsUlEl.style.width = afterWidth + "%";
            imgsUlEl.style.height = afterHeight + "%";
            distance = -1; // 结束本次缩放
          } else if (diff < -50) {
            // 差距小于负number
            afterWidth = width * (1 - step);
            afterHeight = height * (1 - step);
            if (afterWidth < minWidth) {
              afterWidth = minWidth;
              afterHeight = minWidth;
            }
            imgsUlEl.style.width = afterWidth + "%";
            imgsUlEl.style.height = afterHeight + "%";
            distance = -1; // 结束本次缩放
          }
        }
      }
    }
    // 结束时
    function funEnd(e) {
      isMove = false;
      startX = -1;
      distance = -1;
    }
  }
}

// 点击热点
let imageTextEl = document.querySelector("#modalMask");
let modalTitleEl = document.querySelector("#modalTitle");
let modalBodyEl = document.querySelector("#modalBody");
// 阻止操作㴘泡
imageTextEl.addEventListener("mousedown", (e) => {
  e.stopPropagation();
});
imageTextEl.addEventListener("touchstart", (e) => {
  e.stopPropagation();
});
function clickHotspot(imgsIndex, hotspotIndex) {
  let item = data.imgs[imgsIndex].hotspot[hotspotIndex];
  modalTitleEl.innerHTML = item.title;
  modalBodyEl.innerHTML = item.html;
  imageTextEl.style.display = "block";
  isShowImageText = true;
}

// 切换显示图片
function toggleImage(target) {
  let showEl = document.querySelector("#imgsUl li.show");
  // let nextEl = showEl.nextElementSibling;
  let nextEl = null;
  if (target == "prev") {
    nextEl =
      showEl.previousElementSibling ||
      document.querySelector("#imgsUl li:last-child");
  } else {
    nextEl =
      showEl.nextElementSibling ||
      document.querySelector("#imgsUl li:first-child");
  }
  showEl.classList.remove("show");
  nextEl.classList.add("show");
}

// 对象转Url参数
function objectToUrlParams(data) {
  let _result = [];
  for (let key in data) {
    let value = data[key];
    if (value.constructor == Array) {
      value.forEach(function (_value) {
        _result.push(key + "=" + _value);
      });
    } else {
      _result.push(key + "=" + value);
    }
  }
  return _result.join("&");
}
// 获取url参数
function GetQueryString(name) {
  let reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
  let r = window.location.search.substr(1).match(reg);
  if (r != null) return unescape(r[2]);
  return null;
}

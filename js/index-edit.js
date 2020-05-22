let data = {
  imgs: [
    {
      index: "0",
      imgsrc:
        "images/data/15641034359142t9.PNG",
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
      imgsrc:
        "images/data/1564103435916gdq.PNG",
    },
    {
      index: "2",
      imgsrc:
        "images/data/1564103435918yaw.PNG",
    },
    {
      index: "3",
      imgsrc:
        "images/data/1564103435919qyo.PNG",
    },
    {
      index: "4",
      imgsrc:
        "images/data/156410343592039i.PNG",
    },
    {
      index: "5",
      imgsrc:
        "images/data/15641034359227mw.PNG",
    },
    {
      index: "6",
      imgsrc:
        "images/data/1564103435924dwd.PNG",
    },
    {
      index: "7",
      imgsrc:
        "images/data/156410343592609p.PNG",
    },
  ]
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


// 初使化函数
function init() {
  let loaded = false;
  let isContextMenu = true;
  let isMoveHotspot = false; // 移动热点
  let toast = new ToastClass(); // 提示
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
          hotspot += `<div class="hotspot" style="left:${item2.x}%;top:${item2.y}%;" data-imgs="${index}" data-hotspot="${index2}"> 
        <div class="title">${item2.title}</div> 
        <div class="icon"> 
            <img src="images/point.png" alt="" draggable="false"> 
        </div> 
    </div> `;
        });
      }
      liStr += `<li class="${index == 0 ? "show" : ""}" data-index="${index}">
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
      // console.log(e.touches.length);
      let currentX =
        e.targetTouches && e.touches.length == 1
          ? e.targetTouches[0].pageX
          : e.pageX;
      if (!isMoveHotspot && startX >= 0 && Math.abs(currentX - startX) > 10) {
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
  // 右键拖动
  {
    let startX = -1;
    let startY = -1;
    let imgsUlEl = document.querySelector("#imgsUl");
    let marginTop = 0;
    let marginLeft = 0;

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
        isContextMenu = false; // 为移动时禁止弹出菜单
      }
    });
    document.addEventListener("mouseup", (e) => {
      startX = -1;
      startY = -1;
    });
  }
  // 拖动热点
  {
    let startX = -1;
    let startY = -1;
    let elHotspot = null;
    let left = 0;
    let top = 0;
    let newLeft = 0;
    let newTop = 0;
    let hotspotOffsetX = 0;
    let hotspotOffsetY = 0;
    let targetTagName = "";
    let elImgsUl = document.querySelector("#imgsUl");
    document.addEventListener("mousedown", (e) => {
      elHotspot = e.target.closest(".hotspot"); // 当前右键热点元素
      if (elHotspot && e.which == 1) {
        top = parseFloat(elHotspot.style.top);
        left = parseFloat(elHotspot.style.left);
        startX = e.pageX;
        startY = e.pageY;
        hotspotOffsetX = e.offsetX;
        hotspotOffsetY = e.offsetY;
        targetTagName = e.target.tagName;
        // 在拖动点在图片上时
        if (targetTagName.toLocaleLowerCase() == "img") {
          hotspotOffsetY += elHotspot.querySelector(".title").offsetHeight + 5;
          hotspotOffsetX +=
            (elHotspot.offsetWidth -
              elHotspot.querySelector(".icon").offsetWidth) /
            2;
        }
        // 将其他热点忽略
        for (let item of document.querySelectorAll(
          "#imgsUl li.show .hotspot"
        )) {
          if (
            item.getAttribute("data-hotspot") !=
            elHotspot.getAttribute("data-hotspot")
          ) {
            item.style.pointerEvents = "none";
          }
        }
        document.body.style.cursor = "move";
        elHotspot.style.pointerEvents = "none";
        isMoveHotspot = true;
      } else {
        elHotspot = null;
        startX = -1;
        startY = -1;
        isMoveHotspot = false;
      }
    });
    document.addEventListener("mousemove", (e) => {
      if (
        e.target.closest("#imgsUl") &&
        elHotspot &&
        (startX >= 0 || startY >= 0)
      ) {
        newLeft =
          ((e.offsetX + (elHotspot.offsetWidth / 2 - hotspotOffsetX)) /
            elImgsUl.offsetWidth) *
          100;
        newTop =
          ((e.offsetY + (elHotspot.offsetHeight - 10 - hotspotOffsetY)) /
            elImgsUl.offsetHeight) *
          100;
        if (newLeft > 100 || newTop > 100 || newLeft < 0 || newTop < 0) {
        } else {
          elHotspot.style.top = newTop + "%";
          elHotspot.style.left = newLeft + "%";
        }
      }
    });
    document.addEventListener("mouseup", (e) => {
      if (elHotspot) {
        let imgsIndex = elHotspot.getAttribute("data-imgs"); // 热点上标记的图处索引
        let hotspotIndex = elHotspot.getAttribute("data-hotspot"); // 热点上标记的热点索引
        data.imgs[imgsIndex].hotspot[hotspotIndex].x = newLeft;
        data.imgs[imgsIndex].hotspot[hotspotIndex].y = newTop;
        startX = -1;
        startY = -1;
        isMoveHotspot = false;
        document.body.style.cursor = "auto";
        elHotspot.style.pointerEvents = "all";
        // 将其他热点复原
        for (let item of document.querySelectorAll(
          "#imgsUl li.show .hotspot"
        )) {
          item.style.pointerEvents = "all";
        }
        elHotspot = null;
      }
    });
  }
  // 移动端手势
  {
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
        // 开始是单指 且 移动距离大于number
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
  // 添加热点
  {
    let elContextmenu = document.querySelector("#contextmenu"); // 右键元素
    let elBtnAdd = document.querySelector("#btnAdd"); // 添加按钮
    let elBtnEditor = elContextmenu.querySelector("#btnEditor"); // 编辑按钮
    let elBtnDelete = elContextmenu.querySelector("#btnDelete"); // 删除按钮
    let elCenterCenter = document.querySelector("#centerCenter"); // 编辑框
    let elHotspot = null; // 当前右键热点元素
    let imgsUlEl = document.querySelector("#imgsUl"); //当前显示的元素
    let x = 0; // 位置
    let y = 0;
    let currentHotspot = null; // 当前右键热点数据
    // 右键时
    document.querySelector("#imgsUl").addEventListener("contextmenu", (e) => {
      if (isContextMenu) {
        // 可以显示菜单
        elHotspot = e.target.closest(".hotspot"); // 当前右键热点元素
        elName = elContextmenu.querySelector(".name"); // 菜单标题
        if (elHotspot) {
          // 在热点上右键
          let imgsIndex = elHotspot.getAttribute("data-imgs"); // 热点上标记的图处索引
          let hotspotIndex = elHotspot.getAttribute("data-hotspot"); // 热点上标记的热点索引
          let hotspotObj = data.imgs[imgsIndex].hotspot[hotspotIndex]; // 获取该热点的具体数据
          currentHotspot = hotspotObj; // 设置当前热点数据
          elName.innerHTML = hotspotObj.title; // 设置标题
          elName.style.display = "block"; // 显示标题
          elBtnAdd.style.display = "none"; // 隐藏添加
          elBtnEditor.style.display = "block"; // 显示编辑
          elBtnDelete.style.display = "block"; // 显示删除
        } else {
          currentHotspot = null; // 当前热点数据置空
          elBtnAdd.style.display = "block"; // 显示添加
          elName.style.display = "none"; // 隐藏标题
          elBtnEditor.style.display = "none"; // 隐藏编辑
          elBtnDelete.style.display = "none"; // 隐藏删除
        }
        elContextmenu.style.left = e.pageX + 1 + "px"; // 设置菜单显示位置
        elContextmenu.style.top = e.pageY + 1 + "px";
        elContextmenu.classList.add("show"); // 显示菜单
        x = (e.offsetX / imgsUlEl.offsetWidth) * 100; // 计算当前位置百分比
        y = (e.offsetY / imgsUlEl.offsetHeight) * 100;
      } else {
        // 不能显示菜单时 下次就可显示
        isContextMenu = true;
      }
    });
    // 在其他地方点击时隐藏菜单
    document.addEventListener("mousedown", (e) => {
      elContextmenu.classList.remove("show");
    });
    document.addEventListener("touchstart", (e) => {
      elContextmenu.classList.remove("show");
    });

    // 屏蔽页面右键
    document.oncontextmenu = () => false;
    // 阻止鼠标单击添加㴘泡到上级
    elContextmenu.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
    elContextmenu.addEventListener("touchstart", (e) => {
      e.stopPropagation();
    });
    // 阻止在编辑框上的事件㴘泡
    elCenterCenter.addEventListener("mousedown", (e) => {
      e.stopPropagation();
    });
    elCenterCenter.addEventListener("touchstart", (e) => {
      e.stopPropagation();
    });
    // 点击添加
    elBtnAdd.addEventListener("click", (e) => {
      currentHotspot = null; // 置当前热点为空
      let elTitle = document.querySelector("#title");
      elCenterCenter.classList.add("show"); // 显示编辑
      elContextmenu.classList.remove("show"); // 隐藏菜单
    });
    // 点击编辑
    elBtnEditor.addEventListener("click", (e) => {
      let elTitle = document.querySelector("#title");
      elTitle.value = currentHotspot.title; // 设置标题
      ue.setContent(currentHotspot.html); // 设置内容
      elCenterCenter.classList.add("show"); // 显示编辑
      elContextmenu.classList.remove("show"); // 隐藏菜单
    });
    // 右键点击删除
    elBtnDelete.addEventListener("click", (e) => {
      if (elHotspot) {
        currentHotspot = null;
        let imgsIndex = elHotspot.getAttribute("data-imgs");
        let hotspotIndex = elHotspot.getAttribute("data-hotspot");
        data.imgs[imgsIndex].hotspot.splice(hotspotIndex, 1);
        // elHotspot.remove();
        renderHotsopt(imgsIndex);
      }
      elContextmenu.classList.remove("show"); // 隐藏菜单
    });
    // 关闭编辑框
    document.querySelector("#formMask").addEventListener("click", (e) => {
      elCenterCenter.classList.remove("show");
    });
    // 点击提交时
    document.querySelector("#formSubmit").addEventListener("click", (e) => {
      let elTitle = document.querySelector("#title");
      let showEl = document.querySelector("#imgsUl li.show");
      let title = elTitle.value;
      let content = ue.getContent();
      let hotspotObj = {
        title,
        x,
        y,
        html: content,
      };
      if (currentHotspot && elHotspot) {
        let imgsIndex = elHotspot.getAttribute("data-imgs");
        let hotspotIndex = elHotspot.getAttribute("data-hotspot");
        hotspotObj.x = currentHotspot.x;
        hotspotObj.y = currentHotspot.y;
        // 编辑时删除原来的
        data.imgs[imgsIndex].hotspot.splice(hotspotIndex, 1);
        elHotspot.remove();
      }
      let index = showEl.getAttribute("data-index");
      if (title.length == 0 || title.length > 50) {
        toast.show({
          text: "请输入1到100个字符以内的标题",
          duration: 1000,
        });
        return false;
      }
      if (content.length == 0) {
        toast.show({
          text: "内容不能为空",
          duration: 1000,
        });
        return false;
      }
      if (data.imgs[index].hotspot == undefined) {
        data.imgs[index].hotspot = [];
      }
      data.imgs[index].hotspot.push(hotspotObj);
      renderHotsopt(index); // 重新渲染热点数据
      // 成功后编辑内容置空
      elTitle.value = "";
      ue.setContent("");
      elCenterCenter.classList.remove("show");
    });
    // 点击保存按钮
    document.querySelector("#btnSave").addEventListener("click", (e) => {
      toast.show({
        text: "保存中",
        loading: true,
      });
      // 提交数据
      fetch("/edit/ring_around", {
        method: "POST",
        body: JSON.stringify({
          act: "editor_ring",
          data,
        }),
      })
        .then((res) => {
          if (res.status == 200) {
            toast.hide();
            return res.json();
          }
        })
        .then((res) => {
          if (res && res.status) {
            toast.show({
              text: "保存成功",
              duration: 1000,
            });
          } else {
            toast.show({
              text: "保存失败",
              duration: 1000,
            });
          }
        })
        .catch((error) => {
          toast.show({
            text: "保存失败",
            duration: 1000,
          });
        });
    });

    // 渲染热点
    function renderHotsopt(imgsIndex) {
      // 删除原有元素
      let elHotspot = document.querySelectorAll("#imgsUl li.show .hotspot");
      if (elHotspot) {
        for (item of elHotspot) {
          item.remove();
        }
      }
      let hotspot = "";
      if (
        data.imgs[imgsIndex].hotspot &&
        data.imgs[imgsIndex].hotspot.length > 0
      ) {
        data.imgs[imgsIndex].hotspot.map((item, index) => {
          hotspot += `<div class="hotspot" style="left:${item.x}%;top:${item.y}%;" data-imgs="${imgsIndex}" data-hotspot="${index}"> 
          <div class="title">${item.title}</div> 
          <div class="icon"> 
              <img src="images/point.png" alt="" draggable="false"> 
          </div> 
      </div> `;
        });
      }
      // });
      document.querySelector("#imgsUl li.show").innerHTML += hotspot;
    }
  }
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
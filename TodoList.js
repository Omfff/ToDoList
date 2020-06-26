"use strict";

//来自老师的代码--start
var $ = function(sel) {
  return document.querySelector(sel);
};
var $All = function(sel) {
  return document.querySelectorAll(sel);
};
var makeArray = function(likeArray) {
  var array = [];
  for (var i = 0; i < likeArray.length; ++i) {
    array.push(likeArray[i]);
  }
  return array;
};
//来自老师的代码--end

var guid = 0;
var CL_COMPLETED = 'completed';
var CL_SELECTED = 'selected';
var CL_HIDE = 'hidden';
var ITEM_STATE_NORMAL = 'normal';
var ITEM_STATE_NEW = 'new';
var TAB_STATE_NORMAL = 'normal';
var TAB_STATE_CHANGE = 'change';
var RANK_STATE_CHANGE = 'change';
var RANK_STATE_NORMAL = 'normal';
var RANK_DEFAULT = 'Default';
var RANK_STAR = 'By Star';
var RANK_DDL = 'By DDL';


function update() {
  model.flush();
  var data = model.data;
  var activeCount = 0;
  var starCount=0;
  var todoList = $('.todo-list');
  todoList.innerHTML = '';
  // 对每个item数据进行创建
  data.items.forEach(function(itemData, index) {
    //统计active数量 和star数量
    if(!itemData.completed) activeCount++;
    if(!itemData.isStar) starCount++;
    // 创建对应tab的todo并添加
    if (data.filter == 'All' || (data.filter == 'Active' && !itemData.completed) || (data.filter == 'Completed' && itemData.completed))
    {
      // 根据数据创建响应的dom元素
      item = createToDoItem(guid,itemData);
      // 绑定每个todo项的监听事件
      item = addListernerForTodoItem(item, itemData, index);
      // 插入
      todoList.insertBefore(item, todoList.firstChild);
      // 如果是新添加的或者更新排序，或者新tab下的则需要动画
      if(itemData.state == ITEM_STATE_NEW || data.filterState == TAB_STATE_CHANGE){
        item.style.animation = 'add-todo-item 0.25s';
        item.style.transition = 'border 0.1s';
        if(itemData.state == ITEM_STATE_NEW){
          itemData.state = ITEM_STATE_NORMAL;
        }
      }
    }
  });
  // 还原过滤信息的状态
  if(data.filterState == TAB_STATE_CHANGE){
    data.filterState = TAB_STATE_NORMAL;
  }
  // 刷新一些信息
  freshInfoDisplay(activeCount);
}


window.onload = function() {
  //初始化model层数据，该函数作为init的回调函数
  model.init(function(){
    update();
  });
  window.SwipeDelete = SwipeDelete;
  addListerForAppHeader();
  addMainContainerSlideLister();
  addListerForAppFooter();
};


function createToDoItem(guid, itemData){
  // 创建li元素
  var item = document.createElement('li');
  var id = 'item' + guid++;
  item.setAttribute('id', id);
  //已完成则添加CL_COMPLETE类标签
  if (itemData.completed) item.classList.add(CL_COMPLETED);
  // 添加todo的html内容到li元素中
  item.innerHTML = [
    '<div class="todo-li">',
      '<div class = "todo-item swipe-delete-element">',
        '<input class = "todo-finish" type = "checkbox">',
        '<div class = "todo-content">',
          '<label class = "todo-label">' + itemData.msg + '</label>',
          '<label class = "todo-time">'+ itemData.ddl.replace("T", " ") + '</label>',
        '</div>',
        '<input class = "todo-star" type = "checkbox">',
      '</div>',
      '<div class="todo-back-div" style="right:0px;">'+ '<image class="swipe-delete-btn" src="./image/clear.svg"></image>' +'</div>',
    '</div>'
  ].join('');
  return item;
}

function freshInfoDisplay(activeCount){
  var data = model.data;

  var todoInput = $('.add-todo-input');
  todoInput.value = data.msg;

  // todo剩余数量
  var completedCount = data.items.length - activeCount;
  var todoCountText = $('.todo-count');
  todoCountText.innerHTML = (activeCount || 'No') + (activeCount > 1 ? ' items' : ' item') + ' left';

  // clear button的状态
  var clearCompletedImg = $('#clear-img');
  clearCompletedImg.disabled = completedCount > 0 ? false : true;

  // 完成按钮的状态
  var completeAllBtn = $('.complete-all');
  completeAllBtn.checked = data.items.length == completedCount &&  data.items.length!=0;

  var op = $('.op-input');
  op.src = data.inputHidden? "./image/open.svg":"./image/closed.svg";

  // 输入栏的状态
  var toDoInputDiv = $('#todo-input-div');
  toDoInputDiv.style.visibility = data.inputHidden ? "hidden":"visible";
  toDoInputDiv.style.display = data.inputHidden ? "none":"block";
}


function addListerForAppHeader(){
  var data = model.data;

  // 添加一键完成或取消的监听
  var completeAll = $('.complete-all');
  completeAll.addEventListener('change', function() {
    var completed = completeAll.checked;
    data.items.forEach(function(itemData) {
      itemData.completed = completed;
    });
    update();
  }, false);

  // 开合 添加todo编辑区域 的按钮的监听
  var count = $('.op-input');
  count.addEventListener("click",function(){
    var toDoInputDiv = $('#todo-input-div');
    data.inputHidden = !data.inputHidden;
    inputHidden = data.inputHidden;
    toDoInputDiv.style.visibility = inputHidden ? "hidden":"visible";
    toDoInputDiv.style.display = inputHidden ? "none":"block";
    this.src = inputHidden? "./image/open.svg":"./image/closed.svg";
    if(!inputHidden){
      $('.add-todo-input').focus();
    }
    model.flush();
    
  });

  // 添加todo的输入框的监听
  var todoInput = $('.add-todo-input');
  var timer = $('.add-todo-date-input');
  timer.value = getCurrentTime();
  // 每次按下一个键，则记录下当前的输入框文本
  todoInput.addEventListener('keyup', function() {
    data.msg = todoInput.value;
  });
  todoInput.addEventListener('change', function() {
    model.flush();
  });
  // 回车添加
  todoInput.addEventListener('keyup', function(ev) {
    if (ev.keyCode != 13) return; // Enter
    //输入为空
    if (data.msg == '') {
      return;
    }
    //添加todo信息
    data.items.push({msg: data.msg, completed: false, isStar: false, ddl: timer.value, state:ITEM_STATE_NEW});
    //清空输入的msg，以及input框中的内容
    data.msg = '';
    update();
  }, false);
}


function addListernerForTodoItem(item, itemData, index){
  var data = model.data;

  // 完成按钮的监听
  var itemFinishBtn = item.querySelector('.todo-finish');
  itemFinishBtn.checked = itemData.completed;
  itemFinishBtn.addEventListener('change', function() {
    itemData.completed = !itemData.completed;
    update();
  }, false);

  //绑定标签文本的双击编辑修改的监听
  var todoItem = item.querySelector('.todo-item');
  addEditToDoListener(todoItem, index);

  // 置顶按钮的监听
  var itemStar = item.querySelector('.todo-star');
  itemStar.checked = itemData.isStar;
  itemStar.addEventListener('change', function(){
    console.log(itemData.msg+ " star");
    itemData.isStar = !itemData.isStar;
    if(itemData.isStar){
      data.items.push(itemData);
      data.items.splice(index,1);
    }
    update();
  })

  //滑动删除按钮的监听
  var swipeDeleteButton=item.querySelector(".swipe-delete-element");
  SwipeDelete(swipeDeleteButton,{
    direction:'left',
    distance:60,
    deleteFn:function() {
        item.style.animation = 'delete-todo-item 0.25s';
        item.addEventListener("animationend", function listener() {
          item.removeEventListener('animationend', listener);
          data.items.splice(index, 1);
          update();
      },false);
      }
  })

  return item;
}


function addListerForAppFooter(){
  var data = model.data;

  // tab的click监听事件
  var filtersTab = makeArray($All('.filters-tab li'));
  filtersTab.forEach(function(tab) {
    tab.addEventListener('click', function() {
      console.log(tab.innerHTML);
      data.filter = tab.innerHTML;
      // 全部移除selected
      filtersTab.forEach(function(t) {
        t.classList.remove(CL_SELECTED);
      });
      // 被点击的tag加上selected
      tab.classList.add(CL_SELECTED);
      data.filterState = TAB_STATE_CHANGE;
      update();
    }, false);
  });

  // rank按钮的监听
  var rankByTimeImg = $('.rank');
  var rankMenu = $("#rank-dropup-wrapper");
  rankByTimeImg.addEventListener('click', function(e) {
    //根据点击位置设定菜单栏的位置
    rankMenu.style.left = e.clientX-15 + "px";
    // 若已经显示出来则关闭
    if(rankMenu.classList.length>1){
      rankMenu.className = 'rank-dropup-wrapper'
    }else{
      rankMenu.className = 'isShow rank-dropup-wrapper'
    }
  }, false);

  // rank菜单项的监听事件
  var menuItemList = document.getElementsByClassName('rank-menu-item');
  for(var i in menuItemList){
    menuItemList[i].onclick = rankToDoItem;
  }

  // 添加清空已完成的todo的点击事件
  var clearCompleted = $('#clear-img');
  clearCompleted.addEventListener('click', function() {
    var len = data.items.length;
    for(var i=0;i<len;i++){
      //console.log(data.items[i]);
      if(data.items[i].completed){
        data.items.splice(i--,1);
        len--;
      }
    }
    update();
  }, false);
}


function rankToDoItem(e){
  var data = model.data;
  var menuItemList = $All('.rank-menu-item');
  for(var i in menuItemList){
    menuItemList[i].className = "rank-menu-item";
  }
  this.classList.add("active");
  var rankItem = this;
  var rankType = rankItem.innerHTML;
  // 根据不同rank类型进行排序
  data.items.sort(function(x, y) {
    if(x.completed != y.completed){
      return x.completed ? -1:1;
    }else{
      if(rankType == RANK_DEFAULT){
        // 日期相同 star的在前 ；同日同star，按时间排序
        if(x.ddl.split("T")[0]  == y.ddl.split("T")[0]){
          if(x.isStar != y.isStar){
            return x.isStar ? 1:-1;
          }else{
            return x.ddl.replace("T", " ") < y.ddl.replace("T", " ") ? 1:-1;
          }
        }else{
          return x.ddl.replace("T", " ") < y.ddl.replace("T", " ") ? 1:-1;
        }
      }else if(rankType == RANK_STAR){
        // 有star的在前，相同情况 ddl越近越在前
        if(x.isStar != y.isStar){
          return x.isStar ? 1:-1;
        }else{
          return x.ddl.replace("T", " ") < y.ddl.replace("T", " ") ? 1:-1;
        }
      }else{
        // 完全按DDL排序
        return x.ddl.replace("T", " ") < y.ddl.replace("T", " ") ? 1:-1;
      }
    }
  });
  data.filterState = RANK_STATE_CHANGE;
  update();
  setTimeout(function(){
    $("#rank-dropup-wrapper").className = 'rank-dropup-wrapper';
    rankItem.classList.remove("active");
  },250);
  console.log(this.innerHTML);
}


function addEditToDoListener(todoItem, itemIndex){
  //Tap, Long Tap and swipe Event
  var longTapTimer;
  var startX, startY, moveX, moveY;
  todoItem.addEventListener('touchstart', function (e) {
      console.log("todo long touch start");
      var touch = e.touches[0];
      startX = touch.pageX;
      startY = touch.pageY;
      longTapTimer = setTimeout(function () {
          editTodo(todoItem,itemIndex);
          longTapTimer = null;
      }, 500);
  });
  todoItem.addEventListener('touchend', function (e) {
      if(longTapTimer != null){
          clearTimeout(longTapTimer);
          longTapTimer = null;
      }
  });
  todoItem.addEventListener('touchmove', function (e) {
      var touch = e.touches[0];
      moveX = touch.pageX - startX;
      moveY = touch.pageY - startY;
      if((Math.abs(moveX) > 5 || Math.abs(moveY) > 5) && longTapTimer != null){
          clearTimeout(longTapTimer);
          longTapTimer = null;
      }
    });
}


function editTodo(todoItem, itemIndex) {
  var data = model.data;
  var editTodoWrapper = $('#edit-todo-wrapper');
  var editLabelInput = $('#edit-label-input');
  var dateInput = $('#edit-date-input');
  editLabelInput.value = todoItem.querySelector('.todo-label').innerHTML;
  dateInput.value = todoItem.querySelector('.todo-time').innerHTML.replace(" ", "T");

  // 点击到外边就关闭（隐藏
  editTodoWrapper.onclick = function () {
      console.log("click out side");
      editTodoWrapper.classList.add(CL_HIDE);
      update();
  };

  $('#edit-todo-dialog').addEventListener('click', function(e){
      //防止click到下层
      e.stopPropagation();
  });

  // ok 则更新todo item的信息
  $('#ok-edit-button').onclick = function (e) {
      data.items[itemIndex].msg = editLabelInput.value;
      data.items[itemIndex].ddl = dateInput.value;
      editTodoWrapper.classList.add(CL_HIDE);
      update();
      e.stopPropagation();
  };

  // 取消就关闭（隐藏
  $('#cancel-edit-button').onclick = function (e) {
      editTodoWrapper.classList.add(CL_HIDE);
      e.stopPropagation();
  };
  // 显示
  editTodoWrapper.classList.remove(CL_HIDE);
  // 必须过一点时间再focus，因为此时用户一步还在长按
  setTimeout(function () {
    editLabelInput.focus();
  }, 300);
}



function addMainContainerSlideLister(){
  var filtersTab = makeArray($All('.filters-tab li'));
  var todoContainer = $('.app-body');
  var slideDisThresh = 100;

  var moveData = {
    startX: null,
    distance: null,
    endX: null
  }

  function clearMovement() {
    moveData.startX = null;
    moveData.distance = 0;
    moveData.endX = null;
  }

  function touchStart(e) {
    console.log('outside touchStart');
    e.stopPropagation();
    clearMovement();
    moveData.startX = e.touches[0].pageX;
    closeRankMenu();
  }

  function touchMove(e) {
    console.log('outside in touchMove');
    e.stopPropagation();
    moveData.distance = e.touches[0].pageX - moveData.startX;
  }

  // 根据index来切换到不同的tab
  function switchToTab(index){
    if(index > 2 || index < 0){
      return;
    }
    console.log('switch to' + index);
    filtersTab.forEach(function(filter) {
      filter.classList.remove(CL_SELECTED);
    });
    filtersTab[index].classList.add(CL_SELECTED);
    model.data.filter = filtersTab[index].innerHTML;
    model.data.filterState = TAB_STATE_CHANGE;
    update();
  }
  // touch结束 就检测距离是否到达阈值， 到达滑动距离的阈值则切换tab
  function touchEnd(e) {
    console.log('outside in touchEnd');
    console.log('distance: ' + moveData.distance);
    e.stopPropagation();
    if (filtersTab[0].classList.contains(CL_SELECTED)) { //all
        if (moveData.distance < -slideDisThresh) { //左滑超过slideDisThresh
         switchToTab(1);
        }
    } else if(filtersTab[1].classList.contains(CL_SELECTED)) { //active
        if (moveData.distance > slideDisThresh) { //右滑超过slideDisThresh
          switchToTab(0);
        }
        if (moveData.distance < -slideDisThresh) { //左滑超过slideDisThresh
          switchToTab(2);
        }
    }else{//completed
      if (moveData.distance > slideDisThresh) { //右滑超过slideDisThresh
        switchToTab(1);
      }
    }
  }
  // todoContainer.addEventListener('touchstart', touchStart);
  // todoContainer.addEventListener('touchmove', touchMove);
  // todoContainer.addEventListener('touchend', touchEnd);
  var body = $('body');
  body.addEventListener('touchstart', touchStart);
  body.addEventListener('touchmove', touchMove);
  body.addEventListener('touchend', touchEnd);

};

function closeRankMenu(){
  // if($("#rank-dropup-wrapper").classList.length>1){
  //   $("#rank-dropup-wrapper").className = 'rank-dropup-wrapper'
  // }
}
function getCurrentTime(){
  format = "";
  var nTime = new Date();
  format += nTime.getFullYear()+"-";
  format += (nTime.getMonth()+1)<10?"0"+(nTime.getMonth()+1):(nTime.getMonth()+1);
  format += "-";
  format += nTime.getDate()<10?"0"+(nTime.getDate()):(nTime.getDate());
  format += "T";
  format += nTime.getHours()<10?"0"+(nTime.getHours()):(nTime.getHours());
  format += ":";
  format += nTime.getMinutes()<10?"0"+(nTime.getMinutes()):(nTime.getMinutes());
  format += ":00";
  return format;
} 

// 以下代码借鉴了博客 https://www.cnblogs.com/surfaces/p/8426056.html 的swipedelete，并进行了理解和一小部分的修改
function SwipeDelete(element,options) {
  var _self=this;//此时this指向实例对象    
  _self.swipeElement =element;
      
  if (typeof element === 'string') {
    _self.swipeElement =document.querySelector(element);
  }
  //取消new 关键字
  return (_self instanceof SwipeDelete)? _self.init( _self.swipeElement,options):new SwipeDelete(_self.swipeElement,options);
}
SwipeDelete.prototype = {
  constructor: SwipeDelete,

  // 合并输入的参数和默认参数
  extend: function() {
    for(var i=1; i< arguments.length; i++)
      for(var key in arguments[i])
        if(arguments[i].hasOwnProperty(key))
          //若输入参数存在该项，则覆盖掉默认参数
          arguments[0][key] = arguments[i][key];
    return arguments[0];
  },

  allowMultiple: true,

  endEvent : function() {
    var el = document.createElement("div");
    var transEndEventNames = {
      WebkitTransition: "webkitTransitionEnd",
      transition: "transitionend"
    };
    // 判断过渡事件完成的标记（根据浏览器兼容性设置）
    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return transEndEventNames[name]
      }
    }
    el = null;
    return false
  }(),

 // init函数在构造函数的时候
  init: function(element,options) {
    var _self = this;
    var options=options||{};    
    var defaults = {
      distance:80,  //滑动距离
      units:'px',  //默认单位
      touchStart:function(){},//触摸开始回调
      opened:function(){},//展开后回调
      closed:function(){},//关闭后回调
      duration:100,//关闭动画的时间毫秒
      deleteBtn:'.swipe-delete-btn',  //删除元素
      direction:'left',  //滑动方向
      deleteClose:true,  //点击删除是否 关闭
      deleteFn:function(){}  //删除事件   retuan false 不关闭  //   retuan true 关闭
     };
    // 合并参数
    _self.options=_self.extend({},defaults,options);  
    _self.swipeEvent(element,_self.options);
  },
 
  swipeEvent:function(element,options){     
    var _self=this;
    var ele=element;    
    var isMoved = false;
    var isTouched = true;
    var isScrolling = undefined;//目标对象位置
    var touchesDiff = 0;//移动距离
    var startX=0;
    //?
    var startPos={
      x : 0,
      y : 0
    };
    var scale=false;
    var isGo=false;
    var deleteBtn=ele.querySelectorAll(options.deleteBtn)[0]; //删除元素  可能是子元素   也可能同一级别 兄弟节点
    var deleteFn=options.deleteFn; //设置回调函数
    var distance=options.distance;//最大滑动距离
    var direction=options.direction;
    var deleteClose =options.deleteClose;
    var units=options.units;
    //?
    ele.setAttribute("data-lock","false");
    // 如果是button不在滑动元素里，则是隐藏在其背后，那么就要从新设置deletebtn
    if(!deleteBtn){
        deleteBtn=ele.parentNode.nodeType==1&&ele.parentNode.querySelectorAll(options.deleteBtn)[0];
        scale=true;
    };
    _self.direction = direction;      
    deleteBtn.addEventListener('click', function(event) {
      var that=this;
      var event=event;
      var target=event.target;    
      if(options.deleteClose==true){
          _self.swipeClose(ele,options);
      }
      //? 删除的回调函数为真，通过apply
      if(options.deleteFn&&options.deleteFn.apply(target,arguments)==true){
          _self.swipeClose(ele,options);
      }
      event.stopPropagation();
    });
        
    ele.addEventListener('click', function(event) {
      _self.swipeClose(ele,options);        
    });

    ele.addEventListener('touchstart', function(event) {
      console.log("swipe touch start");
      console.log(ele.getAttribute("data-lock"));
      event.stopPropagation();
      var touchs = event.touches[0]; //手指头的一个 
      if (!_self.allowMultiple) { //不允许同时  展示多个删除   
          // _self.swipeClose(ele,options)
          //return false;
      };  //不能滑动 有没有 缩进去的
      isMoved = false;
      isTouched = true;
      isScrolling = undefined;
      startPos={
        //?
        x: touchs.pageX||touchs.clientX,
        y: touchs.pageY||touchs.clientY
      };
      //?      
      ele.style.webkitTransitionDuration = ele.style.transitionDuration = "0s";
      //?
      startX=(ele.style.WebkitTransform.replace(/translateX\(/g, "").replace(/(px|rem|%)\)/g, "")) * 1||(ele.style.transform.replace(/translateX\(/g, "").replace(/(px|rem|%)\)/g, "")) * 1||0;
      //?
      if(ele.getAttribute("data-lock")=="false"){
        options.touchStart&&options.touchStart.apply(ele,arguments);
      }

      // 有可能移动过程中手指不在list-item上了
      ele.addEventListener('touchmove', function(event) {
        event.stopPropagation();
        console.log(ele.getAttribute("data-lock"));
        console.log("swipe touch move");
        var event=event||window.event;
        // 有可能一改开始就没有触摸list-item
        if (!isTouched){ 
          return;
        }
        //?多个触控点则不进行，防止影响其他手势
        if ( event.touches.length > 1 || event.scale && event.scale !== 1){
            return;
        }
        var touchs = event.changedTouches[0];     
        var movPos={
          x : touchs.pageX||touchs.clientX,
          y : touchs.pageY||touchs.clientY
        };
        //?
        if (typeof isScrolling === 'undefined') {
          // 手指在纵向移动
          isScrolling = !!( isScrolling || Math.abs(movPos.x-startPos.x) < Math.abs(movPos.y-startPos.y) );
        }
        // 到达终点   
        if (isScrolling) {
          isTouched = false;
          return;
        }
        //if (!event.defaultPrevented) {
        //阻止默认行为的发生
        //event.preventDefault();
          //  }
        _self.touchesDiff=movPos.x-startPos.x+ startX; //滑动的距离
        isMoved = true;
        if(direction=='left'){  //向左滑
          if(_self.touchesDiff>=0){
            // 大于0 说明touch点在往右移动，如果该item都没有移动过那么就不需要移动该item
            var l = isGo? Math.abs(_self.touchesDiff)*0.1:0;
            ele.style.WebkitTransform=ele.style.transform = "translateX(" + l +units+") translateZ(0)";
          }else{  
            var l = Math.abs(_self.touchesDiff);
            // item 开始移动了
            isGo=true;    
            ele.style.WebkitTransform=ele.style.transform = "translateX(" + -l +units+") translateZ(0)";
            //移动过头了
            if (l > distance) {
                //?
                if(scale){
                    l = (distance+(l-distance)*0.39);;
                }else{
                    l=distance;
                }
              // 移动回去到最大距离处
              ele.style.WebkitTransform=ele.style.transform = "translateX(" + -l +units+") translateZ(0)";
            }
          }
        }                          
      });    

      ele.addEventListener('touchend', function(event) {
        console.log(ele.getAttribute("data-lock"));
        event.stopPropagation();
        // 如果没有触摸到item上或者触摸了但是手指没有移动，则结束
        if (!isTouched||!isMoved) {
          isMoved = false;
          isTouched = false;
          return;
        }
        // 还原状态
        isMoved = false;
        isTouched = false;
        isGo=false;
        var touchs = event.changedTouches[0]; 
        var endPos={
          x : touchs.pageX||touchs.clientX,
          y : touchs.pageY||touchs.clientY,
          endTime:+new Date
        };
        var distance=options.distance;
        var direction=options.direction;
        var touchesDiff=_self.touchesDiff;
        var action="close";
        //是否关闭状态
        if(ele.getAttribute("data-lock")=='true'){
              action = 'open';
        }
        // 滑动距离太小自动返回
        if ((touchesDiff < -10 && direction === 'left') || (touchesDiff < -parseInt(distance/3) &&direction === 'left')
        ){
          if(action == 'close'){
            _self.swipeOpen(ele,options);
          }else{
            _self.swipeClose(ele,options);
            isGo=false;
            event.preventDefault();
          }
        }else{
          _self.swipeClose(ele,options);
          isGo=false;
          event.preventDefault();     
        }  
      }); 

    });  

    return this;
  },
 
  swipeClose:function(ele,options){
    var  _self=this;
    var ele= ele||_self.swipeElement;
    var options=options||_self.options;
    var fired=false;
    var endEvent=_self.endEvent;
    var units=options.units;
    var duration=Number(options.duration/1000)||100;
    var sa=0;
    var handler = function(e) {
      ele.removeEventListener(endEvent, arguments.callee, false);
      fired = true;
      handler=null;
      sa++;
      if(sa>1){return }
      ele.setAttribute("data-lock","false");
      options.closed&&options.closed.apply(ele,arguments);;          
      callback=null;  
    };
    ele.style.WebkitTransform=ele.style.transform = "translateX(-" + 0 + units+") ";
    ele.style.webkitTransitionDuration = ele.style.transitionDuration=duration+"s";
    ele.addEventListener(endEvent,handler.bind(this), false);
    setTimeout(function() {
        if (fired) {
            return
        }
        handler();
    }, parseInt(duration+25)); 
    return this;
  },

  swipeOpen:function(ele,options){
    var _self=this;
    var ele= ele||_self.swipeElement;
    var options=options||_self.options;
    var distance=options.distance;//最大滑动距离
    var units=options.units;
    var duration=Number(options.duration/1000)||100;
    var sa=0;
    var fired=false;
    var endEvent=_self.endEvent; 
    var handler = function (e) {
    ele.removeEventListener(endEvent, arguments.callee, false);
    fired=true;
    handler=null;
    sa++;
    if(sa>1){return }
    ele.setAttribute("data-lock","true");
    if(ele.getAttribute("data-lock")=="true"){
        options.opened&&options.opened.apply(ele,arguments);
    }
    };   
    if(options.direction=="left"){
      distance=distance*-1;
    }
    ele.clientLeft;
    ele.style.WebkitTransform=ele.style.transform = "translateX(" + distance + units+") ";
    ele.style.webkitTransitionDuration = ele.style.transitionDuration=duration+"s";
    ele.addEventListener(endEvent,handler.bind(this), false);
    setTimeout(function() {
    if (fired) {
        return
    }
      handler();
    }, parseInt(duration+25));  
    return this;
  }

}; 


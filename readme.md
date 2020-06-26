# ToDoList

> 1651822 欧明锋
>
> 访问：https://omf2333.github.io/ToDoList/TodoList.html
>
> Github:https://github.com/omf2333/ToDoList

## 功能实现

### 1. 基本功能

+ 新增todo：在列表上方的编辑区域设定好DDL时间（编辑区域默认情况是打开的，若用户关闭了则可点击右上角折叠按钮打开编辑区域），并输入todo的内容，然后回车即可添加；
+ 删除todo：通过向左滑动，然后点击显示出的删除图标即可删除
+ 列表显示：每当有todo项更新时，列表也会随之更新
+ todo单条完成：点击列表项最左侧的按钮，即可将改条todo状态转变为完成
+ 全部完成/取消：用户可以点击左上角的完成按钮来全部完成或者取消，完成按钮的状态也会随着完成项的数量自动改变
+ 删除已完成：用户可以点击右下角footer中的删除按钮来进行批量的删除操作（若没有完成项目，则改按钮是灰色的）
+ 保存页面状态：引入 model 层来统一数据层，来记录用户的数据，之后使用 localStorage 来实现 model 层中的 init 和 flush 这 两个 API 接口。

### 2.高级功能

+ 编辑单条todo：用户通过长按todo项，会弹出修改 Todo 项目的遮罩层与文本框供用户进行修改，若用户修改完成则点击`Ok`按钮，若用户想取消修改则点击编辑对话框的外部或者`Cancel`按钮
+ 过滤：用户可以通过
  + 点击footer中的tab标签来对当前todo进行过滤
  + 直接在todo列表的外部或者列表项缝隙通过左右滑动来切换tab
+ 置顶操纵：用户可以通过点击todo项最右侧的`star`按钮来置顶改todo项
+ 排序：用户通过点击footer中的`排序`按钮，在弹出的排序选项菜单中选择排序方式，来对todo项目进行排序
  + 其中排序方式包括：按star、ddl、默认（同日则star在前）
+ 折叠input部分：用户可以点击右上角的折叠按钮来打开或折叠编辑区域，从而能够在有限的视野中看到更多的todo项目
+ 动画：在切换tab和更新todo的排序、添加新的todo项，删除todo项都会有折叠或者展开的过渡动画



## Demo展示

<img src="./assets/newTodo.png"  style="zoom:30%;" />  <img src="./assets/edit.png" style="zoom:30%;" />

<img src="./assets/rankDDL.png" style="zoom:30%;" />  <img src="./assets/rankStar.png" style="zoom:30%;" />

<img src="./assets/delete.png" style="zoom:30%;" />  <img src="./assets/completed.png" style="zoom:30%;" />


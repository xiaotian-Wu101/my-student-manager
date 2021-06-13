/**
 *
 * @param {String} method 请求方式  不区分大小写
 * @param {String} url    请求地址  协议（http）+ 域名+ 端口号 + 路径
 * @param {String} data   请求数据  key=value&key1=value1
 * @param {Function} cb     成功的回调函数 callback: 回调函数
 * @param {Boolean} isAsync 是否异步 true 是异步  false 代表同步
 */
function ajax(method, url, data, cb, isAsync) {
    // get   url + '?' + data
    // post
    var xhr = null;
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }

    // xhr.readyState    1 - 4  监听是否有响应
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status == 200) {
                cb(JSON.parse(xhr.responseText));
            }
        }
    };
    method = method.toUpperCase();
    if (method == "GET") {
        xhr.open(method, url + "?" + data, isAsync);
        xhr.send();
    } else if (method == "POST") {
        xhr.open(method, url, isAsync);
        // key=value&key1=valu1
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
        xhr.send(data);
    }
}
var tableData=[];
var ddList = document.getElementsByClassName("ddList");
function removeClass(ddList, className) {
    for (var i = 0; i < ddList.length; i++) {
        ddList[i].classList.remove(className);

    }
}

function bindEvent() {
    var left = document.querySelector(".left");
    left.onclick = function (e) {
        var ddNode = e.target.parentNode;
        if (ddNode.tagName === 'DD') {
            removeClass(ddNode.parentNode.children, "active");
            ddNode.className = "active";
        }
    }

    var btnAdd = document.getElementById("btnAdd");
    btnAdd.onclick = function (e) {
        e.preventDefault();
        var stuForm = document.getElementById("studentForm");
        var formData = getData(stuForm);
        if (formData.status === 'success') {
            var data = formData.data;
            var dataStr = '';
            for (var prop in data) {
                dataStr += prop + '=' + data[prop] + '&';
            }
            
            transferData({
                method: "get",
                url: '/api/student/addStudent',
                data: dataStr,
                success: function (res) {
                    alert("新增成功");
                    location.hash="#studentList";
                    getTableData();
                }
            })
        } else {
            alert(formData.msg);
        }
    }



    var model=document.querySelector("#studentList .model");
    var tbody=document.querySelector("#studentList tbody");
    model.onclick=function(e){
        if(e.target===this){
            model.style.display="none";
        }
    }
    tbody.onclick=function(e){
        var index=e.target.dataset.index;
        if(e.target.tagName==="BUTTON"){
            if(e.target.classList.contains('edit')){
                renderEditForm(tableData[index]);
                model.style.display="block";
                
            }
            else{
                var student=tableData[index];
                var isDel=confirm('确认删除学号为'+ student.sNo +'的学生信息吗？');
                if(isDel){
                    transferData({
                        method:'get',
                        url:'/api/student/delBySno',
                        data:'sNo='+student.sNo+'&',
                        success:function(){
                            alert("删除成功"); 
                            getTableData();
                        }
                    })
                }
                
            }
        }
    }

    var editFormBtn=document.querySelector("#btnAddEdit");
    editFormBtn.onclick=function(e){
        e.preventDefault();
        var stuForm = document.getElementById("editStudentForm");
        var formData = getData(stuForm);
        if (formData.status === 'success') {
            var data = formData.data;
            var dataStr = '';
            for (var prop in data) {
                dataStr += prop + '=' + data[prop] + '&';
            }
            
            transferData({
                method: "get",
                url: '/api/student/updateStudent',
                data: dataStr,
                success: function (res) {
                    alert("修改成功");
                    getTableData();
                    model.style.display="none";
                }
            })
        } else {
            alert(formData.msg);
        }
    }


    var logBtn=document.querySelector(".header .log");
    logBtn.onclick=function(){
        window.location="登录.html"
    }


    var regBtn=document.querySelector(".header .reg");
    regBtn.onclick=function(){
        window.location="注册.html"
    }
   
}
bindEvent();

hashToMenu();
window.onhashchange = function () {
    hashToMenu();
}
function hashToMenu() {
    if (location.hash) {
        var locationHash = location.hash;
        var activeMenu = document.querySelector('.left dd a[href="' + locationHash + '"]');
        activeMenu.click();
        // } else {
        //     var activeMenu = document.querySelector('.left-menu dd a[href="#student-list"]');
        //     activeMenu.click();
    }
}
//获取表单信息
function getData(form) {
    var sNo = form.sNo.value;
    var name = form.name.value;
    var email = form.email.value;
    var birth = form.birth.value;
    var phone = form.phone.value;
    var address = form.address.value;
    var sex = form.sex.value;
    var result = {
        data: {},
        status: 'success',
        msg: ''
    };

    if (!sNo || !name || !email || !birth || !phone || !adress) {
        result.status = 'fail';
        result.msg = '信息填写不全，请校验后提交';
        return result;
    }
    var numReg = /^\d{4,16}$/;
    if (!numReg.test(sNo)) {
        result.status = 'fail';
        result.msg = '学号应为4-16位有效数字';
        return result;
    }
    var emailReg = /^[\w\.-_]+@[\w-_]+\.com$/;
    if (!emailReg.test(email)) {
        result.status = 'fail';
        result.msg = '邮箱格式不正确';
        return result;
    }
    var phoneReg = /^1[3456789]\d{9}$/;
    if (!phoneReg.test(phone)) {
        result.status = 'fail';
        result.msg = '邮箱格式不正确';
        return result;
    }
    if (birth < 1975 || birth > 2020) {
        result.status = 'fail';
        result.msg = '邮箱格式不正确';
        return result;
    }
    result.data = {
        sNo,
        name,
        email,
        sex,
        birth,
        phone,
        address
    }
    return result;
}

//封装一个调用AJAX的方法
/**
 * 
 * @param {Object} options
 *         method: 请求方式
 *          url: 请求路径
 *          data: 请求数据  (数据是不包含appkey的)
 *          success： 请求成功之后的回调函数  即后台成功处理我的数据的时候要做的总能
 *          
 */


function transferData(options) {
    ajax(options.method || 'GET', 'http://open.duyiedu.com' + options.url, options.data + 'appkey=return1_1611965722848',
      function (res) {
        if (res.status === 'fail') {
          alert(res.msg);
        } else {
          options.success(res.data);
        }
      }, true)
  }

function getTableData(){
    transferData({
        method:'get',
        url:'/api/student/findAll',
        data:'',
        success:function(res){
            tableData=res;
            renderTable(res);
        }
    })
}
getTableData();

function renderTable(data){
    var str=data.reduce(function(pre,ele,index){
        return pre+` <tr>
        <td>${ele.sNo}</td>
        <td>${ele.name}</td>
        <td>${ele.email}</td>
        <td>${ele.sex==0?'男':'女'}</td>
        <td>${new Date().getFullYear()- ele.birth}</td>
        <td>${ele.phone}</td>
        <td>${ele.address}</td>
        <td>
        <button id="alterBtn" class="edit" data-index="${index}">更改</button>
        <button id="deleteBtn" class="delete" data-index="${index}">删除</button>
        </td>
    </tr>`;
    },'')
    var tbody=document.querySelector("#studentList tbody");
    tbody.innerHTML=str;
}

function renderEditForm(data){
    var form=document.querySelector("#editStudentForm");
    for(var prop in data){
        if(form[prop]){
            form[prop].value=data[prop];
        }
    }
}
app = Vue.createApp({
    data() {
        return {
            currentTab: 'login',
            tabs: [
                {id:'login',name:'登录'},
                {id:'reg',name:'注册'}
            ],
            uid: null,
            usrPwd: null,
            regid: null,
            regPwd: null,
            regPwd2: null,
            message: null
        }
    },
    methods: {
        login(){
            if(this.uid == null || this.usrPwd == null) return;
            // console.log("POST uid: "+this.uid+"\npassword: "+hex_md5(this.usrPwd))
            fetch('/login_submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    uid: this.uid,
                    usrPwd: hex_md5(this.usrPwd)
                })
            })
            .then(res=>{
                if(res.redirected){
                    window.location.href = res.url;
                }
                return res.json();
            })
            .then(data=>{
                this.message = data.message;
            })
            .catch(err=>{
                console.info(err);
            });
        },
        reg() {
            if(this.regid == null || this.regPwd == null) return;
            if(this.regPwd != this.regPwd2){
                this.message = "失败！输入密码不一致";
                return;
            };
            fetch('/reg_submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    regid: this.regid,
                    regPwd: hex_md5(this.regPwd)
                })
            })
            .then(res=>res.json())
            .then(data=>{
                this.message = data.message;
            })
            .catch(err=>{
                console.info(err);
            });
        }
    }
})
app.component('notice-bar',noticeBar);
app.mount('#dynamic-tab');
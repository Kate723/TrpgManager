const logStatus = {
	data() {
		return {
            usrName: 'null'
		}
	},
	mounted:function(){
		this.getuid();//需要触发的函数
	},
	methods: {
		logout(){
			fetch('/logout')
			.then(res=>{
				if(res.redirected){
					window.location.href = res.url;
				}
			})
			.catch(err=>{
				console.info(err);
			});
		},
		getuid(){
			fetch('/getuid')
			.then(res=>res.json())
			.then(data=>{
				// console.log(data);
				this.usrName = data.uid;
			})
			.catch(err=>{
				console.info(err);
			});
		}
	}
} 
const log = Vue.createApp(logStatus);
log.mount('#vhead');
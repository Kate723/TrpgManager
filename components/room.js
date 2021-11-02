const app = Vue.createApp({
    data() {
        return {
            uid: null,
            room: {},
            c_select: false,
            view: false,
            users: [],
            chrcters: [],
            logs: [],
            chrcter: null,
            caspects: [],
            cskills: [],
            cstunts: [],
            cconqs: []
        }
    },
    mounted: function(){
        this.getuid();
        this.initRoom();
    },
    methods: {
        log_time(log_time){
            return '【'+log_time.substring(0,10) + ' ' + log_time.substring(11,19)+'】';
        },
        conq_type(cq_type){
            switch(cq_type){
                case 0:
                    return '轻度';
                case 1:
                    return '中度';
                case 2:
                    return '重度';
                default:
                    return cq_type;
            }
        },
        substring(str, len){
            if(str)
                return str.substring(0, Math.min(len, str.length));
            else
                return null;
        },
        getuid(){
			fetch('/getuid')
			.then(res=>res.json())
			.then(data=>{
				console.log(data);
				this.uid = data.uid;
			})
			.catch(err=>{
				console.info(err);
			});
		},
        initRoom(){
			fetch('/getroom')
			.then(res=>res.json())
			.then(data=>{
				console.log(data);
				this.room = data.rooms[0];
                this.fetchdata();
			})
			.catch(err=>{
				console.info(err);
			});
		},
        fetchdata(){
            fetch('/roomuser', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    room_id: this.room.room_id
                })
            })
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                this.users = data.users;
            })
            .catch(err=>{
                console.info(err);
            });
            fetch('/roomlog', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    room_id: this.room.room_id
                })
            })
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                this.logs = data.logs;
            })
            .catch(err=>{
                console.info(err);
            });
        },
        chrcterName(user){
            return user.c_name ? user.c_name : '暂无角色';
        },
        chrcterSelect(){
            if(this.c_select){
                this.c_select = false;
                return;
            }
            fetch('/userchrcter')
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                this.chrcters = data.chrcters;
                this.c_select = true;
            })
            .catch(err=>{
                console.info(err);
            });
        },
        chrcterAdd(index){
            fetch('/roomChrcterAdd', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    room_id: this.room.room_id,
                    cid: this.chrcters[index].cid
                })
            })
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                if(data.add){
                    this.fetchdata();
                    this.c_select = false;
                }
            })
            .catch(err=>{
                console.info(err);
            });
        },
        chrcterParse(index){
            if(this.view){
                this.view = false;
                return;
            }
            this.chrcter = this.users[index];
            if (!this.chrcter.aspects) this.chrcter.aspects = "[]";
            if (!this.chrcter.skills) this.chrcter.skills = "[]";
            if (!this.chrcter.stunts) this.chrcter.stunts = "[]";
            if (!this.chrcter.consequences) this.chrcter.consequences = "[]";
            this.caspects = JSON.parse(this.chrcter.aspects).filter(function (s) {return s.aid;});
            this.cskills = JSON.parse(this.chrcter.skills).filter(function (s) {return s.skid;});
            this.cstunts = JSON.parse(this.chrcter.stunts).filter(function (s) {return s.stid;});
            this.cconqs = JSON.parse(this.chrcter.consequences).filter(function (s) {return s.cqid;});
            this.view = true;
        },
        logReaded(index){
            fetch('/logReaded', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    logid: this.logs[index].logid
                })
            })
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                if (data.upd) this.logs.splice(index, 1);
            })
            .catch(err=>{
                console.info(err);
            });
        }
    }
});

app.mount('#app');
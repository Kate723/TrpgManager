const app = Vue.createApp({
    data() {
        return {
            usrName: null,
            cindex: -1,
            edit: false,
            btn_rotate: false,
            view: false,
            search: false,
            search_rname: null,
            aspect_edit: false,
            skill_edit: false,
            stunt_edit: false,
            conq_edit: false,
            select: false,
            currentTab: 'room',
            tabs: [
                {id:'room',name:'房间'},
                {id:'chrcter',name:'角色'},
                {id:'stunt',name:'特技'},
                {id:'limit',name:'要求'}
            ],
            admin_tabs: [
                {id:'skill',name:'技能'},
                {id:'cgroup',name:'角色组'}
            ],
            all_rooms: [],
            rooms: [],
            chrcters: [],
            skills: [],
            stunts: [],
            limits: [],
            cgroups: [],
            cskills: [],
            cstunts: [],
            cconqs: [],
            caspects: [],

            name: null,
            desp: null,

            skid: 0,
            stid: 0,

            skill_mode: 0,
            skill_limit: 0,
            refresh: 0,
            free_stunt: 0,
            aspect_limit: 0,

            lid: 0,
            is_pc: true,

            cgid: 0,
            high_concept: null,
            trouble: null,
            FP: 0,
            refresh: 0,
            sk_lv: 0,
            physical_stress: 0,
            psychological_stress: 0,
            a_desp: null,
            cq_type: 0,
            cq_desp: null,
            aspects_add: [],
            skills_add: [],
            stunts_add: [],
            conqs_add: [],
            aspects_delete: [],
            skills_delete: [],
            stunts_delete: [],
            conqs_delete: []
        }
    },
    // 页面加载时触发的函数
    mounted:function(){
        this.getuid();
        this.fetchroom();
        this.fetchchrcter();
        this.fetchskill();
        this.fetchstunt();
        this.fetchlimit();
        this.fetchcgroup();
    },
    computed: {
        roomNum(){ return this.rooms.length; },
        allroomNum(){ return this.all_rooms.length; },
        chrcterNum(){ return this.chrcters.length; },
        skillNum(){ return this.skills.length; },
        stuntNum(){ return this.stunts.length; },
        limitNum(){ return this.limits.length; },
        cgroupNum(){ return this.cgroups.length; },
        l_name(){ return this.limits[this.lid] ? this.limits[this.lid].l_name : '无'; },
        cg_name(){ return this.cgroups[this.cgid] ? this.cgroups[this.cgid].cg_name : '无'; },
        sk_name(){ return this.skills[this.skid] ? this.skills[this.skid].sk_name : '无'; },
    },
    methods: {
        substring(str, len){
            if(str)
                return str.substring(0, Math.min(len, str.length));
            else
                return null;
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
		},
        changeTab(tab_id){
            this.name = undefined;
            this.desp = undefined;
            this.view = false;
            this.search = false;
            this.edit = false;
            this.select = false;
            this.currentTab = tab_id;
        },
        plusClicked(){
            if(this.search){
                this.search = false;
                this.btn_rotate = false;
                this.search_rname = null;
                this.edit = false;
                this.view = false;
            } else{
                this.editMemset();
                this.edit = !this.edit;
                this.view = false;
                this.cindex = -1;
            }
        },
        fetchroom(){
            fetch('/userroom')
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                this.rooms = data.rooms;
            })
            .catch(err=>{
                console.info(err);
            });
        },
        fetchchrcter(){
            fetch('/userchrcter')
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                this.chrcters = data.chrcters;
            })
            .catch(err=>{
                console.info(err);
            });
        },
        fetchskill(){
            fetch('/userskill')
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                this.skills = data.skills;
            })
            .catch(err=>{
                console.info(err);
            });
        },
        fetchstunt(){
            fetch('/userstunt')
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                this.stunts = data.stunts;
            })
            .catch(err=>{
                console.info(err);
            });
        },
        fetchlimit(){
            fetch('/userlimit')
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                this.limits = data.limits;
            })
            .catch(err=>{
                console.info(err);
            });
        },
        fetchcgroup(){
            fetch('/usercgroup')
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                this.cgroups = data.cgroups;
            })
            .catch(err=>{
                console.info(err);
            });
        },
        itemAdd(item){
            this.edit = false;
            if(this.name == null) return;
            var url = '/'+item+'Add';
            fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    name: this.name,
                    desp: this.desp
                })
            })
            .then(res=>res.json())
            .then(data=>{
                // console.log(data);
                switch(item){
                    case 'room': this.rooms.splice(this.rooms.length, 1, data.rooms[0]);
                    case 'skill': this.skills.splice(this.skills.length, 1, data.skills[0]);
                }
            })
            .catch(err=>{
                console.info(err);
            });
            this.name = null;
            this.desp = null;
        },
        stuntAdd(){
            this.edit = false;
            if(this.name == null || this.skid == null) return;
            fetch('/stuntAdd', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    skid: this.skills[this.skid].skid,
                    name: this.name,
                    desp: this.desp
                })
            })
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                this.stunts.splice(this.stunts.length, 1, data.stunts[0]);
            })
            .catch(err=>{
                console.info(err);
            });
            this.name = null;
            this.desp = null;
            this.skid = null;
        },
        limitAdd(){
            if(this.name == null) return;
            fetch('/limitAdd', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    name: this.name,
                    skill_mode: this.skill_mode,
                    skill_limit: this.skill_limit,
                    refresh: this.refresh,
                    free_stunt: this.free_stunt,
                    aspect_limit: this.aspect_limit,
                })
            })
            .then(res=>res.json())
            .then(data=>{
                // console.log(data);
                this.limits.splice(this.limits.length, 1, data.limits[0]);
            })
            .catch(err=>{
                console.info(err);
            });
            this.edit = false;
            this.name = null;
            this.skill_mode = null;
            this.skill_limit = null;
            this.refresh = null;
            this.free_stunt = null;
            this.aspect_limit = null;
        },
        cgroupAdd(){
            if(this.name == null) return;
            let id = this.lid;
            fetch('/cgroupAdd', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    lid: this.limits[id].lid,
                    name: this.name,
                    is_pc: this.is_pc
                })
            })
            .then(res=>res.json())
            .then(data=>{
                this.cgroups.splice(this.cgroups.length, 1, {
                    cgid: data.cgroups[0].cgid, 
                    lid: this.limits[id].lid, 
                    cg_name: data.cgroups[0].cg_name, 
                    is_pc: data.cgroups[0].is_pc,
                    l_name: this.limits[id].l_name,
                    skill_mode: this.limits[id].skill_mode,
                    skill_limit: this.limits[id].skill_limit,
                    refresh: this.limits[id].refresh,
                    free_stunt: this.limits[id].free_stunt,
                    aspect_limit: this.limits[id].aspect_limit
                });
                console.log(this.cgroups);
            })
            .catch(err=>{
                console.info(err);
            });
            this.edit = false;
            this.name = null;
            this.lid = 0;
        },
        cskillAdd(){
            this.skills_add.push({
                skid: this.skills[this.skid].skid,
                sk_name: this.skills[this.skid].sk_name,
                level: this.sk_lv
            });
        },
        cstuntAdd(index){
            this.stunts_add.push({
                stid: this.stunts[index].stid,
                skid: this.stunts[index].skid,
                st_name: this.stunts[index].st_name
            });
        },
        cconqAdd(){
            this.conqs_add.push({
                cq_type: this.cq_type,
                cq_desp: this.cq_desp
            });
        },
        caspectAdd(){
            this.aspects_add.push({
                a_desp: this.a_desp
            });
        },
        chrcterSave(){
            if(this.name == null ||
                this.desp == null ||
                this.high_concept == null ||
                this.trouble == null) return;
            fetch('/chrcterSave', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    cid: this.cindex === -1 ? null : this.chrcters[this.cindex].cid,
                    room_id: this.cindex === -1 ? null : this.chrcters[this.cindex].room_id,
                    name: this.name,
                    desp: this.desp,
                    cgid: this.cgroups[this.cgid].cgid,
                    high_concept: this.high_concept,
                    trouble: this.trouble,
                    FP: this.FP,
                    refresh: this.refresh,
                    physical_stress: this.physical_stress,
                    psychological_stress: this.psychological_stress,
                    aspects_add: this.aspects_add,
                    skills_add: this.skills_add,
                    stunts_add: this.stunts_add,
                    conqs_add: this.conqs_add,
                    aspects_delete: this.aspects_delete,
                    skills_delete: this.skills_delete,
                    stunts_delete: this.stunts_delete,
                    conqs_delete : this.conqs_delete
                })
            })
            .then(res=>res.json())
            .then(data=>{
                if(this.cindex === -1)
                    this.chrcters.splice(this.chrcters.length, 1, data.chrcter[0]);
                else
                    this.chrcters[this.cindex] = data.chrcter[0];
                this.cindex = -1;
                this.edit = false;
                console.log(this.chrcters);
            })
            .catch(err=>{
                console.info(err);
            });
        }, 
        roomDelete(index){
            fetch('/roomDelete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    room_id: this.rooms[index].room_id
                })
            })
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                if (data.delete) this.rooms.splice(index, 1);
            })
            .catch(err=>{
                console.info(err);
            });
        },
        skillDelete(index){
            fetch('/skillDelete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    skid: this.skills[index].skid
                })
            })
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                if (data.delete) this.skills.splice(index, 1);
            })
            .catch(err=>{
                console.info(err);
            });
        },
        stuntDelete(index){
            console.log(index);
            console.log(this.stunts[index]);
            fetch('/stuntDelete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    stid: this.stunts[index].stid
                })
            })
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                if (data.delete) this.stunts.splice(index, 1);
            })
            .catch(err=>{
                console.info(err);
            });
        },
        limitDelete(index){
            fetch('/limitDelete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    lid: this.limits[index].lid
                })
            })
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                if (data.delete) this.limits.splice(index, 1);
            })
            .catch(err=>{
                console.info(err);
            });
        },
        cgroupDelete(index){
            fetch('/cgroupDelete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    cgid: this.cgroups[index].cgid
                })
            })
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                if (data.delete) this.cgroups.splice(index, 1);
            })
            .catch(err=>{
                console.info(err);
            });
        },
        tmpSkillDelete(index){
            this.skills_add.splice(index, 1);
        },
        cskillDelete(index){
            this.skills_delete.push(this.cskills[index].skid);
            this.cskills.splice(index, 1);
        },
        tmpStuntDelete(index){
            this.stunts_add.splice(index, 1);
        },
        cstuntDelete(index){
            this.stunts_delete.push(this.cstunts[index].stid);
            this.cstunts.splice(index, 1);
        },
        tmpConqDelete(index){
            this.conqs_add.splice(index, 1);
        },
        conqDelete(index){
            this.conqs_delete.push(this.cconqs[index].stid);
            this.cconqs.splice(index, 1);
        },
        tmpAspectDelete(index){
            this.aspects_add.splice(index, 1);
        },
        aspectDelete(index){
            this.aspects_delete.push(this.caspects[index].stid);
            this.caspects.splice(index, 1);
        },
        chrcterDelete(index){
            fetch('/chrcterDelete', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    cid: this.chrcters[index].cid
                })
            })
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                if (data.delete) this.chrcters.splice(index, 1);
            })
            .catch(err=>{
                console.info(err);
            });
        },
        chrcterParse(chrcter){
			if (!chrcter.aspects) chrcter.aspects = "[]";
            if (!chrcter.skills) chrcter.skills = "[]";
            if (!chrcter.stunts) chrcter.stunts = "[]";
            if (!chrcter.consequences) chrcter.consequences = "[]";
            this.caspects = JSON.parse(chrcter.aspects).filter(function (s) {return s.aid;});
            this.cskills = JSON.parse(chrcter.skills).filter(function (s) {return s.skid;});
            this.cstunts = JSON.parse(chrcter.stunts).filter(function (s) {return s.stid;});
            this.cconqs = JSON.parse(chrcter.consequences).filter(function (s) {return s.cqid;});
        },
        chrcterEnter(index){
            this.cindex = index;
            this.chrcterParse(this.chrcters[this.cindex]);
            this.view = true;
        },
        editMemset(){
            this.view = false;
            this.name = null;
            this.desp = null;
            this.aspect_edit = false;
            this.skill_edit = false;
            this.stunt_edit = false;
            this.conq_edit = false;
            this.select = false;
            this.cgid = 0;
            this.high_concept = null;
            this.trouble = null;
            this.FP = 0;
            this.refresh = 0;
            this.sk_lv = 0;
            this.physical_stress = 0;
            this.psychological_stress = 0;
            this.a_desp = null;
            this.cq_type = 0;
            this.cq_desp = null;
            this.aspects_add = [];
            this.skills_add = [];
            this.stunts_add = [];
            this.conqs_add = [];
            this.aspects_delete = [];
            this.skills_delete = [];
            this.stunts_delete = [];
            this.conqs_delete = [];
        },
        chrcterEdit(index){
            this.cindex = index;
            var chrcter = this.chrcters[this.cindex];
            this.chrcterParse(chrcter);
            this.name = chrcter.c_name;
            var len = this.cgroups.length;
            for(var i = 0;i < len;i++){
                if(this.cgroups[i].cgid === chrcter.cgid){
                    this.cgid = i;
                    break;
                }
            }
            this.high_concept = chrcter.high_concept;
            this.trouble = chrcter.trouble;
            this.refresh = chrcter.refresh;
            this.FP = chrcter.FP;
            this.psychological_stress = chrcter.psychological_stress;
            this.physical_stress = chrcter.physical_stress;
            this.desp = chrcter.c_description;
            this.edit = true;
            this.view = false;
        },
        editCancel(){
            this.cindex = -1;
            this.edit = false;
            this.editMemset();
        },
        roomSearch(){
            this.search = true;
            fetch('/allroom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    query: this.search_rname
                })
            })
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                this.all_rooms = data.rooms;
            })
            .catch(err=>{
                console.info(err);
            });
        },
        roomJoin(index){
            fetch('/joinroom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    room_id: this.all_rooms[index].room_id
                })
            })
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                if(data.insert)
                    this.rooms.push(this.all_rooms[index]);
            })
            .catch(err=>{
                console.info(err);
            });
        },
        roomEnter(index){
            fetch('/enterroom', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json;charset=utf-8'
                },
                body: JSON.stringify({
                    room_id: this.rooms[index].room_id
                })
            })
            .then(res=>{
                if(res.redirected){
                    window.location.href = res.url;
                }
            })
            .catch(err=>{
                console.info(err);
            });
        },
        isPC(cgid){
            var cgroup = this.cgroups.filter(function(p){
                return p.cgid === cgid;
            });
            return cgroup[0] ? cgroup[0].is_pc : false;
        },
        cgselect(index){
            this.select = false; 
            this.cgid = index;
        } 
    }
});

app.mount('#dynamic-tab');

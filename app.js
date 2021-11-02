const express = require('express');
var session = require("express-session");
const { v4: uuidv4 } = require('uuid');
var mysql = require('mysql2-promise')();
mysql.configure({
  host     : 'localhost',
  user     : 'root',
  password :  'root',
  database : 'CharacterManage'
});

var app = express();
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname));
app.use(session({
    secret: '12345',
    name: 'name',
    cookie: {maxAge: 60000},
    resave: false, 
    saveUninitialized: true,
    cookie: {
        maxAge: 30 * 3600 *1000
    },
    rolling: true
    }))
    
app.get('/', function(req, res){
    if(req.session.uid != undefined){
        res.redirect('/html/index.html');
    } else {
        res.redirect('/html/login.html');
    }
});

app.post('/login_submit', function(req, res){
    let uid = req.body.uid;
    mysql.query('SELECT * FROM user WHERE uid = \''+ uid +'\'')
    .then(results=>{
        let [rows, fields] = results;
        var usrPwd = null;
        if (rows[0] != undefined) usrPwd = rows[0].password;
        if(usrPwd === req.body.usrPwd){
            // console.log(usrPwd + '\n' + req.body.pwd);
            req.session.uid = uid;
            res.redirect('/html/index.html');
        }else {
            res.send({
                message: '失败！用户名或密码错误'
            });
        }
    })
    .catch(err=>{
        console.info(err);
    });
});

app.post('/reg_submit', function(req, res){
    var regid = req.body.regid;
    var regPwd = req.body.regPwd;
    mysql.query('SELECT * FROM user WHERE uid = \'' + regid + '\';')
    .then(results=>{
        let [rows, fields] = results;
        // console.log(rows);
        if (rows[0] != undefined) {
            res.send({
                message: '失败！用户名已存在'
            });
            return;
        }
        mysql.query('INSERT INTO user VALUES(\''+ regid +'\',\''+regid+'\', now(), \''+regPwd+'\')')
        .then(function(){
            res.send({
                message: '成功！请登录'
            });
        })
        .catch(err=>{
            console.info(err);
        });
        
    })
    .catch(err=>{
        console.info(err);
    });
});

app.get('/login_check', function(req, res){
    if(req.session.uid === undefined){
        // console.log("not login!");
        res.redirect('/html/login.html');
    }
});

app.get('/getuid', function(req, res){
    // console.log(req.session);
    res.send({
        uid: req.session.uid
    });
});

app.get('/getroom', function(req, res){
    // console.log(req.session);
    let room_id = req.session.room_id;
    var sql = 'SELECT * FROM room WHERE room_id = \'' + room_id + '\';';
    mysql.query(sql)
    .then(results=>{
        let [rows, fields] = results;
        res.send({
            rooms: rows
        })
    })
    .catch(err=>{
        console.info(err);
    });
});

app.post('/roomuser', function(req, res){
    // console.log(req.session);
    let room_id = req.body.room_id;
    var sql = 'SELECT user.uid, user.u_name, character_card.cid, character_card.cgid, character_card.cg_name, '+
        'character_card.c_name, character_card.c_description, character_card.high_concept, character_card.trouble, character_card.aspects, '+
        'character_card.FP, character_card.refresh, character_card.skills, character_card.stunts, '+ 
        'character_card.physical_stress, character_card.psychological_stress, character_card.consequences '+
        'FROM ((room_user LEFT JOIN user ON room_user.uid = user.uid) '+
        'LEFT JOIN character_card ON user.uid = character_card.uid AND character_card.room_id = room_user.room_id) '+
        'WHERE room_user.room_id = \'' + room_id + '\';';
    // console.log(sql);
    mysql.query(sql)
    .then(results=>{
        let [rows, fields] = results;
        res.send({
            users: rows
        })
    })
    .catch(err=>{
        console.info(err);
    });
});

app.post('/roomlog', function(req, res){
    // console.log(req.session);
    let room_id = req.body.room_id;
    var sql = 'SELECT * FROM chrcter_log '+
        'WHERE room_id = \'' + room_id + '\' AND readed = false ' +
        'ORDER BY log_time;';
    // console.log(sql);
    mysql.query(sql)
    .then(results=>{
        let [rows, fields] = results;
        res.send({
            logs: rows
        })
    })
    .catch(err=>{
        console.info(err);
    });
});



app.get('/userroom', function(req, res){
    let uid = req.session.uid;
    var sql = 'SELECT room.room_id AS room_id, lid, room.uid AS gmid, r_name, r_desp, u_name '+
        'FROM room,room_user,user '+
        'WHERE room.uid = user.uid AND room_user.room_id = room.room_id AND room_user.uid = \'' + uid + '\';';
    // console.log(sql);
    mysql.query(sql)
    .then(results=>{
        let [rows, fields] = results;
        res.send({
            rooms: rows
        })
    })
    .catch(err=>{
        console.info(err);
    });
});

app.post('/allroom', function(req, res){
    let query = req.body.query;
    if (query != null){
        mysql.query("SELECT room_id, lid, room.uid as gmid, r_name, r_desp, u_name FROM room, user "+
            "WHERE room.uid = user.uid AND room.r_name LIKE '%" + query + "%';")
        .then(results=>{
            let [rows, fields] = results;
            res.send({
                rooms: rows
            })
        })
        .catch(err=>{
            console.info(err);
        });
    } else {
        mysql.query('SELECT room_id, lid, room.uid as uid, r_name, r_desp, u_name FROM room, user WHERE room.uid = user.uid;')
        .then(results=>{
            let [rows, fields] = results;
            res.send({
                rooms: rows
            })
        })
        .catch(err=>{
            console.info(err);
        });
    }
});

app.get('/userskill', function(req, res){
    mysql.query('SELECT * FROM skill;')
    .then(results=>{
        let rows = results[0];
        res.send({
            skills: rows
        })
    })
    .catch(err=>{
        console.info(err);
    });
});

app.get('/userstunt', function(req, res){
    let uid = req.session.uid;
    mysql.query('SELECT * FROM stunt WHERE uid = \'' + uid + '\';')
    .then(results=>{
        let rows = results[0];
        res.send({
            stunts: rows
        })
    })
    .catch(err=>{
        console.info(err);
    });
});

app.get('/userlimit', function(req, res){
    let uid = req.session.uid;
    mysql.query('SELECT * FROM character_limit WHERE uid = \'' + uid + '\';')
    .then(results=>{
        let rows = results[0];
        res.send({
            limits: rows
        })
    })
    .catch(err=>{
        console.info(err);
    });
});

app.get('/usercgroup', function(req, res){
    mysql.query('SELECT * FROM cgroup;')
    .then(results=>{
        let rows = results[0];
        res.send({
            cgroups: rows
        })
    })
    .catch(err=>{
        console.info(err);
    });
});

app.get('/userchrcter', function(req, res){
    let uid = req.session.uid;
    mysql.query('SELECT * FROM character_card WHERE uid = \'' + uid + '\';')
    .then(results=>{
        let rows = results[0];
        res.send({
            chrcters: rows
        })
    })
    .catch(err=>{
        console.info(err);
    });
});

app.post('/roomAdd', function(req, res){
    let uid = req.session.uid;
    let r_name = req.body.name;
    let r_desp = req.body.desp;
    var id = uuidv4();
    console.log(id);
    mysql.query('INSERT INTO room VALUES(\''+id+'\', null, \''+ uid +'\', \''+r_name+'\', \''+r_desp+'\');')
    .then(function(){
        mysql.query('INSERT INTO room_user (uid, room_id) VALUES(\''+uid+'\', \''+id+'\');')
        .then(function (){
            res.send({
                rooms: [{
                    room_id: id,
                    lid: null,
                    gmid: uid,
                    r_name: r_name,
                    r_desp: r_desp
                }]
            })
        })
    })
    .catch(err=>{
        console.info(err);
    });
});

app.post('/skillAdd', function(req, res){
    let uid = req.session.uid;
    let sk_name = req.body.name;
    let description = req.body.desp;
    var id = uuidv4();
    mysql.query('INSERT INTO skill VALUES(\''+id+'\', \''+sk_name+'\', \''+description+'\')')
    .then(function(){
        res.send({
            skills: [{
                skid: id,
                uid: uid,
                sk_name: sk_name,
                description: description
            }]
        })
    })
    .catch(err=>{
        console.info(err);
    });
});

app.post('/stuntAdd', function(req, res){
    let uid = req.session.uid;
    let skid = req.body.skid;
    let st_name = req.body.name;
    let description = req.body.desp;
    var id = uuidv4();
    mysql.query('INSERT INTO stunt VALUES(\''+ id +'\', \''+ skid +'\', \'' + uid +'\', \'' + st_name+'\', \''+description+'\')')
    .then(function(){
        res.send({
            stunts: [{
                stid: id,
                skid: skid,
                uid: uid,
                st_name: st_name,
                description: description
            }]
        })
    })
    .catch(err=>{
        console.info(err);
    });
});

app.post('/limitAdd', function(req, res){
    let uid = req.session.uid;
    let name = req.body.name;
    let skill_mode = req.body.skill_mode;
    let skill_limit = req.body.skill_limit;
    let refresh = req.body.refresh;
    let free_stunt = req.body.free_stunt;
    let aspect_limit = req.body.aspect_limit;
    var id = uuidv4();
    mysql.query('INSERT INTO character_limit VALUES(\''+ id +'\', \''+ uid +'\', \'' + name +'\', \'' + skill_mode+'\', \''+skill_limit +'\', \''+ refresh +'\', \''+ free_stunt +'\', \''+ aspect_limit +'\')')
    .then(function(){
        res.send({
            limits: [{
                lid: id,
                uid: uid,
                l_name: name,
                skill_mode: skill_mode,
                skill_limit: skill_limit,
                refresh: refresh,
                free_stunt: free_stunt,
                aspect_limit: aspect_limit,
            }]
        })
    })
    .catch(err=>{
        console.info(err);
    });
});

app.post('/cgroupAdd', function(req, res){
    let uid = req.session.uid;
    let name = req.body.name;
    let lid = req.body.lid;
    let is_pc = req.body.is_pc;
    var id = uuidv4();
    mysql.query('INSERT INTO character_group VALUES(\''+ id +'\', \''+ lid +'\', \'' + name +'\',' + is_pc +')')
    .then(function(){
        res.send({
            cgroups: [{
                cgid: id,
                cg_name: name,
                is_pc: is_pc
            }]
        })
    })
    .catch(err=>{
        console.info(err);
    });
});

async function aspectAdd(cid, aspects_add){
    var a_len = aspects_add.length;
    for (var i = 0;i < a_len; i++){
        aspects_add[i].aid = uuidv4();
        var aspect = aspects_add[i];
        var id = aspect.aid;
        var sql = 'INSERT INTO aspect VALUES(\''+ id +'\', \''+ 
            cid +'\', \'' + 
            aspect.a_desp +'\');';
        console.log(sql);
        mysql.query(sql)
        .catch(err=>{
            console.info('===aspectAdd===\n'+err);
        });
    }
}

async function skillAdd(cid, skills_add){
    var sk_len = skills_add.length;
    for (var i = 0;i < sk_len; i++){
        var skill = skills_add[i];
        var sql = 'INSERT INTO character_skill VALUES(\''+ 
            skill.skid +'\', \''+ 
            cid +'\', \'' + 
            skill.level +'\')';
        console.log(sql);
        mysql.query(sql)
        .catch(err=>{
            console.info('===skillAdd==='+err);
        });
    }
}

async function stuntAdd(cid, stunts_add){
    var len = stunts_add.length;
    for (var i = 0;i < len; i++){
        var stunt = stunts_add[i];
        var sql = 'INSERT INTO character_stunt VALUES(\''+ 
            stunt.stid +'\', \''+ 
            cid +'\')';
        console.log(sql);
        mysql.query(sql)
        .catch(err=>{
            console.info('===stuntAdd==='+err);
        });
    }
}

async function conqAdd(cid, conqs_add){
    var len = conqs_add.length;
    for (var i = 0;i < len; i++){
        conqs_add[i].cqid = uuidv4();
        var conq = conqs_add[i];
        var id = conq.cqid;
        var sql = 'INSERT INTO consequence VALUES(\''+ 
            id +'\', \''+ 
            cid +'\', \''+ 
            conq.cq_type +'\', \''+ 
            conq.cq_desp +'\')';
        console.log(sql);
        mysql.query(sql)
        .catch(err=>{
            console.info('===conqAdd==='+err);
        });
    }
}

async function aspectDelete(aspects_delete){
    var len = aspects_delete.length;
    for (var i = 0;i < len; i++){
        var id = aspects_delete[i];
        var sql = 'DELETE FROM aspect WHERE aid = \''+ id +'\';';
        console.log(sql);
        mysql.query(sql)
        .catch(err=>{
            console.info('===aspectDelete==='+err);
        });
    }
}

async function cskillDelete(cid, skills_delete){
    var len = skills_delete.length;
    for (var i = 0;i < len; i++){
        var id = skills_delete[i];
        var sql = 'DELETE FROM character_skill WHERE skid = \''+ id +
            '\' AND cid = \''+ cid +'\';';
        console.log(sql);
        mysql.query(sql)
        .catch(err=>{
            console.info('===cskillDelete==='+err);
        });
    }
}

async function cstuntDelete(cid, stunts_delete){
    var len = stunts_delete.length;
    for (var i = 0;i < len; i++){
        var id = stunts_delete[i];
        var sql = 'DELETE FROM character_stunt WHERE stid = \''+ id +
            '\' AND cid = \''+ cid +'\';';
        console.log(sql);
        mysql.query(sql)
        .catch(err=>{
            console.info('===cstuntDelete==='+err);
        });
    }
}

async function conqDelete(conqs_delete){
    var len = conqs_delete.length;
    for (var i = 0;i < len; i++){
        var id = conqs_delete[i];
        var sql = 'DELETE FROM consequence WHERE cqid = \''+ id +'\';';
        console.log(sql);
        mysql.query(sql)
        .catch(err=>{
            console.info('===conqDelete==='+err);
        });
    }
}

async function chrcterUpd(cid, upd_list){
    // console.log(upd_list);
    await aspectDelete(upd_list.aspects_delete);
    await cskillDelete(cid, upd_list.skills_delete);
    await cstuntDelete(cid, upd_list.stunts_delete);
    await conqDelete(upd_list.conqs_delete);
    await aspectAdd(cid, upd_list.aspects_add);
    await skillAdd(cid, upd_list.skills_add);
    await stuntAdd(cid, upd_list.stunts_add);
    await conqAdd(cid, upd_list.conqs_add);
    console.log('===Upd Complete!===');
    return new Promise(resolve => {
        var sql = 'SELECT * FROM character_card WHERE cid = \'' + cid + '\'';
        // console.log(sql);
        mysql.query(sql)
        .then(results=>{
            resolve(results[0]);
        })
        .catch(err=>{
            console.info(err);
        });
    });
}

async function chrcterAdd(chrcter, upd_list){
	return new Promise(resolve=>{
        if (chrcter.cid == null){
            chrcter.cid = uuidv4();
            if (chrcter.room_id != null)
                {chrcter.room_id = '\'' + chrcter.room_id + '\'';}
            var insert = "INSERT INTO chrcter VALUES(\'" +
                chrcter.cid + '\', \'' +
                chrcter.uid + '\', \'' +
                chrcter.cgid + '\', ' +
                chrcter.room_id + ', \'' +
                chrcter.c_name + '\', \'' +
                chrcter.c_description + '\', \'' +
                chrcter.high_concept + '\', \'' +
                chrcter.trouble + '\', ' +
                chrcter.physical_stress + ', ' +
                chrcter.psychological_stress + ', ' +
                chrcter.FP + ', ' +
                chrcter.refresh + ');';
            console.log(insert);
            mysql.query(insert)
            .then(function(){
                console.log('insert chrcter complete!');
                chrcterUpd(chrcter.cid, upd_list)
                .then(new_chrcter=>{
                    resolve(new_chrcter);
                })
                .catch(err=>{
                    console.info(err);
                });
            })
            .catch(err=>{
                console.info(err);
            });
        } else {
            if (chrcter.room_id != null)
                {chrcter.room_id = '\'' + chrcter.room_id + '\'';}
            var update = 'UPDATE chrcter SET ' +
                'cgid = \'' + chrcter.cgid + '\', ' +
                'room_id = ' + chrcter.room_id + ', ' +
                'c_name = \'' + chrcter.c_name + '\', ' +
                'c_description = \'' + chrcter.c_description + '\', ' +
                'high_concept = \'' + chrcter.high_concept + '\', ' +
                'trouble = \'' + chrcter.trouble + '\', ' +
                'physical_stress = \'' + chrcter.physical_stress + '\', ' +
                'psychological_stress = \'' + chrcter.psychological_stress + '\', ' +
                'FP = \'' + chrcter.FP + '\', ' +
                'refresh = \'' + chrcter.refresh + '\' ' +
                'WHERE chrcter.cid = \'' + chrcter.cid + '\';'
                console.log(update);
            mysql.query(update)
            .then(async function(){
                console.log('Upd chrcter complete!');
                chrcterUpd(chrcter.cid, upd_list)
                .then(new_chrcter=>{
                    resolve(new_chrcter);
                })
                .catch(err=>{
                    console.info(err);
                });
            })
            .catch(err=>{
                console.info(err);
            });
        }
    });
}

app.post('/chrcterSave', function(req, res){
    var upd_list = {};
    upd_list.aspects_add = req.body.aspects_add;
    upd_list.skills_add = req.body.skills_add;
    upd_list.stunts_add = req.body.stunts_add;
    upd_list.conqs_add = req.body.conqs_add;
    upd_list.aspects_delete = req.body.aspects_delete;
    upd_list.skills_delete = req.body.skills_delete;
    upd_list.stunts_delete = req.body.stunts_delete;
    upd_list.conqs_delete = req.body.conqs_delete;
    var chrcter = {};
    chrcter.cid = req.body.cid;
    chrcter.uid = req.session.uid;
    chrcter.cgid = req.body.cgid;
    chrcter.room_id = req.body.room_id;
    chrcter.c_name = req.body.name;
    chrcter.c_description = req.body.desp;
    chrcter.high_concept = req.body.high_concept;
    chrcter.trouble = req.body.trouble;
    chrcter.physical_stress = req.body.physical_stress;
    chrcter.psychological_stress = req.body.psychological_stress;
    chrcter.FP = req.body.FP;
    chrcter.refresh = req.body.refresh;
    chrcterAdd(chrcter, upd_list)
    .then(new_chrcter=>{
        res.send({
            chrcter: new_chrcter
        });
    })
    .catch(err=>{
        res.send({
            delete: false
        })
        console.info(err);
    });
});

app.post('/roomDelete', function(req, res){
    let room_id = req.body.room_id;
    mysql.query('DELETE FROM room_user WHERE room_user.room_id = \''+ room_id +'\'')
    .then(function(){
        mysql.query('DELETE FROM room WHERE room.room_id = \''+ room_id +'\'')
        .then(function(){
            res.send({
                delete: true
            })
        })
        .catch(err=>{
            res.send({
                delete: false
            })
            console.info(err);
        });
    })
    .catch(err=>{
            res.send({
                delete: false
            })
            console.info(err);
        });
});

app.post('/skillDelete', function(req, res){
    let skid = req.body.skid;
    mysql.query('DELETE FROM skill WHERE skill.skid = \''+ skid +'\'')
    .then(function(){
        res.send({
            delete: true
        })
    })
    .catch(err=>{
        res.send({
            delete: false
        })
        console.info(err);
    });
});

app.post('/stuntDelete', function(req, res){
    let stid = req.body.stid;
    mysql.query('DELETE FROM stunt WHERE stunt.stid = \''+ stid +'\'')
    .then(function(){
        res.send({
            delete: true
        })
    })
    .catch(err=>{
        res.send({
            delete: false
        })
        console.info(err);
    });
});

app.post('/cgroupDelete', function(req, res){
    let cgid = req.body.cgid;
    mysql.query('DELETE FROM character_group WHERE character_group.cgid = \''+ cgid +'\'')
    .then(function(){
        res.send({
            delete: true
        })
    })
    .catch(err=>{
        res.send({
            delete: false
        })
        console.info(err);
    });
});

app.post('/limitDelete', function(req, res){
    let lid = req.body.lid;
    mysql.query('DELETE FROM character_limit WHERE character_limit.lid = \''+ lid +'\'')
    .then(function(){
        res.send({
            delete: true
        })
    })
    .catch(err=>{
        res.send({
            delete: false
        })
        console.info(err);
    });
});

app.post('/chrcterDelete', function(req, res){
    let cid = req.body.cid;
    var sql = 'DELETE FROM chrcter WHERE chrcter.cid = \''+ cid +'\''
    console.log(sql);
    mysql.query(sql)
    .then(function(){
        res.send({
            delete: true
        })
    })
    .catch(err=>{
        res.send({
            delete: false
        })
        console.info(err);
    });
});

app.post('/joinroom', function(req, res){
    let uid = req.session.uid;
    let room_id = req.body.room_id;
    var sql = 'INSERT INTO room_user VALUES (\''+ 
        uid + '\',\'' + 
        room_id + '\');'
    console.log(sql);
    mysql.query(sql)
    .then(function(){
        res.send({
            insert: true
        })
    })
    .catch(err=>{
        res.send({
            insert: false
        })
        console.info(err);
    });
});

app.post('/roomChrcterAdd', function(req, res){
    let room_id = req.body.room_id;
    let cid = req.body.cid;
    var sql = 'UPDATE chrcter SET room_id = \''+ 
        room_id + '\' WHERE cid = \'' + cid + '\';'
    console.log(sql);
    mysql.query(sql)
    .then(function(){
        res.send({
            add: true
        })
    })
    .catch(err=>{
        res.send({
            add: false
        })
        console.info(err);
    });
});

app.post('/logReaded', function(req, res){
    let logid = req.body.logid;
    var sql = 'UPDATE chrcter_log SET readed = true WHERE logid = \'' + logid + '\';'
    console.log(sql);
    mysql.query(sql)
    .then(function(){
        res.send({
            upd: true
        })
    })
    .catch(err=>{
        res.send({
            upd: false
        })
        console.info(err);
    });
});

app.post('/enterroom', function(req, res){
    let uid = req.session.uid;
    if(uid === undefined){
        // console.log("not login!");
        res.redirect('/html/login.html');
    }
    let room_id = req.body.room_id;
    req.session.room_id = room_id;
    res.redirect('/html/room.html');
});

app.get('/logout', function(req, res){
    // console.log(req.session);
    req.session.destroy();
    res.redirect('/html/login.html');
});

app.listen(8080);

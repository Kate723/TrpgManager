function loginCheck(){
    fetch('/login_check')
    .then(res=>{
        if(res.redirected){
            window.location.href = res.url;
        }
    })
    .catch(err=>{
        console.info(err);
    });
}

loginCheck();
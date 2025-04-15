const registerForm = document.getElementById('registerForm')
const regUsername = document.getElementById('regUsername')
const regEmail = document.getElementById('regEmail')
const regPassword = document.getElementById('regPassword')
const regConfirmPassword = document.getElementById('regConfirmPassword')
const registerMessage = document.getElementById('registerMessage')

// Username regular expression 
regUsername.addEventListener('input', verifyUname)
function verifyUname(){
const reg = /^[a-zA-Z0-9-_]{6,10}$/
if(!reg.test(regUsername.value)){
    registerMessage.textContent = '输入不合法,请输入6~10位'
    return false;
}
registerMessage.textContent = ''
return true
}

// Email regular expression 
regEmail.addEventListener('input', verifyEmail)
function verifyEmail(){
const reg = /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
if(!reg.test(regEmail.value)){
    registerMessage.textContent = '输入不合法,请输入正确邮箱'
    return false;
}
registerMessage.textContent = ''
return true
}

// Password regular expression 
regPassword.addEventListener('input', verifyPwd)
function verifyPwd(){
// Minimum eight characters, at least one letter and one number
const reg = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
if(!reg.test(regPassword.value)){
    registerMessage.textContent = '输入不合法,请输入至少八位数密码其中一位要是英文字母和数字'
    return false;
}
registerMessage.textContent = ''
return true
}

regConfirmPassword.addEventListener('input', confirmPwd)
function confirmPwd(){
    if(regConfirmPassword.value !== regPassword.value) {
        registerMessage.textContent = '两次密码输入不一致'
    return false;
    }
registerMessage.textContent = ''
return true
    
}
registerForm.addEventListener('submit',function(e){
e.preventDefault();
registerMessage.textContent = ''

if(!verifyUname) return
if(!verifyEmail) return
if(!verifyPwd) return
if(!confirmPwd) return
console.log('sumbited');
})




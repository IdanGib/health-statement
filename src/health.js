(function() {
    console.log('running');
    var credpage = 'https://lgn.edu.gov.il/nidp/wsfed/ep?id=EduCombinedAuthUidPwd&sid=0&option=credential&sid=0';
    var credkeys = 'helthcredskey';
    var setcred = 'setcredkey';
    var runningTime = Date.now();
    var max_runningTime = 30000;
    var currentHref = location.href;
    var creds = [
        [ '5454650', 'Education5302038' ]
    ];

    var alreadySet = localStorage.getItem(setcred);
    if(!alreadySet) {
        for(var i = 0; i < creds.length; i++) {
            var c = creds[0];
            localStorage.setItem(`${credkeys}.${i}`, JSON.stringify(c));
        }
        localStorage.setItem(setcred, true);
    }

    function checkIfAlreadyFilled() {
        var textContent =  document.body.textContent
        var c1 = textContent.includes("מולאה הצהרת בריאות");
        var d = new Date();
        var dStr = [ d.getDate(), d.getMonth() + 1 ].join('.');
        var c2 = textContent.includes(dStr);
        return c1 && c2;
    }

    function check(condition, callback, timeout) {
        timeout = timeout || 10000;
        var start = Date.now();
        var c = setInterval(function(){
            if((Date.now() - start) < timeout) {
                if(condition()) {
                    clearInterval(c);
                    callback(true);
                }
            } else {
                clearInterval(c);
                callback(false);
            }
        }, 1000);
    }

    function documentReady(callback) {
        check(function() {
            return document.readyState === 'complete';
        }, callback);
    }


    function getButtons() {
        var start = document.querySelector("input[value='מילוי הצהרת בריאות מקוונת'");
        var usercode = document.querySelector("input[placeholder='קוד משתמש']");
        var userpassword = document.querySelector("input[placeholder='סיסמה']");
        var enter = document.querySelector("button[title='כניסה']");
        var statement = document.querySelector("input[value='מילוי הצהרת בריאות']");
        var confirm = document.querySelector("input[value='אישור']");
        return {
            start,
            usercode,
            userpassword,
            enter,
            statement,
            confirm
        }
    }
    function click(button) {
        var ok = button && !button.disabled;
        if(ok) {
            button.click();
        }
        return ok;
    }


    function getCred() {
        var last = null;
        var i = 0;
        var current = null;
        do {
            current = localStorage.getItem(`${credkeys}.${i}`);
            if(current) {
                last = current;
                i++;
            }
            if(i > 200) {
                break;
            }
        } while(current);
        return {
            index: i - 1,
            cred: JSON.parse(last)
        };
    }

    function openPopup() {
        var popup = document.createElement('div');
        popup.style = `width:200px;position:absolute;z-index:16777271;padding:16px;height:150px;right:16px;
        bottom:16px;background:#333;box-shadow: 4px 0px 10px 0 rgba(0,0,0,0.5);
        display: flex;
        transition: all 0.2s;
        justify-content: center;
        border-radius: 4px;
        align-items: center;`
        var button = document.createElement('button');
        button.addEventListener('click', function() {
            localStorage.removeItem(setcred);
            console.log('click', setcred);
            if(!localStorage.getItem(setcred)) {
                popup.remove();
            }
        });
        button.style = `
        border: none;
        outline: none;
        padding: 8px 16px;
        border-radius: 4px;
        background: #fff;
        text-transform: uppercase;
        color: #333;
        font-family: monospace;
        `;
        button.textContent = 'reset';
        popup.appendChild(button);
        document.body.appendChild(popup);
        window.addEventListener('click', function(event) {
            if(!event.path.includes(popup)) {
                popup.remove();
            }
        });
    }

    documentReady(function() {   
        function run() {
            var { cred, index } = getCred();
            var filled = checkIfAlreadyFilled();
            var timeout = Date.now() - runningTime > max_runningTime;
            var stop =  timeout || filled || !cred;
            if( stop ) {
                if(ping) { clearInterval(ping); }
                console.log('timeout:', timeout);
                console.log('cred:', cred);
                console.log('filled:', filled);
                if(filled) {
                    var key = `${credkeys}.${index}`;
                    localStorage.removeItem(key);
                    console.log('remove key', key);
                    var havemore = localStorage.getItem(`${credkeys}.${index - 1}`);
                    if(havemore) {
                        window.open(currentHref, '_blank');
                    }
                }
                openPopup();
                return;
            }
            
            var {
                start,
                usercode,
                userpassword,
                enter,
                statement,
                confirm
            } = getButtons();

            var p1 = click(confirm);
            var p2 = click(statement);

            if(!p1 && !p2) {
                p3 = click(start);
                if(!p3) {
                    if(!location.href.includes('EduCombinedAuthUidPwd')) {
                        window.open(credpage, '_self');
                    } else if(userpassword && usercode && enter) {
                        var [ usercodeValue,  userpasswordValue ] = cred;
                        if(usercodeValue && userpasswordValue) {
                            userpassword.value = userpasswordValue;
                            usercode.value = usercodeValue;
                            click(enter);
                        }
                    }
                }
            
          
            }
        }
        var ping = setInterval(run , 500); 
    });

})();
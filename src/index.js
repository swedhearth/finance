    console.log("finance Start");

/* ------------------------------------------------********************************* DOM *****************************----------------------------------------------------------*/
    const dom = function(el){
        el.addClass = cssClass => {el.classList.add(cssClass); return el;};
        el.removeClass = cssClass => {el.classList.remove(cssClass); return el;};
        el.hasClass = cssClass => el.classList.contains(cssClass);
        el.cssName = cssClasses => {el.className = cssClasses; return el;};
        el.hide = _ => {el.classList.add("elNoDisplay"); return el;};
        el.toggleDisplay = _ => {el.classList.toggle("elNoDisplay"); return el;};
        el.show = _ => {el.classList.remove("elNoDisplay"); return el;};
        el.isHidden = _ => el.classList.contains("elNoDisplay");
        el.slideOut = _ => {el.classList.add("elSlideOut"); return el;};
        el.slideIn = _ => {el.classList.remove("elSlideOut"); return el;};
        el.ridKids = (idx = 0) => {while(el.children[idx]) el.removeChild(el.lastChild); return el;};
        el.on = (type, fn, opt) => {el.addEventListener(type, fn, opt); return el;};
        el.onClick = (fn, opt) => {el.addEventListener("click", fn, opt); return el;};
        el.selfClick = _ => {el.click(); return el;}
        el.attachTo = parentEl => {parentEl.appendChild(el); return el;};
        el.attach = kidEl => {if(kidEl) el.appendChild(kidEl); return el;};
        el.attachAry = kidsAry => {if(kidsAry.length) el.append(...kidsAry); return el;};
        el.kids = _ => [...el.parentElement.children];
        el.kill = _ => {el.remove(); return el;}
        el.forebear = (level) => [...Array(++level)].fill(el).reduce(acc => acc ? acc.parentElement : null); // array level 1 is the element itself, level 2 is a parent of the element
        el.sibling = (level) => el.kids()[level + el.kids().findIndex(e => e === el)] || null; // level 0 is the element itself, level 1 is the nextSibling, -1 is the previous sibling
        el.setAttr = (name, value) => {el.setAttribute(name, value); return el;};
        el.html = innerHtml => {el.innerHTML = innerHtml; return el;};
        el.txt = txt => {el.textContent = txt; return el;};
        el.clone = deep => dom(el.cloneNode(deep));
        el.kidsByClass = cssClass => [...el.getElementsByClassName(cssClass)];
        el.addTxt = txt => el.attach(document.createTextNode(txt));
        return el;
    }
    dom.add = tag => dom(document.createElement(tag));
    dom.adDiv = (classNamesString = "", innerHtmlString = "") => dom.add("div").html(innerHtmlString).cssName(classNamesString);
    [...document.querySelectorAll('*')].forEach(dom); // Add shortcut functions to all the elements in DOM

/* ------------------------------------------------********************************* Prototyped *****************************----------------------------------------------------------*/
    Array.prototype.getDuplicates = function () {
        var duplicates = {};
        for (var i = 0; i < this.length; i++) {
            if(duplicates.hasOwnProperty(this[i])) {
                duplicates[this[i]].push(i);
            } else if (this.lastIndexOf(this[i]) !== i) {
                duplicates[this[i]] = [i];
            }
        }
        return duplicates;
    };
    
    Array.prototype.getUniques = function () {
        var uniques = [];
        for (var i = 0; i < this.length; i++) {
            if (this.lastIndexOf(this[i]) === i) {
                uniques.push(i);
            }
        }
        return uniques;
    };
    
    Array.prototype.getSum = function(propAry){
        const sumInObj = obj => propAry.reduce((accumulator, prop) => accumulator + obj[prop], 0);
        return this.reduce((accumulator, obj) =>  accumulator + sumInObj(obj), 0)
    }
    
    Date.prototype.toUKstringDateTime = function(){
        return this.toLocaleString('en-GB', { timeZone: 'Europe/London' });
    };
    
    Date.prototype.toUKstringDate = function(){
        return this.toLocaleDateString('en-GB', { timeZone: 'Europe/London' });
    };

/* ------------------------------------------------********************************* Helpers *****************************----------------------------------------------------------*/
    const gbp = "£";
    const eur = "€";
    const getFormatString = (val, currency) => currency ? val ? val > 0 ? currency + val.toFixed(2) : "- " + currency + (-val).toFixed(2) : "-" : val || "-";
    const getNumber = objValue => typeof objValue === "number" && isFinite(objValue)? objValue : null;
    function getValueFrom(value, format){
        if(!value || value.includes(" which account?")) return null;
      return {
        date: value.match(/^\d{2}\/\d{2}\/\d{4}$/) === null ? null: value,
        number: value === "-" ? 0 : getNumber(parseFloat(value.replace(/[^\d.-]/g, ''))),
        string: value === "-" ? "" : value
      }[format];
    }
    function getMonthsAry(initDate){
        const months = [];
        while (initDate < new Date()){
            months.push(new Date(initDate));
            initDate.setMonth(initDate.getMonth() + 1);
        }
        return months;
    }
    function getDateFromMMDDYYYY(mmddyyyyString){
        var dateParts = mmddyyyyString.split("/");
        return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    }

/* ------------------------------------------------*********************************Start App*****************************----------------------------------------------------------*/

    function getKeyMaterial(passU8Ary) {
        return window.crypto.subtle.importKey(
            "raw",
            passU8Ary,
            "PBKDF2",
            false,
            ["deriveBits", "deriveKey"]
        );
    }

    async function deriveKey(passU8Ary, saltU8Ary) {
        return window.crypto.subtle.deriveKey(
            {
                "name": "PBKDF2",
                salt: saltU8Ary,
                "iterations": 100000,
                "hash": "SHA-256"
            },
            await getKeyMaterial(passU8Ary),
            { "name": "AES-GCM", "length": 256},
            true,
            [ "encrypt", "decrypt" ]
        );
    }

    async function getDecryptedString(encryptedBlobAryBuff, passString) {
        const passU8Ary = new TextEncoder().encode(passString);
        const encryptedU8Ary = new Uint8Array(encryptedBlobAryBuff);
        const encryptedAry = [...encryptedU8Ary];
        const saltU8Ary = new Uint8Array(encryptedAry.splice(0,16));
        const ivU8Ary = new Uint8Array(encryptedAry.splice(0,12));

        const decodedAryBuf = await window.crypto.subtle.decrypt(
            { name: "AES-GCM", iv: ivU8Ary },
            await deriveKey(passU8Ary, saltU8Ary),
            new Uint8Array(encryptedAry)
        );
        return new TextDecoder().decode(decodedAryBuf);
    }
    
    async function getServerFileContents(){
        const response = await fetch("finance.db");
        return response.arrayBuffer();
    }

    async function readFinanceDb(financePassword, readerFunction){
        const encryptedArrayBuffer = await readerFunction(financePassword);
        const fileString = await getDecryptedString(encryptedArrayBuffer, financePassword);
        return JSON.parse(fileString);
    }

    const startApp = async e => {
        e.preventDefault();
        const financePassword = e.target[0].value;
        const isLocal = window.initLocal;
        const readerFunction = isLocal ? getLocalFileContents : getServerFileContents;
        let fundsJson;
        try{
            fundsJson = await readFinanceDb(financePassword, readerFunction);
        }catch(e){
            console.log(e);
            return alert("Access Error");
        }
console.log(fundsJson);
        if(isLocal) fundsJson.code = code;
        dom.add("script").addTxt(fundsJson.code).attachTo(document.head);

        const fundsObj = new FundsObject(fundsJson);
        paintRemontPieChart = paintRemontPieChart(fundsObj);
        swichFund = swichFund(fundsObj);
        paintDomElements(fundsObj, 'remont');
        window.addEventListener("resize", setDomElsSize);
        e.target.forebear(2).kill();
        
        if (isLocal) initLocal(fundsObj, financePassword);
    }

    dom.adDiv("passSect").attach(
        dom.adDiv("passWrp").attach(
            dom.add("form").attachAry(
                [
                    dom.add("input").setAttr("type", "password").setAttr("placeholder", "... Type Password ..."),
                    dom.add("input").html("Submit").setAttr("type", "submit")
                ]
            ).on("submit", startApp)
        )
    ).attachTo(document.body);
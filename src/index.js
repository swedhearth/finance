    console.log("finance Start");

    /* DOM -------------------------------------------------------------------------- */
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
        el.kill = _ => {el.remove(); return el;}
        el.forebear = (level = 1) => [...Array(++level)].fill(el).reduce(acc => acc ? acc.parentElement : null); // array level 1 is the element itself, level 2 is a parent of the element
        el.setAttr = (name, value) => {el.setAttribute(name, value); return el;};
        el.html = innerHtml => {el.innerHTML = innerHtml; return el;};
        el.txt = txt => {el.textContent = txt; return el;};
        el.clone = deep => dom(el.cloneNode(deep));
        el.kidsByClass = cssClass => [...el.getElementsByClassName(cssClass)];
        return el;
    }
    dom.add = tag => dom(document.createElement(tag));
    dom.adDiv = (classNamesString = "", innerHtmlString = "") => dom.add("div").html(innerHtmlString).cssName(classNamesString);
    [...document.querySelectorAll('*')].forEach(dom); // Add shortcut functions to all the elements in DOM

    /* Prototyped -------------------------------------------------------------------------- */
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
    
    function getDateFromMMDDYYYY(mmddyyyyString){
        var dateParts = mmddyyyyString.split("/");
        return new Date(+dateParts[2], dateParts[1] - 1, +dateParts[0])
    }
    
    function getMonthsAry(initDate){
        const months = [];
        while (initDate < new Date()){
            months.push(new Date(initDate));
            initDate.setMonth(initDate.getMonth() + 1);
        }
        return months;
    }

// -----------------------------------------------------||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||------------------------------//

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

/* ------------------------------------------------*********************************REMONT Object*****************************----------------------------------------------------------*/

    function RemontObject(remontJson, remontBudgetTarget = 3000){
        
        function RemontEntryObject(remontJsonObject, type){
            this.type = type;
            this.date = getDateFromMMDDYYYY(remontJsonObject.date);
            
            this.remontPaidEwa = remontJsonObject.Ewa || 0;
            this.remontPaidHubert = remontJsonObject.Hubert || 0;
            this.remontPaidAll = this.remontPaidEwa + this.remontPaidHubert;
            this.remontPaidComment = remontJsonObject.comment || 0;
            this.remontPaidCommentEwa = remontJsonObject.commentE || 0;
            this.remontPaidCommentHubert = remontJsonObject.commentH || 0;
            
            this.remontSpentFromAccount = remontJsonObject.paidBy || 0;
            this.remontSpentVendor = remontJsonObject.vendor || 0;
            this.remontSpentCost = remontJsonObject.cost || 0;
            this.remontSpentRefund = remontJsonObject.refund || 0;
            this.remontSpentValue = this.remontSpentCost - this.remontSpentRefund;
            this.remontSpentItem =  remontJsonObject.item || 0;
            this.remontSpentRefundBy =  remontJsonObject.refundBy || 0;
            
            this.remontBallance = this.remontPaidAll - this.remontSpentValue;
            this.remontLeftToPay = this.remontSpentValue - this.remontPaidAll; //3000 - 3200
        }
        
        function RemontMonthObject(date, remontEntryObjectsAry){
            this.fromDate = new Date(date);
            date.setMonth(date.getMonth() + 1); //set date to next month
            this.untilDate = date > new Date() ?  new Date() : new Date(date.setDate(date.getDate() - 1)); // if the next months date is greater than now make it now, otherwise set it to the last day of the original month
            const periodItemsAry = remontEntryObjectsAry.filter(remontEntryObject => remontEntryObject.date <= this.untilDate && remontEntryObject.date >= this.fromDate);//if spent is less than 01/08/2020 & more or equal than 01/07/2020
            
            Object.keys(remontEntryObjectsAry[0]).forEach(property => {
                this[property] = periodItemsAry.reduce((accumulator, remontEntryObject) =>  accumulator + getNumber(remontEntryObject[property]), 0)
            });

            this.remontSpentObjAry = periodItemsAry.filter(remontJsonObject => remontJsonObject.type === "spent");
            this.remontPaidObjAry = periodItemsAry.filter(remontJsonObject => remontJsonObject.type === "paid");

            const getAccumulatedProp = property => remontEntryObjectsAry.filter(j => j.date <= this.untilDate).reduce((accumulator, remontEntryObject) =>  accumulator + remontEntryObject[property], 0);
            
            this.remontBallance = getAccumulatedProp('remontBallance');
            this.remontBudgetHave = remontBudgetTarget + this.remontBallance;
            this.remontLeftToPay = getAccumulatedProp('remontLeftToPay');
            
        }

        this.remontBudgetTarget = remontBudgetTarget;
        this.remontSpentObjAry = remontJson.spent.map(remontJsonObject => new RemontEntryObject(remontJsonObject, "spent"));
        this.remontPaidObjAry = remontJson.paid.map(remontJsonObject => new RemontEntryObject(remontJsonObject, "paid"));
        const remontEntryObjectsAry = [this.remontSpentObjAry, this.remontPaidObjAry].flat().sort((a, b) => a.date - b.date);

        Object.keys(this.remontPaidObjAry[0]).forEach(property => {
            this[property] = remontEntryObjectsAry.reduce((accumulator, remontEntryObject) =>  accumulator + getNumber(remontEntryObject[property]), 0)
        });

        this.remontBudgetHave = remontBudgetTarget + this.remontBallance;
        this.months = getMonthsAry(new Date("Mon Jun 01 2020 00:00:00 GMT+0100")).map(date => new RemontMonthObject(date, remontEntryObjectsAry));
    }

/* ------------------------------------------------*********************************HOLIDAY Object*****************************----------------------------------------------------------*/
    function HolidayObj(holidayJson){

        function HolidayEntryObject(holidayJsonObject, type){
            const inGbpRevolutHubert = holidayJsonObject.to === "hubertRevolutGBP" ? holidayJsonObject.amount_in : 0;
            const outGbpRevolutHubert = holidayJsonObject.from === "hubertRevolutGBP" ? holidayJsonObject.amount_out : 0;
            const inGbpRevolutEwa = holidayJsonObject.to === "ewaRevolutGBP" ? holidayJsonObject.amount_in : 0;
            const outGbpRevolutEwa = holidayJsonObject.from === "ewaRevolutGBP" ? holidayJsonObject.amount_out : 0;
            const inEurRevolutHubert = holidayJsonObject.to === "hubertRevolutEUR" ? holidayJsonObject.amount_in : 0;
            const outEurRevolutHubert = holidayJsonObject.from === "hubertRevolutEUR" ? holidayJsonObject.amount_out : 0;
            const inEurRevolutEwa = holidayJsonObject.to === "ewaRevolutEUR" ? holidayJsonObject.amount_in : 0;
            const outEurRevolutEwa = holidayJsonObject.from === "ewaRevolutEUR" ? holidayJsonObject.amount_out : 0;
            const outGbpMain = holidayJsonObject.from === "mainGBP" ? holidayJsonObject.amount_out : 0;
            
            this.type = type;
            this.date = getDateFromMMDDYYYY(holidayJsonObject.date);
            this.comment = holidayJsonObject.comment;
            this.paidHolidayEwa = holidayJsonObject.ewa || 0;
            this.paidHolidayHubert = holidayJsonObject.hubert || 0;
            this.paidHolidayAll = this.paidHolidayEwa + this.paidHolidayHubert;
            
            const inGbpMain = this.paidHolidayAll + (holidayJsonObject.to === "mainGBP" ? holidayJsonObject.amount_in : 0);

            this.holidayBallanceTotalGbpMain = inGbpMain - outGbpMain;
            this.holidayBallanceTotalGbpRevolutHubert = inGbpRevolutHubert - outGbpRevolutHubert;
            this.holidayBallanceTotalGbpRevolutEwa = inGbpRevolutEwa - outGbpRevolutEwa;
            this.holidayBallanceTotalEurRevolutHubert = inEurRevolutHubert - outEurRevolutHubert;
            this.holidayBallanceTotalEurRevolutEwa = inEurRevolutEwa - outEurRevolutEwa;
            this.inGbp = inGbpMain + inGbpRevolutHubert + inGbpRevolutEwa;
            this.outGbp = outGbpMain + outGbpRevolutHubert + outGbpRevolutEwa;
            this.holidayBallanceTotalGbp = this.inGbp - this.outGbp;
            this.inEur = inEurRevolutHubert + inEurRevolutEwa;
            this.outEur = outEurRevolutHubert + outEurRevolutEwa;
            this.holidayBallanceTotalEur = this.inEur - this.outEur;
            this.spentGbp = type === "spent" ? this.outGbp : 0;
            this.spentEur = type === "spent" ? this.outEur : 0;

            this.inAll = this.inGbp + this.inEur;
            this.outAll = this.outGbp + this.outEur;
            this.fromAccount = holidayJsonObject.from;
            this.toAccount = holidayJsonObject.to;
            this.fromCurrency = this.outGbp > 0 ? gbp : eur;
            this.toCurrency = this.inGbp > 0 ? gbp : eur;
        }
        
        function HolidayMonthObject(date, holidayEntryObjectsAry){
            this.fromDate = new Date(date);;
            date.setMonth(date.getMonth() + 1); //set date to next month
            this.untilDate = date > new Date() ?  new Date() : new Date(date.setDate(date.getDate() - 1)); // if the next months date is greater than now make it now, otherwise set it to the last day of the original month
            const periodItemsAry = holidayEntryObjectsAry.filter(j => j.date <= this.untilDate && j.date >= this.fromDate);//if spent is less than 01/08/2020 & more or equal than 01/07/2020

            Object.keys(holidayEntryObjectsAry[0]).forEach(property => {
                this[property] = periodItemsAry.reduce((accumulator, holidayEntryOb) =>  accumulator + getNumber(holidayEntryOb[property]), 0)
            });
            
            this.holsOut = periodItemsAry.filter(holidayJsonObject => holidayJsonObject.type === "spent");
            this.holsIn = periodItemsAry.filter(holidayJsonObject => holidayJsonObject.type === "paid");
            this.holsTrans = periodItemsAry.filter(holidayJsonObject => holidayJsonObject.type === "trans");

            const getAccumulatedProp = property => holidayEntryObjectsAry.filter(j => j.date <= this.untilDate).reduce((accumulator, holidayEntryOb) =>  accumulator + holidayEntryOb[property], 0);
            
            this.holidayBallanceTotalGbpMain = getAccumulatedProp('holidayBallanceTotalGbpMain');
            this.holidayBallanceTotalGbpRevolutHubert = getAccumulatedProp('holidayBallanceTotalGbpRevolutHubert');
            this.holidayBallanceTotalGbpRevolutEwa = getAccumulatedProp('holidayBallanceTotalGbpRevolutEwa');
            this.holidayBallanceTotalEurRevolutHubert = getAccumulatedProp('holidayBallanceTotalEurRevolutHubert');
            this.holidayBallanceTotalEurRevolutEwa = getAccumulatedProp('holidayBallanceTotalEurRevolutEwa');
            this.holidayBallanceTotalGbp = getAccumulatedProp('holidayBallanceTotalGbp');
            this.holidayBallanceTotalEur = getAccumulatedProp('holidayBallanceTotalEur');
        }

        this.holsOut = holidayJson.spent.map(holidayJsonObject => new HolidayEntryObject(holidayJsonObject, "spent"));
        this.holsIn = holidayJson.paid.map(holidayJsonObject => new HolidayEntryObject(holidayJsonObject, "paid"));
        this.holsTrans = holidayJson.trans.map(holidayJsonObject => new HolidayEntryObject(holidayJsonObject, "trans"));
        const holidayEntryObjectsAry = [this.holsOut, this.holsIn, this.holsTrans].flat().sort((a, b) => a.date - b.date);

        this.months = getMonthsAry(new Date("Wed Jan 01 2020 00:00:00 GMT+0000")).map(date => new HolidayMonthObject(date, holidayEntryObjectsAry));


        Object.keys(this.holsTrans[0]).forEach(property => {
            this[property] = holidayEntryObjectsAry.reduce((accumulator, holidayEntryOb) =>  accumulator + getNumber(holidayEntryOb[property]), 0)
        });
    }
/* ------------------------------------------------*********************************HOLIDAY*****************************----------------------------------------------------------*/

/* ------------------------------------------------*********************************FUNDS Object*****************************----------------------------------------------------------*/
    function FundsObject(fundsJson){
        //const fundsJson = JSON.parse(fileContents);
        this.remontJson = fundsJson.remont;
        this.holidayJson = fundsJson.holiday;
        this.remontObj = new RemontObject(this.remontJson, 3000);
        this.holidayObj = new HolidayObj(this.holidayJson);
        this.updateFundsObjects = async _ => {
            this.remontObj = new RemontObject(this.remontJson, 3000);
            this.holidayObj = new HolidayObj(this.holidayJson);
            return {
                remont: this.remontJson,
                holiday: this.holidayJson
            };
        }
    }
/* ------------------------------------------------*********************************End Objects*****************************----------------------------------------------------------*/

/* ------------------------------------------------*********************************Paintings: *****************************----------------------------------------------------------*/

    /* -----------------------------------******************************Zoom Wrap*************************************---------------------------------=*/
    function getZoomWrp(){
        return  dom.adDiv("zoowWrp").setAttr("id", "zoowWrp").attach(
                        dom.add("label").setAttr("for", "fundWrpZoom").html("-").on("click", _ => changeFundWrpZoom(-1))
                    ).attach(
                        dom.add("input").on("input", _ => changeFundWrpZoom(0))
                            .setAttr("type", "range")
                            .setAttr("name", "fundWrpZoom")
                            .setAttr("id", "fundWrpZoom")
                            .setAttr("list", "zoomMarks")
                            .setAttr("min", "70")
                            .setAttr("max", "100")
                            .setAttr("value", "70")
                    ).attach(
                        dom.add("label").setAttr("for", "fundWrpZoom").html("+").on("click", _ => changeFundWrpZoom(1))
                    ).attach(
                        dom.add("datalist").setAttr("id", "zoomMarks").attachAry(
                            [...Array(4).keys()].map(x => dom.add("option").setAttr("value", "" + (x * 10 + 70)))
                        )
                    )
    }
    
    const updateTdCsNameAry = (fundUnitName, inner = false) => {
        const tdCsNameAry = [...Array(10)].slice(inner | 0).map((v,i) => `td fundCol ${fundUnitName}Col_${i + inner}`);
        return (html, i) => dom.adDiv(tdCsNameAry[i], html);
    };
    
    /* -----------------------------------**********************************REMONT********************************************---------------------------------=*/

    function getRemontNavTemplate(remontObj){
        const getTd = updateTdCsNameAry("remontLegend");
        const switchHtml = e => e.target.html(e.type === "mouseover" ? "Switch to Holiday Fund..." : "Remont Fund:"); 
        return [
            dom.adDiv("tr").attachAry(
                [
                    dom.adDiv("navTitle td", "Remont Fund:").setAttr("data-fundname", "remont").onClick(swichFund).on("mouseover", switchHtml).on("mouseout", switchHtml),
                    dom.adDiv("navBtn td pieChartShow", "Show Pie Chart").onClick(showFundUnit),
                    dom.adDiv("navBtn td spentTableShow", "Show Spent Money").onClick(showFundUnit),
                    dom.adDiv("navBtn td paidTableShow", "Show Paid Money").onClick(showFundUnit),
                    dom.adDiv("navBtn td historyTableShow", "Show History").onClick(showFundUnit),
                    getZoomWrp()
                ]
            ),
            dom.adDiv("tr remontLegendRow").attachAry(
                [
                    "Total Spent:",
                    "Total Paid:",
                    "Target Budget:",
                    "Have Budget:",
                    "Left to Pay:"
                ].map(getTd)
            ),
            dom.adDiv("tr remontLegendRow legendValue").attachAry(
                [
                    getFormatString(remontObj.remontSpentValue, gbp),
                    getFormatString(remontObj.remontPaidAll, gbp),
                    getFormatString(remontObj.remontBudgetTarget, gbp),
                    getFormatString(remontObj.remontBudgetHave, gbp),
                    getFormatString(remontObj.remontLeftToPay, gbp)
                ].map(getTd)
            )
        ];
    }

    function getRemontSpentTemplate(remontObj, inner){

        const getTd = updateTdCsNameAry("remontSpent", inner);
        const editable = inner ? " " : " editable ";
        return [
            dom.adDiv("tr headTr tableTitle", "Money Spent:"),
            dom.adDiv("tr headTr").attachAry(
                ["ID", "Date:", "Paid Method:", "Vendor:", "Item Name:", "Cost:", "Refund:", "Refunded By:", "Sum:"].slice(inner | 0).map(getTd)
            ),
            ...(
                remontObj.remontSpentObjAry.map((remontEntryObject, idx) => 
                    dom.adDiv("tr" + editable + (idx % 2 === 0 ? "" : "shadeTr")).attachAry(
                        [
                            ++idx, //ID
                            remontEntryObject.date.toLocaleDateString('en-GB'), //Date
                            remontEntryObject.remontSpentFromAccount, //paidMethod
                            remontEntryObject.remontSpentVendor, //Vendor
                            remontEntryObject.remontSpentItem, //Item Name
                            getFormatString(remontEntryObject.remontSpentCost, gbp), //Cost
                            getFormatString(remontEntryObject.remontSpentRefund, gbp), //Refund
                            getFormatString(remontEntryObject.remontSpentRefundBy), //Refunded By
                            getFormatString(remontEntryObject.remontSpentValue, gbp), //Sum
                        ].slice(inner | 0).map(getTd)
                    )
                )
            ),
            dom.adDiv("tr sumTr addEntry" + editable).attachAry(
                [
                    "+",
                    "-",
                    "-",
                    "-",
                    "-",
                    getFormatString(remontObj.remontSpentCost, gbp),
                    getFormatString(remontObj.remontSpentRefund, gbp),
                    "-",
                    getFormatString(remontObj.remontSpentValue, gbp)
                ].slice(inner | 0).map(getTd)
            )
        ].slice(!inner | 0);
    }
    

    function getRemontPaidTemplate(remontObj, inner){
        const getTd = updateTdCsNameAry("remontPaid", inner);
        const editable = inner ? " " : " editable ";
        return [
            dom.adDiv("tr headTr tableTitle", "Money Paid:"),
            dom.adDiv("tr headTr").attachAry(
                ["ID", "Date:", "Ewa:", "Hubert:", "Sum:", "Comment:", "Comment Ewa:", "Comment Hubert:"].slice(inner | 0).map(getTd)
            ),
            ...(
                remontObj.remontPaidObjAry.map((remontEntryObject, idx) => 
                    dom.adDiv("tr" + editable + (idx % 2 === 0 ? "" : "shadeTr")).attachAry(
                        [
                            ++idx, //ID
                            remontEntryObject.date.toLocaleDateString('en-GB'), //Date
                            getFormatString(remontEntryObject.remontPaidEwa, gbp),
                            getFormatString(remontEntryObject.remontPaidHubert, gbp),
                            getFormatString(remontEntryObject.remontPaidAll, gbp),
                            getFormatString(remontEntryObject.remontPaidComment),
                            getFormatString(remontEntryObject.remontPaidCommentEwa),
                            getFormatString(remontEntryObject.remontPaidCommentHubert),
                        ].slice(inner | 0).map(getTd)
                    )
                )
            ),
            dom.adDiv("tr sumTr addEntry" + editable).attachAry(
                [
                    "+",
                    "-",
                    getFormatString(remontObj.remontPaidEwa, gbp),
                    getFormatString(remontObj.remontPaidHubert, gbp),
                    getFormatString(remontObj.remontPaidAll, gbp),
                    "-",
                    "-",
                    "-"
                ].slice(inner | 0).map(getTd)
            )
        ].slice(!inner | 0);
    }
    
    function getRemontHistoryTemplate(remontObj){
        const getTd = updateTdCsNameAry("remontHistory");
        
        return [
            dom.adDiv("tr headTr").attachAry(
                ["ID", "Until:", "Paid:", "Spent:", "Balance:", "Budget Left:"].map(getTd)
            ),
            ...(
                remontObj.months.map((remontMonthObject, idx) => 
                    [
                        dom.adDiv("tr condensedTr " + (idx % 2===0 ? "" : "shadeTr")).attachAry(
                            [
                                ++idx, //ID
                                remontMonthObject.fromDate.toLocaleDateString('en-GB') + " - " + remontMonthObject.untilDate.toLocaleDateString('en-GB'), //Until
                                getFormatString(remontMonthObject.remontPaidAll, gbp), //Paid
                                getFormatString(remontMonthObject.remontSpentValue, gbp), //Spent
                                getFormatString(remontMonthObject.remontBallance, gbp), //Balance
                                getFormatString(remontMonthObject.remontBudgetHave, gbp), //Budget Left
                            ].map(getTd)
                        ).on("pointerdown", showHistoryDetails),
                        dom.adDiv("innerTableWrap elNoDisplay").attachAry(
                            [
                                dom.adDiv("innerTable paidTableInner").attachAry(
                                    getRemontPaidTemplate(remontMonthObject, true)
                                ),
                                dom.adDiv("innerTable spentTableInner").attachAry(
                                    getRemontSpentTemplate(remontMonthObject, true)
                                )
                            ]
                        )
                    ]
                ).flat()
            ),
            dom.adDiv("tr sumTr addEntry").attachAry(
                [
                    "-",
                    "-",
                    getFormatString(remontObj.remontPaidAll, gbp),
                    getFormatString(remontObj.remontSpentValue, gbp),
                    getFormatString(remontObj.remontBallance, gbp),
                    getFormatString(remontObj.remontBudgetHave, gbp),
                ].map(getTd)
            )
        ];
    }

    /* -----------------------------------**********************************Holiday********************************************---------------------------------=*/
    
    function getHolidayNavTemplate(holidayObj){
        const getTd = updateTdCsNameAry("holidayLegend");
        const switchHtml = e => e.target.html(e.type === "mouseover" ? "Switch to Remont Fund..." : "Holiday Fund:");
        return [
            dom.adDiv("tr").attachAry(
                [
                    dom.adDiv("navTitle td").html("Holiday Fund:").setAttr("data-fundname", "holiday").onClick(swichFund).on("mouseover", switchHtml).on("mouseout", switchHtml),
                    dom.adDiv("navBtn td paidTableShow", "Show Paid Money").onClick(showFundUnit),
                    dom.adDiv("navBtn td spentTableShow", "Show Spent Money").onClick(showFundUnit),
                    dom.adDiv("navBtn td transTableShow", "Show Transfer Money").onClick(showFundUnit),
                    dom.adDiv("navBtn td historyTableShow", "Show History").onClick(showFundUnit),
                    getZoomWrp()
                ]
            ),
            dom.adDiv("tr remontLegendRow").attachAry(
                [
                    //"Total Paid:",
                    //"Total Spent GBP:",
                    //"Total Spent EUR:",
                    "Ballance GBP Main:",
                    "Ballance GBP Hubert Revolut:",
                    "Ballance GBP Ewa Revolut:",
                    "Ballance GBP Total:",
                    "Ballance EUR Hubert Revolut:",
                    "Ballance EUR Ewa Revolut:",
                    "Ballance EUR Total:"
                ].map(getTd)
            ),
            dom.adDiv("tr remontLegendRow legendValue").attachAry(
                [
                    //getFormatString(holidayObj.paidHolidayAll, gbp),
                    //getFormatString(holidayObj.spentGbp, gbp),
                    //getFormatString(holidayObj.spentEur, eur),
                    getFormatString(holidayObj.holidayBallanceTotalGbpMain, gbp),
                    getFormatString(holidayObj.holidayBallanceTotalGbpRevolutHubert, gbp),
                    getFormatString(holidayObj.holidayBallanceTotalGbpRevolutEwa, gbp),
                    getFormatString(holidayObj.holidayBallanceTotalGbp, gbp),
                    getFormatString(holidayObj.holidayBallanceTotalEurRevolutHubert, eur),
                    getFormatString(holidayObj.holidayBallanceTotalEurRevolutEwa, eur),
                    getFormatString(holidayObj.holidayBallanceTotalEur, eur)
                ].map(getTd)
            )
        ]
    }

    function getHolidayHistoryTableTemplate(holidayObj){
        const getTd = updateTdCsNameAry("holidayHistory");
        return [
            dom.adDiv("tr headTr").attachAry(
                ["ID", "Period:", "GBP In:", "GBP Out:", "GBP Balance:", "EUR In:", "EUR Out:", "EUR Balance:"].map(getTd)
            ),
            ...(
                holidayObj.months.map((holidayMonthObject, idx) => 
                    [
                        dom.adDiv("tr condensedTr " + (idx % 2===0 ? "" : "shadeTr")).attachAry(
                            [
                                ++idx, //ID
                                holidayMonthObject.fromDate.toLocaleDateString('en-GB') + " - " + holidayMonthObject.untilDate.toLocaleDateString('en-GB'), //Until
                                getFormatString(holidayMonthObject.inGbp, gbp),
                                getFormatString(holidayMonthObject.outGbp, gbp),
                                getFormatString(holidayMonthObject.holidayBallanceTotalGbp, gbp), //Balance
                                getFormatString(holidayMonthObject.inEur, eur),
                                getFormatString(holidayMonthObject.outEur, eur),
                                getFormatString(holidayMonthObject.holidayBallanceTotalEur, eur), //Balance
                            ].map(getTd)
                        ).on("pointerdown", showHistoryDetails),
                        dom.adDiv("innerTableWrap elNoDisplay").attachAry(
                            [
                                dom.adDiv("innerTable paidTableInner").attachAry(
                                    getHolPaidTemplate(holidayMonthObject, true)
                                ),
                                dom.adDiv("innerTable transTableInner").attachAry(
                                    getHolTransTemplate(holidayMonthObject, true)
                                ),
                                dom.adDiv("innerTable spentTableInner").attachAry(
                                   getHolSpentTemplate(holidayMonthObject, true)
                                ),
                                dom.adDiv("innerTable ballanceTableInner").attachAry(
                                   getHolidayBallanceTotalTemplate(holidayMonthObject, true)
                                )
                            ]
                        )
                    ]
                ).flat()
            ),
            dom.adDiv("tr sumTr addEntry").attachAry(
                [
                    "-",
                    "-",
                    getFormatString(holidayObj.inGbp, gbp),
                    getFormatString(holidayObj.outGbp, gbp),
                    getFormatString(holidayObj.holidayBallanceTotalGbp, gbp),
                    getFormatString(holidayObj.inEur, eur),
                    getFormatString(holidayObj.outEur, eur),
                    getFormatString(holidayObj.holidayBallanceTotalEur, eur),
                ].map(getTd)
            )
        ]
    }

    function getHolPaidTemplate(holidayObj, inner){
        const getTd = updateTdCsNameAry("holidayPaid", inner);
        const editable = inner ? " " : " editable ";
        return holidayObj.holsIn.length ? [
            dom.adDiv("tr headTr tableTitle", "Money Paid:"),
            dom.adDiv("tr headTr").attachAry(
                ["ID", "Date:", "Ewa:", "Hubert:", "Sum:", "Comment:"].slice(inner | 0).map(getTd)
            ),
            ...(
                holidayObj.holsIn.map((holidayEntryObj, idx) => 
                    dom.adDiv("tr" + editable + (idx % 2 === 0 ? "" : "shadeTr")).attachAry(
                        [
                            ++idx,
                            holidayEntryObj.date.toLocaleDateString('en-GB'),
                            getFormatString(holidayEntryObj.paidHolidayEwa, gbp),
                            getFormatString(holidayEntryObj.paidHolidayHubert, gbp),
                            getFormatString(holidayEntryObj.paidHolidayAll, gbp),
                            getFormatString(holidayEntryObj.comment),
                        ].slice(inner | 0).map(getTd)
                    )
                )
            ),
            dom.adDiv("tr sumTr addEntry" + editable).attachAry(
                [
                    "+",
                    "-",
                    getFormatString(holidayObj.paidHolidayEwa, gbp),
                    getFormatString(holidayObj.paidHolidayHubert, gbp),
                    getFormatString(holidayObj.paidHolidayAll, gbp),
                    "-"
                ].slice(inner | 0).map(getTd)
                
            )
        ].slice(!inner | 0) : [];
    }
    
    function getHolTransTemplate(holidayObj, inner){
        const getTd = updateTdCsNameAry("holidayTrans", inner);
        const editable = inner ? " " : " editable ";
        return holidayObj.holsTrans.length ? [
            dom.adDiv("tr headTr tableTitle", "Money Transferred:"),
            dom.adDiv("tr headTr").attachAry(
                ["ID", "Date:", "Amount Out:", "From:", "To:", "Amount In:", "Comment:"].slice(inner | 0).map(getTd)
            ),
            ...(
                holidayObj.holsTrans.map((holidayEntryObj, idx) => 
                    dom.adDiv("tr" + editable + (idx % 2 === 0 ? "" : "shadeTr")).attachAry(
                        [
                            ++idx, //ID
                            holidayEntryObj.date.toLocaleDateString('en-GB'), //Datei.from.toLocaleDateString('en-GB')
                            getFormatString(holidayEntryObj.outAll, holidayEntryObj.fromCurrency),
                            getFormatString(holidayEntryObj.fromAccount),
                            getFormatString(holidayEntryObj.toAccount),
                            getFormatString(holidayEntryObj.inAll, holidayEntryObj.toCurrency),
                            getFormatString(holidayEntryObj.comment),
                        ].slice(inner | 0).map(getTd)
                    )
                )
            ),
             inner ? "" : dom.adDiv("tr sumTr addEntry" + editable).attachAry(
                [
                    "+",
                    "-",
                    "-",
                    "-",
                    "-",
                    "-",
                    "-"
                ].slice(inner | 0).map(getTd)
            )
        ].slice(!inner | 0) : [];
    }
    
    function getHolSpentTemplate(holidayObj, inner){
        const getTd = updateTdCsNameAry("holidaySpent", inner);
        const editable = inner ? " " : " editable ";
        return holidayObj.holsOut.length ? [
            dom.adDiv("tr headTr tableTitle", "Money Spent:"),
            dom.adDiv("tr headTr").attachAry(
                ["ID", "Date:", "From:", "Spent Gbp:", "Spent Eur:", "Comment:"].slice(inner | 0).map(getTd)
            ),
            ...(
                holidayObj.holsOut.map((holidayEntryObj, idx) => 
                    dom.adDiv("tr" + editable + (idx % 2 === 0 ? "" : "shadeTr")).attachAry(
                        [
                            ++idx, //ID
                            holidayEntryObj.date.toLocaleDateString('en-GB'),
                            getFormatString(holidayEntryObj.fromAccount),
                            getFormatString(holidayEntryObj.spentGbp, gbp),
                            getFormatString(holidayEntryObj.spentEur, eur),
                            getFormatString(holidayEntryObj.comment),
                        ].slice(inner | 0).map(getTd)
                    )
                )
            ),
            dom.adDiv("tr sumTr addEntry" + editable).attachAry(
                [
                    "+",
                    "-",
                    "-",
                    getFormatString(holidayObj.spentGbp, gbp),
                    getFormatString(holidayObj.spentEur, eur),
                    "-"
                ].slice(inner | 0).map(getTd)
            )
        ].slice(!inner | 0) : [];
    }
    
    function getHolidayBallanceTotalTemplate(holidayMonthObject, inner){
        const getTd = updateTdCsNameAry("holidayBallance", inner);
        return [
            dom.adDiv("tr headTr tableTitle", "Ballance:"),
            dom.adDiv("tr headTr").attachAry(
                ["ID", "Date:", "Main GBP:", "Hubert Revolut GBP:", "Ewa Revolut GBP:", "Hubert Revolut EUR:", "Ewa Revolut EUR:"].slice(inner | 0).map(getTd)
            ),
            dom.adDiv("tr").attachAry(
                [
                    holidayMonthObject.untilDate.toLocaleDateString('en-GB'),
                    getFormatString(holidayMonthObject.holidayBallanceTotalGbpMain, gbp),
                    getFormatString(holidayMonthObject.holidayBallanceTotalGbpRevolutHubert, gbp),
                    getFormatString(holidayMonthObject.holidayBallanceTotalGbpRevolutEwa, gbp),
                    getFormatString(holidayMonthObject.holidayBallanceTotalEurRevolutHubert, eur),
                    getFormatString(holidayMonthObject.holidayBallanceTotalEurRevolutEwa, eur),
                ].map(getTd)
            )
        ].slice(!inner | 0)
    }

    /* -----------------------------------**********************************END TEMPLATES********************************************---------------------------------=*/

    function getRemontElements(remontObj){
        dom.adDiv("navWrp").attachAry(getRemontNavTemplate(remontObj)).attachTo(navBar);
        dom.adDiv("fundUnit stdTable spentTable").attachAry(getRemontSpentTemplate(remontObj)).setAttr("data-fundunitname", "remontSpent").attachTo(fundWrp);
        dom.adDiv("fundUnit stdTable paidTable").attachAry(getRemontPaidTemplate(remontObj)).setAttr("data-fundunitname", "remontPaid").attachTo(fundWrp);
        dom.adDiv("fundUnit stdTable historyTable").attachAry(getRemontHistoryTemplate(remontObj)).attachTo(fundWrp);
        dom.add("canvas").setAttr("id", "pieChart").cssName("fundUnit pieChart").attachTo(fundWrp);
    }
    
    function getHolidayElements(holidayObj){
        dom.adDiv("navWrp").attachAry(getHolidayNavTemplate(holidayObj)).attachTo(navBar);
        dom.adDiv("fundUnit stdTable paidTable").attachAry(getHolPaidTemplate(holidayObj)).setAttr("data-fundunitname", "holidayPaid").attachTo(fundWrp);
        dom.adDiv("fundUnit stdTable spentTable").attachAry(getHolSpentTemplate(holidayObj)).setAttr("data-fundunitname", "holidaySpent").attachTo(fundWrp);
        dom.adDiv("fundUnit stdTable transTable").attachAry(getHolTransTemplate(holidayObj)).setAttr("data-fundunitname", "holidayTrans").attachTo(fundWrp);
        dom.adDiv("fundUnit stdTable historyTable").attachAry(getHolidayHistoryTableTemplate(holidayObj)).attachTo(fundWrp);
    }

    function showHistoryDetails(that){
        that = that.target ? this : that;
        const innerTableWrap = that.nextSibling;
        if(innerTableWrap.isHidden()){
            fundWrp.kidsByClass("expandedTr").forEach(el => {
                el.removeClass("expandedTr");
            });
            
            fundWrp.kidsByClass("innerTableWrap").forEach(el => el.hide());
            fundWrp.kidsByClass("condensedTr").forEach(el => el.hide());
            that.show();
            
            that.addClass("expandedTr");
            innerTableWrap.show();
            let rec = innerTableWrap.getBoundingClientRect();
            innerTableWrap.forebear(2).scrollBy(0, rec.top - 200);
        }else{
            fundWrp.kidsByClass("condensedTr").forEach(el => el.show());
            that.removeClass("expandedTr");
            innerTableWrap.hide();
        }
    }

    function showUnit(showClass, preventScrollToTop){
        navBar.kidsByClass("navBtn").forEach(el => el.removeClass("navBtnActive"));
        fundWrp.kidsByClass("fundUnit").forEach(el => el.hide());
        navBar.kidsByClass(showClass + "Show")[0].addClass("navBtnActive");
        fundWrp.kidsByClass(showClass)[0].show();
        if(!preventScrollToTop) fundWrp.scrollTo(0, 0);
    }

    function showFundUnit(e){
        showUnit([...e.target.classList].filter(e => !["navBtn", "td"].includes(e))[0].replace('Show', ''));
    }

    function paintRemontPieChart(fundsObj){
        return _ => {
            const remontObj = fundsObj.remontObj;
            const canvas = pieChart;
            const rec = fundWrp.getBoundingClientRect();
            canvas.width = canvas.height = Math.min(rec.height, rec.width) * 0.8;
            const ctx = canvas.getContext("2d");
            const off = 0; // make the chart 10 px smaller to fit on canvas
            const w = (canvas.width - off) / 2; //middle width
            const h = (canvas.height - off) / 2; //middle height
            const myObj = {
                underbudget: {
                    data: [remontObj.remontBudgetHave, remontObj.remontLeftToPay],
                    myColor:['rgb(0, 50, 255)', 'rgb(150, 0, 0)'],
                    myLabels: ['Have Budget:', 'Left to Pay:'],
                    myShades: ["rgb(0, 255, 255)", 'rgb(255, 0, 0)']
                },
                overbudget:{
                    data: [remontObj.remontBudgetTarget, remontObj.remontBudgetHave - remontObj.remontBudgetTarget],
                    myColor:['rgb(0, 50, 255)', 'rgb(0, 150, 0)'],
                    myLabels: ['Target Budget:', 'Extra Budget:'],
                    myShades: ['rgb(0, 255, 255)',"rgb(0, 255, 0)"]
                }
            }
            const canvObj = remontObj.remontLeftToPay < 0 ? myObj.overbudget : myObj.underbudget;
            const myTotal = canvObj.data.reduce((accumulator, value) =>  accumulator + value, 0);
            let lastend = remontObj.remontLeftToPay < 0 ? Math.PI * 1.5 + Math.PI * 2 * (canvObj.data[1] / myTotal) :  Math.PI * 1.5; //Start from North of the chart
            
            for (var i = 0; i < canvObj.data.length; i++) {
                ctx.strokeStyle ='white';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(w, h);
                let len =  (canvObj.data[i] / myTotal) * 2 * Math.PI;
                let r = h - off / 2
                ctx.arc(w , h, r, lastend, lastend + len, false);
                //console.log("w:", w, " / h:", h, " / lastend:", lastend, " / r:", r, " / lastend + len:", lastend + len);
                let grd = ctx.createRadialGradient(w, h, r, w * 1, h * 0.8, 20);
                grd.addColorStop(0, canvObj.myColor[i]);
                grd.addColorStop(1, canvObj.myShades[i]);
                ctx.fillStyle = grd;// myColor[i]; //
                ctx.lineTo(w,h);
                ctx.fill();
                ctx.stroke();
                ctx.fillStyle ='white';
                ctx.font = "3vmin monospace";
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                let mid = lastend + len / 2
                //console.log("mid:", mid, "w + Math.cos(mid) * (r/2)", w + Math.cos(mid) * (r/2) , "h + Math.sin(mid) * (r/2)", h + Math.sin(mid) * (r/2));  

                ctx.fillText(getFormatString(canvObj.data[i], gbp), w + Math.cos(mid) * (r/2) , h + Math.sin(mid) * (r/2));
                ctx.fillText(canvObj.myLabels[i], w + Math.cos(mid) * (r/2) , h + Math.sin(mid) * (r/2) - 40);
                lastend += Math.PI * 2 * (canvObj.data[i] / myTotal);
            }
        }
    }

    function setDomElsSize(){
        fundWrp.style.width = fundWrpZoom.value + "%";
        fundWrp.style.height = "calc(" + (document.body.clientHeight - navBar.getBoundingClientRect().height) + "px - 10px)";
        window.innerWidth > 1200 ? zoowWrp.show() : zoowWrp.hide();
        if(typeof pieChart !== 'undefined') paintRemontPieChart();
    }

    function changeFundWrpZoom(mod){
        fundWrpZoom.value = parseInt(fundWrpZoom.value) + mod;
        setDomElsSize();
    }

    function paintDomElements(fundsObj, fundName, showClass = "historyTable", preventScrollToTop){
        fundWrp.ridKids().show();
        navBar.ridKids();
        fundName === "remont" ? getRemontElements(fundsObj.remontObj) : getHolidayElements(fundsObj.holidayObj);
        showUnit(showClass, preventScrollToTop);
        setDomElsSize();
    }
    
    function swichFund(fundsObj){
        return e => {
            const fundSwichName = ["remont", "holiday"].filter(name => name !== e.target.dataset.fundname)[0];
            paintDomElements(fundsObj, fundSwichName);
        }
    }
/* ------------------------------------------------*********************************End Painting*****************************----------------------------------------------------------*/

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
        const encryptedArrayBuffer = await readerFunction(financePassword); //isLocalFile ? await getLocalFileContents() : await getServerFileContents();
        const fileString = await getDecryptedString(encryptedArrayBuffer, financePassword);
        return JSON.parse(fileString);
    }
    
    const startApp = async e => {
        e.preventDefault();
        const financePassword = e.target[0].value;
        const isLocal = window.initLocal;
        const readerFunction = isLocal ? getLocalFileContents : getServerFileContents;// location.protocol === "file:";
        let fundsJson;
        try{
            fundsJson = await readFinanceDb(financePassword, readerFunction);
        }catch(e){
            console.log(e);
            return alert("Access Error");
        }

        const fundsObj = new FundsObject(fundsJson);

        paintRemontPieChart = paintRemontPieChart(fundsObj);
        swichFund = swichFund(fundsObj);
        paintDomElements(fundsObj, 'remont');
        window.addEventListener("resize", setDomElsSize);
        e.target.forebear(2).kill();
        
        if (isLocal) initLocal(fundsObj, financePassword)
    }

    //const initApp = (_ => {
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
    //})();



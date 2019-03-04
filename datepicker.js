document.addEventListener('DOMContentLoaded', function () {
    class datePicker extends HTMLElement {
        constructor() {
            super();
            var shadow = this.attachShadow({ mode: 'open' });
            const style = document.createElement('style');
            style.textContent = `
        .datePicker-clickable{
            background-color:grey;
        }
        .show{
            display:block !important;
        }
        .date-pickable{
            text-align: center;
            cursor:pointer;
        }
        .date-pickable::after{
            position: absolute;
            width: 30px;
            height: 30px;
            top:50%;
            left:50%;
            transform: translate(-50%,-50%);
            border-radius: 50%;
            content: "";
            z-index:-1;
        }
        .date-pickable:hover::after{
            background-color: var(--main-picker-color,#3164f9);
        }
        .date-pickable:hover{
            color:white;
        }
        .selected{
            color:white;
        }
        .selected::after{
            background-color: var(--main-picker-color,#3164f9);
        }
        .datePicker-picker td{
            position: relative;
            padding:0.7em;
        }
        .datePicker-picker p{
            text-align: center;
        }
        .datePicker-picker{
            position:absolute;
            float:left;
            clear:both;
            display:none;
            max-width:300px;
        }
        .datePicker-picker
        {
            width:100%;
            z-index:1000;
        }
        .datePicker-picker table{
            width:100%;
        }
        .date-picker-header{
            position: relative;
            background-color: var(--main-picker-color,#3164f9);
            color:white;
        }
        .date-picker-header .dayFull{
            background-color: var(--main-picker-hover-color,#0742f0);
            height: 2em;
        }
        .dayFull p{
            position: relative;
            top:50%;
            transform: translateY(-50%);
        }
        .precedent{
            position:relative;
            left:0;
        }
        .suivant{
            position:absolute;
            right:0;
        }
        .date-picker-hours{
            position:relative;
            background-color: var(--main-picker-color,#3164f9);
            height:3em;
        }
        .date-picker-timediv{
            position:absolute;
            top:50%;
            left:50%;
            transform:translate(-50%,-50%);
        }
        .date-picker-timediv input{
            position:relative; 
            width:3em;
            max-width:50px;
        }
        .date-picker-timediv p{
            margin:0;
            display:inline;
            color:white;
            margin-left:0.5em;
            margin-right:0.5em;
        }
        .date-picker-validation{
            position:relative;
            background-color: var(--main-picker-color,#3164f9);
            padding: 0 0 0 8em;
        }
        .date-picker-validation button{
            margin:1em;
        }
        `;
            shadow.appendChild(style);
        }
        connectedCallback() {
            let shortDay = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
            let fullDay = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
            let mois = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "aout", "septembre", "octobre", "novembre", "decembre"];
            let tbody;
            let header;
            let daySelected;
            let visible = false;
            let input;
            let root = this.shadowRoot;
            let shadow = this;
            let realInput;

            let type;
            let readOnly = false;

            function selectDate(datePicker) {
                let dateStr = input.getAttribute('value');
                let dateSplit = dateStr.split(' ');
                dateStr = dateSplit[0];
                let dateHours = dateSplit[1];
                dateSplit = dateStr.split('/');
                let day = dateSplit[0];
                let month = dateSplit[1] - 1;
                let year = dateSplit[2];
                let hours = 0;
                let minute = 0;
                if (type == "datetime") {
                    hours = root.getElementById('heure').value;
                    minute = root.getElementById('minute').value;
                }
                setNewDate(year, month, day, hours, minute);
                hideDatePicker(datePicker);
            }
            function dayToFrench(day) {
                if (day == 0) {
                    day = 6;
                }
                else if (day == 6) {
                    day = 5;
                }
                else {
                    day = day - 1;
                }
                return day;
            }
            function showDatePicker(datePicker) {
                if (!visible && !readOnly) {
                    datePicker.classList.add('show');
                    visible = true;
                }
            }
            function hideDatePicker(datePicker) {
                if (visible) {
                    datePicker.classList.remove('show');
                    visible = false;
                }
            }
            function selectDay(day) {
                if (daySelected != null) {
                    daySelected.classList.remove('selected');
                    daySelected = day;
                    daySelected.classList.add('selected');
                }
                else {
                    daySelected = day;
                    daySelected.classList.add('selected');
                }
            }
            function infTen(value) {
                if (value < 10) {
                    return "0" + value;
                }
                return value;
            }
            function formatDate(date) {
                let day = infTen(date.getDate());
                let month = infTen(date.getMonth() + 1);
                let year = date.getFullYear();
                let heure = infTen(date.getHours());
                let minutes = infTen(date.getMinutes());
                if (type == "datetime") {
                    return day + "/" + month + "/" + year + " " + heure + ":" + minutes + ":00";
                }
                else if (type == "date") {
                    return day + "/" + month + "/" + year;
                }
            }
            function setDate(annee, mois, jour, heure, minute) {
                let date = new Date(annee, mois, jour, heure, minute);
                input.setAttribute('value', formatDate(date));
                input.value = formatDate(date);
                let event = new Event('change');
                input.dispatchEvent(event);
            }
            function setNewDate(anneeRef, moisRef, jourRef, heureRef, minuteRef) {
                header.innerHTML = "";
                tbody.innerHTML = "";
                makeDate(anneeRef, moisRef, jourRef, heureRef, minuteRef);
                setDate(anneeRef, moisRef, jourRef, heureRef, minuteRef);
            }
            function calculateRow(firstDay, lastDay) {
                let start = dayToFrench(firstDay.getDay());
                let stop = lastDay.getDate()
                let nbRow = 1;
                let cpt = start;
                let cptDay = 1;
                while (cptDay < stop) {
                    if (cpt == 6) {
                        nbRow++;
                        cpt = 0;
                    }
                    else {
                        cpt++;
                    }
                    cptDay++;
                }
                return nbRow;
            }
            function makeDate(anneeRef, moisRef, jourRef, heureRef, minuteRef) {
                let today = new Date(anneeRef, moisRef, jourRef, heureRef, minuteRef);
                let month = today.getMonth();
                let year = today.getFullYear();
                let day = today.getDay();
                let dayOfMonth = today.getDate();
                let firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                let lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                let stop = lastDay.getDate();
                day = dayToFrench(day);
                let init = true;
                let cpt = 1;
                let start = dayToFrench(firstDay.getDay());
                let nbRow = calculateRow(firstDay, lastDay);
                for (let i = 0; i < nbRow; i++) {
                    let tr = document.createElement('tr');
                    for (let y = 0; y < 7; y++) {
                        let td = document.createElement('td');
                        if (init) {
                            if (y == start) {
                                td.innerHTML = cpt;
                                init = false;
                                td.classList.add('date-pickable');
                                td.addEventListener('click', function () {
                                    selectDay(this);
                                    setNewDate(anneeRef, moisRef, this.innerHTML, heureRef, minuteRef);
                                })
                            }
                            else {
                                td.classList.add('empty');
                            }
                            tr.appendChild(td);
                        }
                        else {
                            if (cpt <= stop) {
                                td.innerHTML = cpt;
                                td.classList.add('date-pickable');
                                td.addEventListener('click', function () {
                                    selectDay(this);
                                    setNewDate(anneeRef, moisRef, this.innerHTML, heureRef, minuteRef);
                                })
                            }
                            else {
                                td.classList.add('empty');
                            }
                            tr.appendChild(td);
                        }
                        if (cpt == dayOfMonth) {
                            setDate(anneeRef, moisRef, jourRef, heureRef, minuteRef);
                            selectDay(td);
                        }
                        if (!init) {
                            cpt++;
                        }
                    }
                    tbody.appendChild(tr);
                }
                let divDay = document.createElement('div');
                let dayFull = document.createElement('p');
                divDay.classList.add('dayFull');
                dayFull.innerHTML = fullDay[day];
                divDay.appendChild(dayFull);
                header.appendChild(divDay);
                let divMois = document.createElement('div');
                let moisInfo = document.createElement('p');
                moisInfo.innerHTML = mois[month] + " " + year;
                divMois.appendChild(moisInfo);
                header.appendChild(divMois);
                let buttonDiv = document.createElement('div');
                let precedent = document.createElement('button');
                precedent.classList.add('precedent');
                precedent.innerHTML = "Précédent";
                precedent.addEventListener('click', function () {
                    setNewDate(anneeRef, moisRef - 1, jourRef, heureRef, minuteRef);
                });
                let suivant = document.createElement('button');
                suivant.classList.add('suivant');
                suivant.innerHTML = "Suivant";
                suivant.addEventListener('click', function () {
                    setNewDate(anneeRef, moisRef + 1, jourRef, heureRef, minuteRef);
                });
                buttonDiv.appendChild(precedent);
                buttonDiv.appendChild(suivant);
                header.appendChild(buttonDiv);
                setDate(anneeRef, moisRef, jourRef, heureRef, minuteRef);
            }
            function initDatePicker() {
                let datePicker = document.createElement("div");
                realInput.type = "text";
                shadow.appendChild(realInput);
                input = document.createElement('input');
                input.setAttribute('type', 'text');
                input.setAttribute('placeholder', 'choisir une date');
                input.setAttribute("readonly", '');
                input.id = "input";
                input.addEventListener('click', function () {
                    showDatePicker(datePicker);
                });
                root.appendChild(input);
                datePicker.classList.add("datePicker-picker");
                root.appendChild(datePicker);
                header = document.createElement('div');
                header.classList.add("date-picker-header");
                let table = document.createElement('table');
                let thead = document.createElement('thead');
                shortDay.forEach(shtDay => {
                    let th = document.createElement('th');
                    th.innerHTML = shtDay;
                    thead.appendChild(th);
                });
                let date = new Date();
                tbody = document.createElement('tbody');
                table.appendChild(thead);
                table.appendChild(tbody);
                datePicker.appendChild(header);
                datePicker.appendChild(table);
                let hourSelector = document.createElement('div');
                hourSelector.classList.add('date-picker-hours');
                datePicker.appendChild(hourSelector);

                let timeDiv = document.createElement('div');
                timeDiv.classList.add('date-picker-timediv')
                let heureInput = document.createElement('input');
                heureInput.setAttribute('type', 'number');
                heureInput.setAttribute('value', date.getHours());
                heureInput.setAttribute('min', '0');
                heureInput.setAttribute('max', '23');
                heureInput.setAttribute('id', 'heure');
                let minuteInput = document.createElement('input');
                minuteInput.setAttribute('type', 'number');
                minuteInput.setAttribute('value', date.getMinutes());
                minuteInput.setAttribute('min', '0');
                minuteInput.setAttribute('max', '59');
                minuteInput.setAttribute('id', 'minute');

                let h = document.createElement('p');
                h.innerHTML = "H";
                console.log(type);
                if (type == "datetime") {
                    timeDiv.appendChild(heureInput);
                    timeDiv.appendChild(h);
                    timeDiv.appendChild(minuteInput);
                    hourSelector.appendChild(timeDiv);
                }
                let buttonValidator = document.createElement('div');
                buttonValidator.classList.add('date-picker-validation');

                let buttonCancel = document.createElement('button');
                buttonCancel.innerHTML = "Annuler";
                buttonCancel.addEventListener('click', function () {
                    hideDatePicker(datePicker);
                });
                let buttonValidate = document.createElement('button');
                buttonValidate.innerHTML = "OK";
                buttonValidator.appendChild(buttonCancel);
                buttonValidator.appendChild(buttonValidate);
                buttonValidator.addEventListener('click', function () {
                    selectDate(datePicker);
                });
                datePicker.appendChild(buttonValidator);
            }
            if (this.hasAttribute('name')) {
                realInput = document.createElement('input');
                realInput.setAttribute('name', this.getAttribute('name'));
                realInput.setAttribute('id', "realInput");
                realInput.addEventListener('change', function () {
                    input.setAttribute('value', realInput.getAttribute('value'));
                    input.value=realInput.getAttribute('value');
                });
            }
            else {
                throw "attribute name required";
            }
            if (this.hasAttribute('type')) {
                type = this.getAttribute('type');
            }
            else {
                throw "Attribute type required";
            }
            if (this.hasAttribute('readonly')) {
                readOnly = true;
            }
            initDatePicker();
            var observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.type == "attributes") {
                        let event = new Event('change');
                        realInput.dispatchEvent(event);
                    }
                });
            });
            observer.observe(realInput, {
                attributes: true
            });
            input.addEventListener('change', function () {
                realInput.setAttribute('value', input.getAttribute('value'));
            });
            let date = new Date();
            makeDate(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes());
        }
    }
    datePicker.observedAttributes = ["value"];
    customElements.define('date-picker', datePicker);
});
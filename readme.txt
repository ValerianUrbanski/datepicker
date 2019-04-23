To use this:

- use <date-picker name="(name that will be send to the form)" type="datetime or date"></date-picker>
date = date without hours (day/month/year)
datetime = date and hours (day/month/year hours:minutes:seconds)

added : 

datePicker.setDate(yourDate)=> format must be dd/MM/yyyy OR dd/MM/yyyy HH:mm 

datePicker.getDate() => return the displayed Date

attribute readonly makes modifiable only via javascript

you can customize color using : 

--main-picker-color
--main-picker-hover-color
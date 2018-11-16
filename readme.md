# Nettside for Nesttun Indremisjons Barnehage
https://nibarnehage.no

En nettside laget på oppdrag fra Nesttun Indremisjons Barnehage. Her var det fokus på at de ansatte kunne laste opp bilder, filer, og innlegg som de foresatte skal ha tilgang til.

# Funksjoner:
* Adminside hvor de ansatte kan endre tekstbokser på nettsiden
* Adminside hvor de kan laste opp bilder og fjerne bilder
* Laste opp filer som blir konvertert til pdf
* Passordbeskyttet foreldreportal hvor de kan se på bilder som er lastet opp
* Generell info om barnehagen

## Requirements
mongodb

nodejs (tested version 7.\*)

## Initialisering
```
npm install
node index
```
Endre secret i "./config.js" for password hashing

Legg til en bruker POST-request til localhost:8080/signup
```
curl -X POST -H "Content-Type: application/x-www-form-urlencoded" -H "Cache-Control: no-cache" -d 'username=USERNAME&password=PASSWORD' "http://localhost:8080/signup"
```
Du må deretter inn i databasen, gjerne via robomongo eller shell og endre admin feltet til true. Dette er ikke mulig via API call


Oppsett av mongodb database:
```
use NIBarnehage
db.pagedata.insert({
    "_id" : ObjectId("5898efd4e9a67d18f0c6ecab"),
    "name" : "index",
    "textBoxes" : {
        "textBox1" : {
            "data" : "textBox1"
        },
        "textBox2" : {
            "data" : "textBox2"
        },
        "textBox3" : {
            "data" : "textBox3"
        },
        "sitat" : {
            "data" : "«Sitat»"
        },
        "textBox5" : {
            "data" : "sitatBox5"
        }
    },
    "edited" : ISODate("2017-02-06T21:51:16.144Z"),
    "added" : ISODate("2017-02-06T21:51:16.144Z"),
    "__v" : 0
});
db.pagedata.insert({
    "_id" : ObjectId("5899017727c39b1910059c9c"),
    "name" : "om-oss",
    "textBoxes" : {
        "textBox1" : {
            "data" : "textBox1"
        },
        "textBox2" : {
            "data" : "textBox2"
        },
        "textBox3" : {
            "data" : "textBox3"
        }
    },
    "edited" : ISODate("2017-02-06T23:06:31.227Z"),
    "added" : ISODate("2017-02-06T23:06:31.226Z"),
    "__v" : 0
});
```


Du kan nå endre data og laste opp bilder på localhost:8080/admin

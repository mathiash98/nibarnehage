# Nettside for Nesttun Indremisjons Barnehage
https://nibarnehage.no

## Initialisering
```
npm install
node index
```

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
